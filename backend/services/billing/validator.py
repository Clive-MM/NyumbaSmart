"""
Billing Validation Service

This module contains all validation logic required before
generating monthly bills.

Responsibilities
----------------
✓ Validate landlord ownership
✓ Validate apartment ownership
✓ Validate billing month
✓ Validate due date
✓ Validate tenant eligibility
✓ Validate rental unit
✓ Prevent duplicate bills
✓ Validate generated bill amounts

Author:
PayNest Billing Engine
"""

from datetime import datetime, date

from models import (
    Apartment,
    RentalUnit,
    Tenant,
    TenantBill
)


class BillingValidationError(Exception):
    """
    Custom exception raised whenever a billing validation fails.
    """
    pass


class BillingValidator:

    # ==========================================================
    # Apartment Validation
    # ==========================================================

    @staticmethod
    def validate_landlord_apartment(
        landlord_id: int,
        apartment_id: int
    ):
        """
        Ensure the apartment exists and belongs
        to the authenticated landlord.
        """

        apartment = Apartment.query.filter_by(
            ApartmentID=apartment_id,
            UserID=landlord_id
        ).first()

        if apartment is None:
            raise BillingValidationError(
                "Apartment not found or you are not authorized to access it."
            )

        return apartment

    # ==========================================================
    # Billing Month Validation
    # ==========================================================

    @staticmethod
    def validate_billing_month(
        billing_month: str
    ) -> date:
        """
        Validate the billing month.

        Expected Format:
            July 2026

        Returns
        -------
        date
            First day of the billing month.
        """

        if not billing_month:
            raise BillingValidationError(
                "Billing month is required."
            )

        try:

            billing_period = datetime.strptime(
                billing_month,
                "%B %Y"
            ).date().replace(day=1)

            return billing_period

        except ValueError:

            raise BillingValidationError(
                "Invalid billing month. Expected format: 'July 2026'."
            )

    # ==========================================================
    # Due Date Validation
    # ==========================================================

    @staticmethod
    def validate_due_date(
        billing_period: date,
        due_date: date
    ):
        """
        Validate the due date of the generated bill.
        """

        if due_date is None:
            raise BillingValidationError(
                "Due date is required."
            )

        if due_date < billing_period:
            raise BillingValidationError(
                "Due date cannot be earlier than the first day of the billing month."
            )

        if due_date < date.today():
            raise BillingValidationError(
                "Due date cannot be in the past."
            )

        return due_date

    # ==========================================================
    # Tenant Validation
    # ==========================================================

    @staticmethod
    def validate_tenant(
        tenant: Tenant,
        billing_period: date
    ):
        """
        Ensure a tenant is eligible for billing.

        Rules
        -----
        ✓ Tenant must exist
        ✓ Tenant must be Active
        ✓ Tenant must not have moved out before the billing period
        """

        if tenant is None:
            raise BillingValidationError(
                "Tenant does not exist."
            )

        status = (tenant.Status or "").strip().lower()

        if status != "active":
            raise BillingValidationError(
                f"Tenant '{tenant.FullName}' is inactive."
            )

        # Tenant moved out before the billing month started
        if (
            tenant.MoveOutDate is not None
            and tenant.MoveOutDate < billing_period
        ):
            raise BillingValidationError(
                f"Tenant '{tenant.FullName}' moved out on "
                f"{tenant.MoveOutDate:%d-%b-%Y}."
            )

        return tenant

    # ==========================================================
    # Rental Unit Validation
    # ==========================================================

    @staticmethod
    def validate_rental_unit(
        unit: RentalUnit
    ):
        """
        Validate rental unit before bill generation.
        """

        if unit is None:
            raise BillingValidationError(
                "Rental unit not found."
            )

        if unit.CurrentTenantID is None:
            raise BillingValidationError(
                f"Rental Unit '{unit.Label}' has no assigned tenant."
            )

        if unit.MonthlyRent <= 0:
            raise BillingValidationError(
                f"Rental Unit '{unit.Label}' has an invalid monthly rent."
            )

        return unit

    # ==========================================================
    # Duplicate Bill Validation
    # ==========================================================

    @staticmethod
    def validate_duplicate_bill(
        landlord_id: int,
        tenant_id: int,
        billing_period: date
    ):
        """
        Prevent duplicate monthly bills.
        """

        existing_bill = TenantBill.query.filter_by(
            LandlordID=landlord_id,
            TenantID=tenant_id,
            BillingPeriod=billing_period
        ).first()

        if existing_bill:
            raise BillingValidationError(
                f"A bill has already been generated for Tenant ID {tenant_id} "
                f"for this billing period."
            )

        return True

    # ==========================================================
    # Bill Amount Validation
    # ==========================================================

    @staticmethod
    def validate_bill_amount(
        amount: float
    ):
        """
        Ensure the generated bill amount is valid.
        """

        if amount is None:
            raise BillingValidationError(
                "Bill amount cannot be empty."
            )

        if amount <= 0:
            raise BillingValidationError(
                "Generated bill amount must be greater than zero."
            )

        return amount