
"""
Billing Calculator

Responsible for all financial calculations performed
by the Billing Engine.

Responsibilities
----------------
- Rent calculation
- Utility calculation
- Previous balance reporting
- Current monthly invoice totals
- Outstanding balance calculation
- Bill status calculation

Billing policy: Option A
------------------------
Each month's invoice contains only that month's rent
and applicable utility charges. Previous unpaid balances
are reported separately and are not added to the new
invoice total.

Author:
PayNest Billing Engine
"""


class BillingCalculator:

    # ==========================================================
    # Calculate Monthly Bill
    # ==========================================================

    @staticmethod
    def calculate_bill(
        monthly_rent: float,
        water: float = 0.0,
        electricity: float = 0.0,
        garbage: float = 0.0,
        internet: float = 0.0,
        carried_forward: float = 0.0,
    ):
        """
        Calculate a tenant's current monthly invoice.

        Args:
            monthly_rent: Rent for the current billing month.
            water: Current month's water charges.
            electricity: Current month's electricity charges.
            garbage: Current month's garbage charges.
            internet: Current month's internet charges.
            carried_forward: Previous unpaid invoice balances,
                reported separately from the current invoice.

        Returns:
            dict: Current-month charges, arrears information,
            and the current invoice total.
        """

        monthly_rent = float(monthly_rent or 0)
        water = float(water or 0)
        electricity = float(electricity or 0)
        garbage = float(garbage or 0)
        internet = float(internet or 0)
        carried_forward = float(carried_forward or 0)

        # Current month's charges only.
        subtotal = (
            monthly_rent
            + water
            + electricity
            + garbage
            + internet
        )

        # Option A: Do not add previous arrears to this invoice.
        total_due = subtotal

        return {
            "RentAmount": round(monthly_rent, 2),
            "WaterBill": round(water, 2),
            "ElectricityBill": round(electricity, 2),
            "Garbage": round(garbage, 2),
            "Internet": round(internet, 2),
            "Subtotal": round(subtotal, 2),
            "CarriedForwardBalance": round(carried_forward, 2),
            "TotalAmountDue": round(total_due, 2),
        }

    # ==========================================================
    # Calculate Outstanding Balance
    # ==========================================================

    @staticmethod
    def calculate_outstanding(
        total_due: float,
        amount_paid: float,
    ):
        """
        Calculate the remaining amount due on one invoice.

        This calculation applies to the specified invoice,
        not the tenant's combined arrears across all invoices.
        """

        total_due = float(total_due or 0)
        amount_paid = float(amount_paid or 0)

        return round(max(total_due - amount_paid, 0.0), 2)

    # ==========================================================
    # Determine Bill Status
    # ==========================================================

    @staticmethod
    def determine_bill_status(
        total_due: float,
        amount_paid: float,
    ):
        """
        Determine the payment status of one invoice.

        Returns:
            Paid
            Unpaid
            Partially Paid
        """

        total_due = float(total_due or 0)
        amount_paid = float(amount_paid or 0)

        outstanding = BillingCalculator.calculate_outstanding(
            total_due=total_due,
            amount_paid=amount_paid,
        )

        if outstanding == 0:
            return "Paid"

        if amount_paid <= 0:
            return "Unpaid"

        return "Partially Paid"
