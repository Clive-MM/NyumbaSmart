from models.models import db, Tenant, RentalUnit, TenantBill, RentPayment
from datetime import date


def calculate_bill_amount(tenant_id: int, base_rent: float,
                          water=0.0, electricity=0.0, garbage=0.0, internet=0.0):
    """
    ✅ Calculates the total bill amount for a tenant.
       Always fetches the latest carried balance from RentPayments.
    Returns (total_due, carried_balance).
    """
    last_payment = (
        RentPayment.query.filter_by(TenantID=tenant_id)
        .order_by(RentPayment.PaymentDate.desc())
        .first()
    )

    carried_balance = last_payment.Balance if last_payment else 0.0

    total_due = (
        base_rent + carried_balance +
        (water or 0.0) + (electricity or 0.0) +
        (garbage or 0.0) + (internet or 0.0)
    )

    return max(total_due, 0.0), carried_balance
