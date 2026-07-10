"""
Billing Calculator

Responsible for all financial calculations performed
by the Billing Engine.

Responsibilities
----------------
✓ Rent calculation
✓ Utility calculation
✓ Previous balances
✓ Bill totals
✓ Outstanding balances
✓ Bill status calculation

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
        Calculate a tenant's monthly bill.
        """

        monthly_rent = float(monthly_rent or 0)
        water = float(water or 0)
        electricity = float(electricity or 0)
        garbage = float(garbage or 0)
        internet = float(internet or 0)
        carried_forward = float(carried_forward or 0)

        subtotal = (
            monthly_rent
            + water
            + electricity
            + garbage
            + internet
        )

        total_due = subtotal + carried_forward

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
    # Outstanding Balance
    # ==========================================================

    @staticmethod
    def calculate_outstanding(
        total_due: float,
        amount_paid: float
    ):
        """
        Calculate remaining balance.
        """

        total_due = float(total_due or 0)
        amount_paid = float(amount_paid or 0)

        return round(max(total_due - amount_paid, 0), 2)

    # ==========================================================
    # Bill Status
    # ==========================================================

    @staticmethod
    def determine_bill_status(
        total_due: float,
        amount_paid: float
    ):
        """
        Determine bill payment status.
        """

        outstanding = BillingCalculator.calculate_outstanding(
            total_due,
            amount_paid
        )

        if outstanding == 0:
            return "Paid"

        if amount_paid == 0:
            return "Unpaid"

        return "Partially Paid"
