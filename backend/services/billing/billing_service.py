"""
Billing Service

Coordinates all billing operations.

Responsibilities
----------------
✓ Generate monthly bills
✓ Future bill regeneration
✓ Future bill cancellation
✓ Future bill recalculation
✓ Future notification dispatch

The Billing Service acts as the public entry point for the
Billing Engine. It delegates work to the appropriate billing
components.

Author:
PayNest Billing Engine
"""

from .generator import BillingGenerator


class BillingService:
    """
    Entry point for all billing-related operations.
    """

    # ==========================================================
    # Generate Monthly Bills
    # ==========================================================

    @staticmethod
    def generate_monthly_bills(
        landlord_id,
        billing_month,
        due_date,
        apartment_id=None,
        include_water=True,
        include_electricity=True,
        include_garbage=True,
        include_internet=True,
    ):
        """
        Generate monthly bills for one apartment or
        all apartments belonging to the landlord.

        Parameters
        ----------
        landlord_id : int

        billing_month : str
            Example:
                "July 2026"

        due_date : date

        apartment_id : int | None

        include_water : bool

        include_electricity : bool

        include_garbage : bool

        include_internet : bool

        Returns
        -------
        dict
            Billing summary.
        """

        return BillingGenerator.generate_monthly_bills(
            landlord_id=landlord_id,
            billing_month=billing_month,
            due_date=due_date,
            apartment_id=apartment_id,
            include_water=include_water,
            include_electricity=include_electricity,
            include_garbage=include_garbage,
            include_internet=include_internet,
        )

    # ==========================================================
    # Future Features
    # ==========================================================

    @staticmethod
    def regenerate_bill(*args, **kwargs):
        """
        Placeholder for bill regeneration.
        """
        raise NotImplementedError(
            "Bill regeneration has not yet been implemented."
        )

    @staticmethod
    def recalculate_bill(*args, **kwargs):
        """
        Placeholder for recalculating an existing bill.
        """
        raise NotImplementedError(
            "Bill recalculation has not yet been implemented."
        )

    @staticmethod
    def cancel_bill(*args, **kwargs):
        """
        Placeholder for bill cancellation.
        """
        raise NotImplementedError(
            "Bill cancellation has not yet been implemented."
        )

    @staticmethod
    def dispatch_notifications(*args, **kwargs):
        """
        Placeholder for notification dispatch.

        Future versions will integrate SMS,
        Email and WhatsApp notifications.
        """
        raise NotImplementedError(
            "Notification dispatch has not yet been implemented."
        )