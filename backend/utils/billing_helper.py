from models.models import db, Tenant, RentalUnit, TenantBill, RentPayment
from datetime import date


def calculate_new_bill(tenant_id: int, base_rent: float) -> float:
    """
    Determines the total due for the new month by considering the tenant's last payment balance.
    - If underpaid → Add balance to new month's rent
    - If overpaid → Deduct extra amount from new month's rent
    - If fully paid → Bill normal rent
    """
    last_payment = (
        RentPayment.query.filter_by(TenantID=tenant_id)
        .order_by(RentPayment.PaymentDate.desc())
        .first()
    )

    carried_balance = last_payment.Balance if last_payment else 0.0
    amount_due = base_rent

    if carried_balance > 0:  # Underpayment
        amount_due += carried_balance
    elif carried_balance < 0:  # Overpayment
        amount_due -= abs(carried_balance)

    return max(amount_due, 0.0)


def generate_monthly_bills():
    """
    Generates base rent bills for all active tenants.
    Utility amounts remain 0.0 and will be updated later by the landlord.
    """
    today = date.today()
    billing_month = today.strftime("%B %Y")
    # Example: Due every 5th of the month
    due_date = date(today.year, today.month, 5)

    active_tenants = Tenant.query.filter_by(Status="Active").all()
    if not active_tenants:
        return {"message": "No active tenants found.", "bills_created": 0}

    bills_created = 0

    for tenant in active_tenants:
        unit = RentalUnit.query.get(tenant.RentalUnitID)
        if not unit:
            continue

        total_due = calculate_new_bill(tenant.TenantID, unit.MonthlyRent)

        new_bill = TenantBill(
            TenantID=tenant.TenantID,
            RentalUnitID=tenant.RentalUnitID,
            BillingMonth=billing_month,
            RentAmount=unit.MonthlyRent,
            WaterBill=0.0,
            ElectricityBill=0.0,
            Garbage=0.0,
            Internet=0.0,
            TotalAmountDue=total_due,
            DueDate=due_date,
            CarriedForwardBalance=0.0,
            BillStatus="Unpaid"
        )

        db.session.add(new_bill)
        bills_created += 1

    db.session.commit()

    return {
        "message": f"✅ {bills_created} base rent bills generated for {billing_month}.",
        "bills_created": bills_created,
        "billing_month": billing_month
    }


def update_bill_utilities(bill_id: int, data: dict):
    """
    Updates utility bills for a specific TenantBill.
    Recalculates the TotalAmountDue after updating utilities.
    """
    bill = TenantBill.query.get(bill_id)
    if not bill:
        return {"message": "❌ Bill not found.", "updated": False}

    # Update provided fields only
    bill.WaterBill = data.get("WaterBill", bill.WaterBill)
    bill.ElectricityBill = data.get("ElectricityBill", bill.ElectricityBill)
    bill.Garbage = data.get("Garbage", bill.Garbage)
    bill.Internet = data.get("Internet", bill.Internet)

    # Recalculate total due (Rent + utilities)
    bill.TotalAmountDue = (
        bill.RentAmount + bill.WaterBill +
        bill.ElectricityBill + bill.Garbage + bill.Internet
    )

    db.session.commit()

    return {
        "message": f"✅ Utilities updated for Bill ID {bill_id}.",
        "updated": True,
        "new_total_due": bill.TotalAmountDue
    }
