"""
Billing Routes

API endpoints for the PayNest Billing Engine.

Responsibilities
----------------
✓ Generate monthly bills
✓ Retrieve billing summaries (future)
✓ Retrieve tenant bills (future)

Author:
PayNest Billing Engine
"""

import logging
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)

from models import User

from services.billing.billing_service import BillingService
from services.billing.validator import BillingValidationError


# ==========================================================
# Logger
# ==========================================================

logger = logging.getLogger(__name__)


# ==========================================================
# Blueprint
# ==========================================================

billing_bp = Blueprint(
    "billing",
    __name__,
)


# ==========================================================
# Generate Monthly Bills
# ==========================================================

@billing_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate_monthly_bills():
    """
    Generate monthly bills.

    Endpoint
    --------
    POST /api/billing/generate

    Expected JSON
    -------------
    {
        "ApartmentID": 5,
        "BillingMonth": "July 2026",
        "DueDate": "2026-07-31",
        "IncludeWater": true,
        "IncludeElectricity": true,
        "IncludeGarbage": true,
        "IncludeInternet": true
    }
    """

    try:

        # --------------------------------------------------
        # Authenticated User
        # --------------------------------------------------

        landlord_id = get_jwt_identity()

        landlord = User.query.filter_by(
            UserID=landlord_id
        ).first()

        if landlord is None:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        # --------------------------------------------------
        # Authorization
        # --------------------------------------------------

        if not landlord.IsAdmin:
            return jsonify({
                "success": False,
                "message": "Only landlords can generate bills."
            }), 403

        # --------------------------------------------------
        # Request Body
        # --------------------------------------------------

        data = request.get_json(silent=True) or {}

        billing_month = data.get("BillingMonth")
        due_date_string = data.get("DueDate")

        apartment_id = data.get("ApartmentID")

        if apartment_id not in (None, ""):
            try:
                apartment_id = int(apartment_id)
            except (TypeError, ValueError):
                return jsonify({
                    "success": False,
                    "message": "ApartmentID must be a valid integer."
                }), 400
        else:
            apartment_id = None

        include_water = data.get("IncludeWater", True)
        include_electricity = data.get("IncludeElectricity", True)
        include_garbage = data.get("IncludeGarbage", True)
        include_internet = data.get("IncludeInternet", True)

        # --------------------------------------------------
        # Validation
        # --------------------------------------------------

        if not billing_month:
            return jsonify({
                "success": False,
                "message": "Billing month is required."
            }), 400

        if not due_date_string:
            return jsonify({
                "success": False,
                "message": "Due date is required."
            }), 400

        try:

            due_date = datetime.strptime(
                due_date_string,
                "%Y-%m-%d"
            ).date()

        except ValueError:

            return jsonify({
                "success": False,
                "message": "Due date must be in YYYY-MM-DD format."
            }), 400

        # --------------------------------------------------
        # Generate Bills
        # --------------------------------------------------

        summary = BillingService.generate_monthly_bills(
            landlord_id=landlord_id,
            billing_month=billing_month,
            due_date=due_date,
            apartment_id=apartment_id,
            include_water=include_water,
            include_electricity=include_electricity,
            include_garbage=include_garbage,
            include_internet=include_internet,
        )

        return jsonify({
            "success": True,
            "message": "Bills generated successfully.",
            "summary": summary
        }), 201

    # ------------------------------------------------------
    # Billing Validation Errors
    # ------------------------------------------------------

    except BillingValidationError as e:

        logger.warning(f"Billing validation failed: {e}")

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

    # ------------------------------------------------------
    # Unexpected Errors
    # ------------------------------------------------------

    except Exception as e:

        logger.exception("Unexpected error while generating bills.")

        return jsonify({
            "success": False,
            "message": "Unexpected server error.",
            "error": str(e)
        }), 500