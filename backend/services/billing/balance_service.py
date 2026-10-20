
"""
Balance Service

Responsible for calculating invoice balances, tenant arrears,
total outstanding balances, and available tenant credit.

Billing Policy: Option A
------------------------
- Each month has its own invoice.
- Previous unpaid invoices remain open.
- Arrears are calculated separately from current invoices.
- Explicit payment allocations are the primary source of truth.
- Excess payments are retained as tenant credit.
- Ambiguous legacy payments are not automatically allocated.
"""

from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import func

from models import TenantBill, PaymentAllocation, RentPayment


class BalanceService:
    """Calculate invoice balances, arrears, and tenant credit."""

    # ==========================================================
    # Internal Helpers
    # ==========================================================

    @staticmethod
    def _money(value) -> Decimal:
        """Convert a monetary value to a two-decimal Decimal."""
        return Decimal(str(value or 0)).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

    @staticmethod
    def _get_matching_bills(
        tenant_id: int,
        rental_unit_id: int,
        billing_month: str,
    ) -> list:
        """Find invoices matching a tenant, unit, and month."""
        return (
            TenantBill.query
            .filter(
                TenantBill.TenantID == tenant_id,
                TenantBill.RentalUnitID == rental_unit_id,
                TenantBill.BillingMonth == billing_month,
            )
            .order_by(TenantBill.BillID.asc())
            .all()
        )

    @staticmethod
    def _get_unallocated_legacy_payments(
        bill: TenantBill,
    ) -> list:
        """
        Return historical payments without allocation records
        that can be safely matched to exactly one invoice.

        If multiple invoices match the same tenant, unit, and
        billing month, do not automatically assign the payments.
        """
        matching_bills = BalanceService._get_matching_bills(
            tenant_id=bill.TenantID,
            rental_unit_id=bill.RentalUnitID,
            billing_month=bill.BillingMonth,
        )

        if len(matching_bills) != 1:
            return []

        allocated_payment_ids = (
            PaymentAllocation.query
            .with_entities(PaymentAllocation.PaymentID)
        )

        return (
            RentPayment.query
            .filter(
                RentPayment.TenantID == bill.TenantID,
                RentPayment.RentalUnitID == bill.RentalUnitID,
                RentPayment.BillingMonth == bill.BillingMonth,
                ~RentPayment.PaymentID.in_(allocated_payment_ids),
            )
            .order_by(
                RentPayment.PaymentDate.asc(),
                RentPayment.PaymentID.asc(),
            )
            .all()
        )

    # ==========================================================
    # Payment Allocation Helpers
    # ==========================================================

    @staticmethod
    def get_bill_allocated_amount(bill_id: int) -> float:
        """Return the total amount allocated to an invoice."""
        total = (
            PaymentAllocation.query
            .with_entities(
                func.coalesce(
                    func.sum(PaymentAllocation.AllocatedAmount),
                    0,
                )
            )
            .filter(PaymentAllocation.BillID == bill_id)
            .scalar()
        )

        return float(BalanceService._money(total))

    @staticmethod
    def get_payment_allocated_amount(payment_id: int) -> float:
        """Return the total amount allocated from a payment."""
        total = (
            PaymentAllocation.query
            .with_entities(
                func.coalesce(
                    func.sum(PaymentAllocation.AllocatedAmount),
                    0,
                )
            )
            .filter(PaymentAllocation.PaymentID == payment_id)
            .scalar()
        )

        return float(BalanceService._money(total))

    # ==========================================================
    # Invoice Outstanding Balance
    # ==========================================================

    @staticmethod
    def get_bill_outstanding(bill: TenantBill) -> float:
        """
        Calculate the outstanding balance for one invoice.

        Explicit allocations are counted first. Legacy payments
        without allocation records are counted only when they can
        be matched unambiguously to this invoice.
        """
        total_due = BalanceService._money(bill.TotalAmountDue)

        allocated = BalanceService._money(
            BalanceService.get_bill_allocated_amount(bill.BillID)
        )

        legacy_payments = (
            BalanceService._get_unallocated_legacy_payments(bill)
        )

        legacy_paid = sum(
            (
                BalanceService._money(payment.AmountPaid)
                for payment in legacy_payments
            ),
            Decimal("0.00"),
        )

        outstanding = total_due - allocated - legacy_paid

        return float(max(outstanding, Decimal("0.00")))

    # ==========================================================
    # Open Invoices
    # ==========================================================

    @staticmethod
    def get_open_bills(
        tenant_id: int,
        before_period=None,
    ) -> list:
        """
        Return invoices with positive outstanding balances.

        If before_period is supplied, only invoices with a
        BillingPeriod earlier than that date are considered.
        """
        query = TenantBill.query.filter(
            TenantBill.TenantID == tenant_id
        )

        if before_period is not None:
            query = query.filter(
                TenantBill.BillingPeriod < before_period
            )

        bills = query.order_by(
            TenantBill.BillingPeriod.asc(),
            TenantBill.BillID.asc(),
        ).all()

        open_bills = []

        for bill in bills:
            outstanding = BalanceService.get_bill_outstanding(bill)

            if outstanding > 0:
                open_bills.append({
                    "bill": bill,
                    "outstanding": outstanding,
                })

        return open_bills

    # ==========================================================
    # Previous Arrears
    # ==========================================================

    @staticmethod
    def calculate_carried_forward(
        tenant_id: int,
        before_period,
    ) -> float:
        """
        Calculate arrears from invoices before a specified period.

        Under Option A, this is a reporting figure only.
        It must not be added to a newly generated invoice.
        """
        open_bills = BalanceService.get_open_bills(
            tenant_id=tenant_id,
            before_period=before_period,
        )

        total_arrears = sum(
            (
                BalanceService._money(item["outstanding"])
                for item in open_bills
            ),
            Decimal("0.00"),
        )

        return float(total_arrears)

    # ==========================================================
    # Total Tenant Outstanding
    # ==========================================================

    @staticmethod
    def get_total_outstanding(tenant_id: int) -> float:
        """Return the outstanding balance across all tenant invoices."""
        open_bills = BalanceService.get_open_bills(
            tenant_id=tenant_id
        )

        total = sum(
            (
                BalanceService._money(item["outstanding"])
                for item in open_bills
            ),
            Decimal("0.00"),
        )

        return float(total)

    # ==========================================================
    # Available Tenant Credit
    # ==========================================================

    @staticmethod
    def calculate_credit(tenant_id: int) -> float:
        """
        Calculate available tenant credit.

        For payments with allocation records:
            Credit = payment amount - total allocated amount,
            never below zero.

        For legacy payments without allocations:
            Apply the payment conceptually to the remaining
            balance of its uniquely matching invoice. Any excess
            becomes credit.

        Legacy payments without a unique invoice match are
        excluded from automatic credit calculation pending
        reconciliation.
        """
        payments = (
            RentPayment.query
            .filter(RentPayment.TenantID == tenant_id)
            .order_by(
                RentPayment.PaymentDate.asc(),
                RentPayment.PaymentID.asc(),
            )
            .all()
        )

        bills = (
            TenantBill.query
            .filter(TenantBill.TenantID == tenant_id)
            .order_by(
                TenantBill.BillingPeriod.asc(),
                TenantBill.BillID.asc(),
            )
            .all()
        )

        bills_by_key = {}

        for bill in bills:
            key = (
                bill.TenantID,
                bill.RentalUnitID,
                bill.BillingMonth,
            )
            bills_by_key.setdefault(key, []).append(bill)

        # Remaining invoice balances after explicit allocations.
        remaining_by_bill = {}

        for bill in bills:
            total_due = BalanceService._money(
                bill.TotalAmountDue
            )
            allocated = BalanceService._money(
                BalanceService.get_bill_allocated_amount(
                    bill.BillID
                )
            )

            remaining_by_bill[bill.BillID] = max(
                total_due - allocated,
                Decimal("0.00"),
            )

        credit_total = Decimal("0.00")

        for payment in payments:
            payment_amount = BalanceService._money(
                payment.AmountPaid
            )

            has_allocations = (
                PaymentAllocation.query
                .filter(
                    PaymentAllocation.PaymentID == payment.PaymentID
                )
                .first()
                is not None
            )

            if has_allocations:
                allocated = BalanceService._money(
                    BalanceService.get_payment_allocated_amount(
                        payment.PaymentID
                    )
                )

                credit_total += max(
                    payment_amount - allocated,
                    Decimal("0.00"),
                )
                continue

            key = (
                payment.TenantID,
                payment.RentalUnitID,
                payment.BillingMonth,
            )
            matching_bills = bills_by_key.get(key, [])

            # Do not guess which invoice this payment belongs to.
            if len(matching_bills) != 1:
                continue

            bill = matching_bills[0]
            remaining = remaining_by_bill[bill.BillID]

            applied = min(payment_amount, remaining)
            excess = max(
                payment_amount - applied,
                Decimal("0.00"),
            )

            remaining_by_bill[bill.BillID] = max(
                remaining - applied,
                Decimal("0.00"),
            )

            credit_total += excess

        return float(credit_total)
