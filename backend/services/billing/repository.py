"""
Billing Repository

Handles all Billing Engine database operations.

Responsibilities
----------------
✓ Retrieve landlord apartments
✓ Retrieve rental units
✓ Retrieve current tenants
✓ Retrieve existing bills
✓ Create new bills
✓ Save database changes
✓ Rollback failed transactions

Author:
PayNest Billing Engine
"""

from models import (
    db,
    Apartment,
    RentalUnit,
    Tenant,
    TenantBill
)


class BillingRepository:

    # ==========================================================
    # Apartments
    # ==========================================================

    @staticmethod
    def get_landlord_apartments(landlord_id):
        """
        Retrieve all apartments owned by the landlord.
        """
        return Apartment.query.filter_by(
            UserID=landlord_id
        ).all()

    @staticmethod
    def get_apartment(landlord_id, apartment_id):
        """
        Retrieve a single apartment owned by the landlord.
        """
        return Apartment.query.filter_by(
            ApartmentID=apartment_id,
            UserID=landlord_id
        ).first()

    # ==========================================================
    # Rental Units
    # ==========================================================

    @staticmethod
    def get_apartment_units(apartment_id):
        """
        Retrieve all rental units belonging to an apartment.
        """
        return RentalUnit.query.filter_by(
            ApartmentID=apartment_id
        ).all()

    @staticmethod
    def get_rental_unit(unit_id):
        """
        Retrieve a rental unit by its ID.
        """
        return RentalUnit.query.get(unit_id)

    # ==========================================================
    # Current Tenant
    # ==========================================================

    @staticmethod
    def get_current_tenant(unit):
        """
        Retrieve the tenant currently occupying
        the specified rental unit.

        RentalUnit.CurrentTenantID is treated as the
        source of truth.
        """

        if unit.CurrentTenantID is None:
            return None

        return Tenant.query.get(unit.CurrentTenantID)

    @staticmethod
    def get_tenant(tenant_id):
        """
        Retrieve a tenant by primary key.
        """
        return Tenant.query.get(tenant_id)

    # ==========================================================
    # Bills
    # ==========================================================

    @staticmethod
    def get_existing_bill(
        landlord_id,
        tenant_id,
        billing_period
    ):
        """
        Retrieve an existing bill for a tenant
        in a specific billing period.
        """

        return TenantBill.query.filter_by(
            LandlordID=landlord_id,
            TenantID=tenant_id,
            BillingPeriod=billing_period
        ).first()

    @staticmethod
    def create_bill(**kwargs):
        """
        Create a TenantBill object.

        The object is added to the session
        but NOT committed.
        """

        bill = TenantBill(**kwargs)

        db.session.add(bill)

        return bill

    @staticmethod
    def save_bill(bill):
        """
        Add an existing bill object to the session.

        Does not commit.
        """

        db.session.add(bill)

    # ==========================================================
    # Transactions
    # ==========================================================

    @staticmethod
    def flush():
        """
        Flush pending SQL statements without committing.

        Useful when generated IDs are required before
        committing the transaction.
        """

        db.session.flush()

    @staticmethod
    def rollback():
        """
        Roll back the current transaction.
        """

        db.session.rollback()