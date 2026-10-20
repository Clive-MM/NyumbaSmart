
"""
Billing Generator

Responsible for generating monthly bills.

Workflow
--------
1. Validate request
2. Load apartments
3. Load rental units
4. Load current tenants
5. Prevent duplicate bills
6. Calculate current-month charges
7. Create separate monthly invoices
8. Commit transaction
9. Return summary

Billing Policy: Option A
------------------------
Each month's invoice contains only the charges for that month.
Previous unpaid invoices remain separate and are not added to
the new invoice total.

Author:
PayNest Billing Engine
"""

from models import db

from .validator import (
    BillingValidator,
    BillingValidationError,
)

from .repository import BillingRepository
from .calculator import BillingCalculator


class BillingGenerator:
    """
    Generates monthly tenant bills.

    Previous unpaid invoices remain open. Arrears are calculated
    separately by BalanceService and are not added to new invoices.
    """

    # ==========================================================
    # Public Entry Point
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
        Generate monthly invoices for one apartment or all
        apartments belonging to the landlord.

        Returns
        -------
        dict
            Summary of generated, skipped, and failed invoices.
        """

        summary = {
            "billingMonth": billing_month,
            "apartmentName": None,
            "generated": 0,
            "skipped": 0,
            "failed": 0,
            "processed": 0,
            "expectedRevenue": 0.0,
            "bills": [],
        }

        try:
            # ---------------------------------------------
            # Validate Request
            # ---------------------------------------------

            billing_period = BillingValidator.validate_billing_month(
                billing_month
            )

            BillingValidator.validate_due_date(
                billing_period,
                due_date,
            )

            # ---------------------------------------------
            # Load Apartments
            # ---------------------------------------------

            apartments = BillingGenerator._load_apartments(
                landlord_id=landlord_id,
                apartment_id=apartment_id,
            )

            # ---------------------------------------------
            # Billing Summary Context
            # ---------------------------------------------

            if apartment_id:
                summary["apartmentName"] = apartments[0].ApartmentName
            else:
                summary["apartmentName"] = "All Apartments"

            # ---------------------------------------------
            # Process Apartments
            # ---------------------------------------------

            for apartment in apartments:
                BillingGenerator._generate_for_apartment(
                    landlord_id=landlord_id,
                    apartment=apartment,
                    billing_month=billing_month,
                    billing_period=billing_period,
                    due_date=due_date,
                    include_water=include_water,
                    include_electricity=include_electricity,
                    include_garbage=include_garbage,
                    include_internet=include_internet,
                    summary=summary,
                )

            # ---------------------------------------------
            # Commit Everything
            # ---------------------------------------------

            db.session.commit()

            summary["expectedRevenue"] = round(
                summary["expectedRevenue"],
                2,
            )

            summary["processed"] = (
                summary["generated"]
                + summary["skipped"]
                + summary["failed"]
            )

            return summary

        except BillingValidationError:
            BillingRepository.rollback()
            raise

        except Exception:
            BillingRepository.rollback()
            raise

    # ==========================================================
    # Load Apartments
    # ==========================================================

    @staticmethod
    def _load_apartments(
        landlord_id,
        apartment_id=None,
    ):
        """
        Load one apartment belonging to the landlord,
        or all apartments belonging to the landlord.
        """

        if apartment_id:
            apartment = BillingValidator.validate_landlord_apartment(
                landlord_id,
                apartment_id,
            )

            return [apartment]

        return BillingRepository.get_landlord_apartments(
            landlord_id
        )

    # ==========================================================
    # Generate Bills For Apartment
    # ==========================================================

    @staticmethod
    def _generate_for_apartment(
        landlord_id,
        apartment,
        billing_month,
        billing_period,
        due_date,
        include_water,
        include_electricity,
        include_garbage,
        include_internet,
        summary,
    ):
        """
        Generate invoices for every eligible rental unit
        inside one apartment.
        """

        units = BillingRepository.get_apartment_units(
            apartment.ApartmentID
        )

        for unit in units:
            BillingGenerator._generate_for_unit(
                landlord_id=landlord_id,
                apartment=apartment,
                unit=unit,
                billing_month=billing_month,
                billing_period=billing_period,
                due_date=due_date,
                include_water=include_water,
                include_electricity=include_electricity,
                include_garbage=include_garbage,
                include_internet=include_internet,
                summary=summary,
            )

    # ==========================================================
    # Generate Bill For One Unit
    # ==========================================================

    @staticmethod
    def _generate_for_unit(
        landlord_id,
        apartment,
        unit,
        billing_month,
        billing_period,
        due_date,
        include_water,
        include_electricity,
        include_garbage,
        include_internet,
        summary,
    ):
        """
        Generate one invoice for the current tenant of a unit.

        The invoice contains current-month charges only.
        Previous unpaid invoices are not modified.
        """

        tenant = None

        try:
            # ---------------------------------------------
            # Validate Rental Unit
            # ---------------------------------------------

            BillingValidator.validate_rental_unit(unit)

            # ---------------------------------------------
            # Retrieve Current Tenant
            # ---------------------------------------------

            tenant = BillingRepository.get_current_tenant(unit)

            if tenant is None:
                summary["skipped"] += 1

                summary["bills"].append({
                    "RentalUnit": unit.Label,
                    "Status": "Skipped",
                    "Reason": "Rental unit has no current tenant.",
                })

                return

            # ---------------------------------------------
            # Validate Tenant
            # ---------------------------------------------

            BillingValidator.validate_tenant(
                tenant,
                billing_period,
            )

            # ---------------------------------------------
            # Prevent Duplicate Bills
            # ---------------------------------------------

            BillingValidator.validate_duplicate_bill(
                landlord_id=landlord_id,
                tenant_id=tenant.TenantID,
                billing_period=billing_period,
            )

            # ---------------------------------------------
            # Utility Charges
            # Version 1
            # ---------------------------------------------
            #
            # Utility amounts remain zero until the actual
            # utility charge source is integrated.
            # The include flags are retained for API compatibility.
            # ---------------------------------------------

            water = 0.0 if include_water else 0.0
            electricity = 0.0 if include_electricity else 0.0
            garbage = 0.0 if include_garbage else 0.0
            internet = 0.0 if include_internet else 0.0

            # ---------------------------------------------
            # Calculate Current-Month Invoice
            # ---------------------------------------------
            #
            # Option A: Previous arrears are not passed into
            # this calculation. They remain on their original
            # invoices and are calculated separately by
            # BalanceService for statements and reporting.
            # ---------------------------------------------

            calculated_bill = BillingCalculator.calculate_bill(
                monthly_rent=unit.MonthlyRent,
                water=water,
                electricity=electricity,
                garbage=garbage,
                internet=internet,
                carried_forward=0.0,
            )

            # ---------------------------------------------
            # Validate Invoice Amount
            # ---------------------------------------------

            BillingValidator.validate_bill_amount(
                calculated_bill["TotalAmountDue"]
            )

            # ---------------------------------------------
            # Prepare Invoice Data
            # ---------------------------------------------

            bill_data = {
                "TenantID": tenant.TenantID,
                "RentalUnitID": unit.UnitID,
                "LandlordID": landlord_id,
                "BillingMonth": billing_month,
                "BillingPeriod": billing_period,
                "RentAmount": calculated_bill["RentAmount"],
                "WaterBill": calculated_bill["WaterBill"],
                "ElectricityBill": calculated_bill["ElectricityBill"],
                "Garbage": calculated_bill["Garbage"],
                "Internet": calculated_bill["Internet"],

                # Option A: Do not duplicate previous arrears
                # on the newly generated invoice.
                "CarriedForwardBalance": 0.0,

                # Current month's charges only.
                "TotalAmountDue": calculated_bill["TotalAmountDue"],
                "DueDate": due_date,
                "BillStatus": BillingCalculator.determine_bill_status(
                    calculated_bill["TotalAmountDue"],
                    0.0,
                ),
            }

            # ---------------------------------------------
            # Save Invoice
            # ---------------------------------------------

            BillingRepository.create_bill(**bill_data)

            # ---------------------------------------------
            # Update Summary
            # ---------------------------------------------

            current_month_amount = calculated_bill["TotalAmountDue"]

            summary["generated"] += 1
            summary["expectedRevenue"] += current_month_amount

            summary["bills"].append({
                "TenantID": tenant.TenantID,
                "TenantName": tenant.FullName,
                "RentalUnit": unit.Label,
                "Amount": current_month_amount,
                "Status": "Generated",
            })

        except BillingValidationError as ex:
            summary["skipped"] += 1

            summary["bills"].append({
                "TenantID": getattr(tenant, "TenantID", None),
                "TenantName": getattr(tenant, "FullName", None),
                "RentalUnit": unit.Label,
                "Status": "Skipped",
                "Reason": str(ex),
            })

        except Exception as ex:
            summary["failed"] += 1

            summary["bills"].append({
                "TenantID": getattr(tenant, "TenantID", None),
                "TenantName": getattr(tenant, "FullName", None),
                "RentalUnit": unit.Label,
                "Status": "Failed",
                "Reason": str(ex),
            })

            # Preserve the existing all-or-nothing transaction
            # behavior: unexpected failures roll back generation.
            raise
