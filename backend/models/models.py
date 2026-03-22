from sqlalchemy import Index, UniqueConstraint, CheckConstraint, Numeric, func
from datetime import datetime, date
from decimal import Decimal
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy


# 👉 These come from SQLAlchemy, not flask_sqlalchemy
db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'Users'

    UserID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    FullName = db.Column(db.String(100), nullable=False)

    # Auth basics
    Email = db.Column(db.String(120), unique=True, nullable=False)
    Password = db.Column(db.String(200), nullable=False)

    # Legacy phone (keep for display/imports)
    Phone = db.Column(db.String(20))

    # ✅ Canonical phone for Twilio (store E.164: +2547XXXXXXX)
    # Phase 1: allow NULL so we can backfill safely. Later make NOT NULL.
    PhoneE164 = db.Column(db.String(20), index=True,
                          unique=False, nullable=True)

    # ✅ Verification & 2FA
    IsPhoneVerified = db.Column(db.Boolean, default=False, nullable=False)
    LastVerifiedAt = db.Column(db.DateTime, nullable=True)

    TwoFAEnabled = db.Column(db.Boolean, default=False,
                             nullable=False)              # master switch
    # 'sms' | 'totp' (optional)
    TwoFAMethod = db.Column(db.String(10), nullable=True)
    # 'sms' | 'whatsapp' | 'email'
    PreferredChannel = db.Column(db.String(20), default='sms', nullable=False)

    # ✅ Consent & notification controls
    AllowSMS = db.Column(db.Boolean, default=True, nullable=False)
    AllowWhatsApp = db.Column(db.Boolean, default=False, nullable=False)
    AllowEmail = db.Column(db.Boolean, default=True, nullable=False)

    # Account state
    IsAdmin = db.Column(db.Boolean, default=False)
    IsActive = db.Column(db.Boolean, default=True, nullable=False)

    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    UpdatedAt = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    apartments = db.relationship('Apartment', backref='owner', lazy=True)

    __table_args__ = (
        # Lightweight data sanity; app will still normalize/validate strictly.
        db.CheckConstraint(
            "PreferredChannel in ('sms','whatsapp','email')",
            name="ck_users_pref_channel"
        ),
        db.CheckConstraint(
            "(TwoFAMethod in ('sms','totp')) OR (TwoFAMethod IS NULL)",
            name="ck_users_2fa_method"
        ),
    )

    def __repr__(self):
        return f"<User ID={self.UserID} Email={self.Email} Verified={self.IsPhoneVerified}>"


class Apartment(db.Model):
    __tablename__ = 'Apartments'

    ApartmentID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ApartmentName = db.Column(db.String(100), nullable=False)
    Location = db.Column(db.String(150), nullable=False)
    Description = db.Column(db.String(500))

    # Landlord link (you had UserID; keep it but index + clearer comment)
    UserID = db.Column(db.Integer, db.ForeignKey('Users.UserID'), index=True)

    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    rental_units = db.relationship(
        'RentalUnit', backref='apartment', lazy=True)

    def __repr__(self):
        return f"<Apartment {self.ApartmentName}>"


class UnitCategory(db.Model):
    __tablename__ = 'UnitCategories'

    CategoryID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CategoryName = db.Column(db.String(50), unique=True, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<UnitCategory {self.CategoryName}>"


class RentalUnitStatus(db.Model):
    __tablename__ = 'RentalUnitStatuses'

    StatusID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    StatusName = db.Column(db.String(20), unique=True, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<RentalUnitStatus {self.StatusName}>"


class RentalUnit(db.Model):
    __tablename__ = 'RentalUnits'

    UnitID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ApartmentID = db.Column(db.Integer, db.ForeignKey(
        'Apartments.ApartmentID'), nullable=False)

    Label = db.Column(db.String(20), nullable=False)
    Description = db.Column(db.String(300))
    MonthlyRent = db.Column(db.Float, nullable=False)

    StatusID = db.Column(db.Integer, db.ForeignKey(
        'RentalUnitStatuses.StatusID'))
    CategoryID = db.Column(
        db.Integer, db.ForeignKey('UnitCategories.CategoryID'))
    CurrentTenantID = db.Column(db.Integer, db.ForeignKey(
        'Tenants.TenantID'), nullable=True)

    CreatedAt = db.Column(db.DateTime,  default=datetime.utcnow)

    status = db.relationship('RentalUnitStatus', backref='units')
    category = db.relationship('UnitCategory', backref='units')
    current_tenant = db.relationship(
        'Tenant', backref='assigned_unit', foreign_keys=[CurrentTenantID])

    def __repr__(self):
        return f"<RentalUnit {self.Label} | Apt {self.ApartmentID}>"


class Tenant(db.Model):
    __tablename__ = "Tenants"

    TenantID = db.Column(db.Integer, primary_key=True)
    FullName = db.Column(db.String(100), nullable=False)

    # Phone storage: legacy + normalized E.164 (e.g., +2547XXXXXXXX)
    Phone = db.Column(db.String(20), nullable=False)  # legacy 2547XXXXXXXX
    PhoneE164 = db.Column(db.String(16), index=True,
                          nullable=True)  # +2547XXXXXXXX

    Email = db.Column(db.String(100))
    IDNumber = db.Column(db.String(50), nullable=False)

    RentalUnitID = db.Column(db.Integer, db.ForeignKey(
        'RentalUnits.UnitID'), nullable=False)
    MoveInDate = db.Column(db.Date, nullable=False)
    MoveOutDate = db.Column(db.Date)

    Status = db.Column(db.String(50))
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # NEW: lightweight comms/compliance flags (keeps VacateDate external per your request)
    # set after OTP or delivery success
    PhoneVerifiedAt = db.Column(db.DateTime, nullable=True)
    SmsOptOut = db.Column(db.Boolean, nullable=False, default=False)
    # "SMS"|"EMAIL"|"WHATSAPP"
    PreferredChannel = db.Column(db.String(10))

    # Relationship
    rental_unit = db.relationship(
        'RentalUnit', backref='tenants', foreign_keys=[RentalUnitID])

    def __repr__(self):
        return f"<Tenant {self.FullName}>"


class VacateNotice(db.Model):
    __tablename__ = 'VacateNotices'

    NoticeID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TenantID = db.Column(db.Integer, db.ForeignKey(
        'Tenants.TenantID'), nullable=False, index=True)
    RentalUnitID = db.Column(db.Integer, db.ForeignKey(
        'RentalUnits.UnitID'), nullable=False, index=True)

    NoticeDate = db.Column(db.Date, nullable=False, default=date.today)
    ExpectedVacateDate = db.Column(db.Date, nullable=False)
    Reason = db.Column(db.String(300))
    InspectionDate = db.Column(db.Date)
    # Pending|Scheduled|Completed|Canceled
    Status = db.Column(db.String(50), default="Pending")
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    tenant = db.relationship('Tenant', backref='vacate_notices')
    rental_unit = db.relationship('RentalUnit', backref='vacate_notices')

    def __repr__(self):
        return f"<VacateNotice TenantID={self.TenantID} ExpectedVacateDate={self.ExpectedVacateDate}>"


class TenantBill(db.Model):
    __tablename__ = 'TenantBills'

    # Primary key
    BillID = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # Foreign keys
    TenantID = db.Column(db.Integer, db.ForeignKey(
        'Tenants.TenantID'), nullable=False)
    RentalUnitID = db.Column(db.Integer, db.ForeignKey(
        'RentalUnits.UnitID'), nullable=False)

    # Denormalized owner (fast landlord-scoped queries)
    LandlordID = db.Column(db.Integer, db.ForeignKey(
        'Users.UserID'), nullable=True)

    # Existing month label used in routes/UI (keep)
    BillingMonth = db.Column(
        db.String(20), nullable=False)  # e.g., "July 2025"

    # Canonical first-of-month (optional but useful)
    BillingPeriod = db.Column(db.Date, nullable=True)  # e.g., date(2025, 7, 1)

    # Money (keep Float for backward-compat)
    RentAmount = db.Column(db.Float, nullable=False)
    WaterBill = db.Column(db.Float, default=0.0)
    ElectricityBill = db.Column(db.Float, default=0.0)
    Garbage = db.Column(db.Float, default=0.0)
    Internet = db.Column(db.Float, default=0.0)
    CarriedForwardBalance = db.Column(db.Float, default=0.0)

    TotalAmountDue = db.Column(db.Float, nullable=False)

    # Dates
    DueDate = db.Column(db.Date, nullable=False)
    IssuedDate = db.Column(db.DateTime, default=datetime.utcnow)

    # Status: "Unpaid", "Paid", "Partially Paid", "Overpaid"
    BillStatus = db.Column(db.String(20), default="Unpaid")

    # Relationships
    tenant = db.relationship('Tenant', backref='bills', lazy=True)
    unit = db.relationship('RentalUnit', backref='bills', lazy=True)
    landlord = db.relationship('User', backref='tenant_bills', lazy=True)

    # NEW: allocations relationship (paired with PaymentAllocation.bill)
    allocations = db.relationship(
        'PaymentAllocation',
        back_populates='bill',
        cascade="all, delete-orphan",
        lazy=True
    )

    # Helpful composite index for landlord dashboards & month filtering
    __table_args__ = (
        Index('ix_tenantbills_landlord_month', 'LandlordID', 'BillingMonth'),
    )

    def __repr__(self):
        return f"<TenantBill {self.BillingMonth} | TenantID {self.TenantID} | Status {self.BillStatus}>"

    # Convenience: derive BillingPeriod from BillingMonth safely
    def set_billing_period_from_label(self):
        try:
            dt = datetime.strptime(self.BillingMonth, "%B %Y")
            self.BillingPeriod = date(dt.year, dt.month, 1)
        except Exception:
            pass


class RentPayment(db.Model):
    __tablename__ = 'RentPayments'

    # Primary key
    PaymentID = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # Foreign keys
    TenantID = db.Column(db.Integer, db.ForeignKey(
        'Tenants.TenantID'), nullable=False)
    RentalUnitID = db.Column(db.Integer, db.ForeignKey(
        'RentalUnits.UnitID'), nullable=False)

    # Denormalized owner (fast landlord-scoped queries)
    LandlordID = db.Column(db.Integer, db.ForeignKey(
        'Users.UserID'), nullable=True)

    # Compatibility labels used by routes/UI
    BillingMonth = db.Column(
        db.String(20), nullable=False)  # e.g., "July 2025"
    IntendedBillingPeriod = db.Column(
        db.Date, nullable=True)  # e.g., date(2025, 7, 1)

    # Amounts (kept Float for compatibility)
    BilledAmount = db.Column(db.Float, nullable=False)
    AmountPaid = db.Column(db.Float, nullable=False)
    Balance = db.Column(db.Float, default=0.0, nullable=False)

    # Payment metadata
    PaymentDate = db.Column(
        db.DateTime, default=datetime.utcnow, nullable=False)
    PaidViaMobile = db.Column(db.String(20), nullable=False)  # e.g., "MPesa"
    # e.g., M-Pesa code
    TxRef = db.Column(db.String(100), nullable=True)
    PaymentNote = db.Column(db.String(255), nullable=True)

    # Relationships
    tenant = db.relationship('Tenant', backref='rent_payments', lazy=True)
    unit = db.relationship('RentalUnit', backref='rent_payments', lazy=True)
    landlord = db.relationship('User', backref='rent_payments', lazy=True)

    # Allocations (paired with PaymentAllocation.payment) — NO backref here
    allocations = db.relationship(
        'PaymentAllocation',
        back_populates='payment',
        cascade="all, delete-orphan",
        lazy=True
    )

    __table_args__ = (
        Index('ix_rentpayments_landlord_date', 'LandlordID', 'PaymentDate'),
    )

    def __repr__(self):
        return f"<RentPayment {self.BillingMonth} | TenantID {self.TenantID} | AmountPaid {self.AmountPaid}>"


class LandlordExpense(db.Model):
    __tablename__ = 'LandlordExpenses'

    ExpenseID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ApartmentID = db.Column(db.Integer, db.ForeignKey(
        'Apartments.ApartmentID'), nullable=False)

    # e.g., Water, Repairs, Electricity
    ExpenseType = db.Column(db.String(100), nullable=False)
    Amount = db.Column(db.Float, nullable=False)
    Description = db.Column(db.String(300))

    # Dates
    # Date the expense is for
    ExpenseDate = db.Column(db.DateTime, nullable=False,
                            default=datetime.utcnow)
    # Date it was paid
    ExpensePaymentDate = db.Column(db.DateTime, nullable=True)

    # Payment details
    # Vendor or recipient
    Payee = db.Column(db.String(150), nullable=True)
    # Cash, M-Pesa, Bank, etc.
    PaymentMethod = db.Column(db.String(50), nullable=True)
    # Transaction reference
    PaymentRef = db.Column(db.String(100), nullable=True)

    # Audit trail
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    apartment = db.relationship('Apartment', backref='expenses')

    def __repr__(self):
        return f"<Expense {self.ExpenseType} | {self.Amount} | For: {self.ExpenseDate.strftime('%B %Y')} | Paid: {self.ExpensePaymentDate.strftime('%Y-%m-%d') if self.ExpensePaymentDate else 'Unpaid'}>"


class NotificationTag(db.Model):
    __tablename__ = 'NotificationTags'

    TagID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TagName = db.Column(db.String(100), unique=True,
                        nullable=False)  # e.g., "Rent Reminder"
    Description = db.Column(db.String(300))

    def __repr__(self):
        return f"<NotificationTag {self.TagName}>"


class Notification(db.Model):
    __tablename__ = 'Notifications'

    NotificationID = db.Column(
        db.Integer, primary_key=True, autoincrement=True)
    TenantID = db.Column(db.Integer, db.ForeignKey(
        'Tenants.TenantID'), nullable=False)
    RentalUnitID = db.Column(db.Integer, db.ForeignKey(
        'RentalUnits.UnitID'), nullable=True)
    TagID = db.Column(db.Integer, db.ForeignKey(
        'NotificationTags.TagID'), nullable=False)

    Title = db.Column(db.String(100), nullable=False)
    Message = db.Column(db.String(500), nullable=False)
    SentBy = db.Column(db.String(100), default="System")
    SentDate = db.Column(db.DateTime, default=datetime.utcnow)
    IsRead = db.Column(db.Boolean, default=False)

    tenant = db.relationship('Tenant', backref='notifications')
    rental_unit = db.relationship('RentalUnit', backref='notifications')
    tag = db.relationship('NotificationTag', backref='notifications')

    def __repr__(self):
        return f"<Notification '{self.Title}' to Tenant {self.TenantID}>"


class VacateLog(db.Model):
    __tablename__ = 'VacateLogs'

    LogID = db.Column(db.Integer, primary_key=True)
    TenantID = db.Column(db.Integer, db.ForeignKey(
        'Tenants.TenantID'), nullable=False)
    UnitID = db.Column(db.Integer, db.ForeignKey(
        'RentalUnits.UnitID'), nullable=False)
    ApartmentID = db.Column(db.Integer, db.ForeignKey(
        'Apartments.ApartmentID'), nullable=False)
    VacatedBy = db.Column(db.Integer, db.ForeignKey(
        'Users.UserID'), nullable=False)
    VacateDate = db.Column(db.DateTime, default=datetime.utcnow)
    Reason = db.Column(db.String(255))
    Notes = db.Column(db.Text)

    # Optional relationships
    tenant = db.relationship('Tenant')
    unit = db.relationship('RentalUnit')
    apartment = db.relationship('Apartment')
    user = db.relationship('User')


class TransferLog(db.Model):
    __tablename__ = 'TransferLogs'

    LogID = db.Column(db.Integer, primary_key=True)
    TenantID = db.Column(db.Integer, db.ForeignKey(
        'Tenants.TenantID'), nullable=False)
    OldUnitID = db.Column(db.Integer, db.ForeignKey(
        'RentalUnits.UnitID'), nullable=False)
    NewUnitID = db.Column(db.Integer, db.ForeignKey(
        'RentalUnits.UnitID'), nullable=False)
    TransferredBy = db.Column(
        db.Integer, db.ForeignKey('Users.UserID'), nullable=False)
    TransferDate = db.Column(db.DateTime, default=datetime.utcnow)
    Reason = db.Column(db.String(255))

    tenant = db.relationship('Tenant')
    old_unit = db.relationship('RentalUnit', foreign_keys=[OldUnitID])
    new_unit = db.relationship('RentalUnit', foreign_keys=[NewUnitID])
    user = db.relationship('User')


class SMSUsageLog(db.Model):
    __tablename__ = 'SMSUsageLogs'

    SMSLogID = db.Column(db.Integer, primary_key=True, autoincrement=True)

    LandlordID = db.Column(db.Integer, db.ForeignKey(
        'Users.UserID'), nullable=False)
    TenantID = db.Column(db.Integer, db.ForeignKey(
        'Tenants.TenantID'), nullable=True)
    BillID = db.Column(db.Integer, db.ForeignKey(
        'TenantBills.BillID'), nullable=True)

    PhoneNumber = db.Column(db.String(20), nullable=False)
    Message = db.Column(db.Text, nullable=False)
    SentAt = db.Column(db.DateTime, default=datetime.utcnow)
    CostPerSMS = db.Column(db.Float, default=1.0)

    # Relationships
    landlord = db.relationship('User', backref='sms_logs')
    tenant = db.relationship('Tenant', backref='sms_logs')
    # ✅ allows bill.sms_logs
    bill = db.relationship('TenantBill', backref='sms_logs')

    def __repr__(self):
        return (
            f"<SMSUsageLog LandlordID={self.LandlordID} "
            f"TenantID={self.TenantID} BillID={self.BillID} "
            f"Phone={self.PhoneNumber} SentAt={self.SentAt}>"
        )


class Profile(db.Model):
    """
    One-to-one profile for a User.
    Stores branding, contact, payment, and address details used across statements/receipts.
    """
    __tablename__ = "Profiles"

    # PK
    ProfileID = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # 1–1 with Users (delete profile when user is deleted)
    UserID = db.Column(
        db.Integer,
        db.ForeignKey("Users.UserID", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )

    # Basic info
    ProfilePicture = db.Column(db.String(300))
    Address = db.Column(db.String(200))
    NationalID = db.Column(db.String(50))
    KRA_PIN = db.Column(db.String(50))
    Bio = db.Column(db.Text)
    DateOfBirth = db.Column(db.Date)

    # Display / support contacts
    DisplayName = db.Column(db.String(120))
    SupportEmail = db.Column(db.String(120), index=True)
    SupportPhone = db.Column(db.String(20),  index=True)

    # M-Pesa details
    MpesaPaybill = db.Column(db.String(20))
    MpesaTill = db.Column(db.String(20))
    MpesaAccountName = db.Column(db.String(120))

    # Banking details
    BankName = db.Column(db.String(120))
    BankBranch = db.Column(db.String(120))
    AccountName = db.Column(db.String(120))
    AccountNumber = db.Column(db.String(40))

    # Addressing
    City = db.Column(db.String(100))
    County = db.Column(db.String(100))
    PostalCode = db.Column(db.String(20))

    # Audit
    UpdatedAt = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Relationship (true 1–1 via unique FK)
    user = db.relationship(
        "User",
        backref=db.backref("profile", uselist=False, passive_deletes=True)
    )

    def __repr__(self) -> str:
        return f"<Profile UserID={self.UserID} DisplayName={self.DisplayName!r}>"


class Feedback(db.Model):
    __tablename__ = 'Feedback'
    FeedbackID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Email = db.Column(db.String(120), nullable=False)
    Subject = db.Column(db.String(200), nullable=False)
    Message = db.Column(db.Text, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)


class Rating(db.Model):
    __tablename__ = 'Rating'
    RatingID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    RatingValue = db.Column(db.Integer, nullable=False)  # 1–5
    Comment = db.Column(db.Text)  # optional
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)


class PaymentAllocation(db.Model):
    """
    Resolves many-to-many between RentPayments and TenantBills.
    One payment can cover multiple bills; one bill can be covered by multiple payments.
    """
    __tablename__ = 'PaymentAllocations'

    AllocationID = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # FKs
    PaymentID = db.Column(
        db.Integer,
        db.ForeignKey('RentPayments.PaymentID', ondelete='CASCADE'),
        nullable=False
    )
    BillID = db.Column(
        db.Integer,
        db.ForeignKey('TenantBills.BillID', ondelete='CASCADE'),
        nullable=False
    )

    # Money-safe amount allocated from this payment to this bill
    AllocatedAmount = db.Column(Numeric(12, 2), nullable=False)

    # Optional denormalized owner for fast landlord-scoped queries
    LandlordID = db.Column(db.Integer, db.ForeignKey(
        'Users.UserID'), nullable=True)

    # Audit
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships — use back_populates on BOTH sides (no backref)
    payment = db.relationship(
        'RentPayment', back_populates='allocations', lazy=True)
    bill = db.relationship(
        'TenantBill', back_populates='allocations', lazy=True)
    landlord = db.relationship(
        'User', backref='payment_allocations', lazy=True)

    __table_args__ = (
        # prevent duplicate rows for the same (Payment, Bill) pair
        UniqueConstraint('PaymentID', 'BillID', name='uq_payment_bill'),
        # basic sanity: non-negative allocation
        CheckConstraint('AllocatedAmount >= 0', name='ck_alloc_nonneg'),
        # helpful indexes
        Index('ix_alloc_landlord_bill', 'LandlordID', 'BillID'),
        Index('ix_alloc_payment', 'PaymentID'),
        Index('ix_alloc_bill', 'BillID'),
    )

    def __repr__(self):
        return f"<PaymentAllocation PaymentID={self.PaymentID} BillID={self.BillID} Allocated={self.AllocatedAmount}>"


class OutgoingMessage(db.Model):
    """
    Provider-agnostic outbox. Insert rows for:
      - Apartment created (to landlord)
      - Welcome tenant
      - Scheduled vacate reminder
    A worker/cron delivers when ScheduledAt is NULL or <= now().
    """
    __tablename__ = "OutgoingMessages"

    MessageID = db.Column(db.Integer, primary_key=True, autoincrement=True)

    Channel = db.Column(db.String(10), nullable=False)  # "SMS" | "EMAIL"
    Status = db.Column(db.String(16), nullable=False,
                       index=True, default="PENDING")
    Body = db.Column(db.Text, nullable=False)

    ToPhone = db.Column(db.String(20), index=True)      # +2547...
    ToEmail = db.Column(db.String(120), index=True)

    # Context links (for audit & UI drilldowns)
    UserID = db.Column(db.Integer, db.ForeignKey(
        "Users.UserID"), index=True)           # Landlord (sender/owner)
    ApartmentID = db.Column(db.Integer, db.ForeignKey(
        "Apartments.ApartmentID"), index=True)
    UnitID = db.Column(db.Integer, db.ForeignKey(
        "RentalUnits.UnitID"), index=True)
    TenantID = db.Column(db.Integer, db.ForeignKey(
        "Tenants.TenantID"), index=True)

    # "Apartment" | "Tenant" | "RentPayment" | "VacateNotice"
    RelatedModel = db.Column(db.String(50))
    RelatedID = db.Column(db.Integer)

    # Scheduling & provider audit
    # set for reminders; null for immediate
    ScheduledAt = db.Column(db.DateTime, index=True)
    CreatedAt = db.Column(db.DateTime, nullable=False,
                          server_default=func.now())
    SentAt = db.Column(db.DateTime)

    Provider = db.Column(db.String(32))            # "twilio"
    ProviderSID = db.Column(db.String(80), index=True)
    ErrorCode = db.Column(db.String(32))
    ErrorMessage = db.Column(db.String(255))

    __table_args__ = (
        db.Index("ix_outgoing_owner_time", "UserID", "ScheduledAt"),
    )

    def __repr__(self):
        return f"<OutgoingMessage {self.Channel} {self.Status} to {self.ToPhone or self.ToEmail}>"


class MessageTemplate(db.Model):
    """
    Optional, lets landlords customize message bodies with tokens:
    {FirstName} {Apartment} {Unit} {Amount} {Date}
    """
    __tablename__ = "MessageTemplates"

    TemplateID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    LandlordID = db.Column(db.Integer, db.ForeignKey(
        "Users.UserID"), index=True)  # NULL = global
    # e.g., "Welcome", "Vacate Reminder"
    Name = db.Column(db.String(60), nullable=False)
    # "WELCOME"|"APARTMENT_CREATED"|"VACATE_REMINDER"
    Purpose = db.Column(db.String(32), nullable=False)
    Channel = db.Column(db.String(10), nullable=False, default="SMS")
    Body = db.Column(db.Text, nullable=False)
    IsDefault = db.Column(db.Boolean, nullable=False, default=False)

    CreatedAt = db.Column(db.DateTime, nullable=False,
                          server_default=func.now())
    UpdatedAt = db.Column(db.DateTime, nullable=False,
                          server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        db.UniqueConstraint("LandlordID", "Purpose", "Name",
                            name="uq_template_owner_purpose_name"),
    )

    def __repr__(self):
        return f"<MessageTemplate {self.Purpose}:{self.Name} landlord={self.LandlordID}>"


class WebhookLog(db.Model):
    """
    Stores Twilio status callbacks for delivery analytics & debugging.
    """
    __tablename__ = "WebhookLogs"

    WebhookID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Provider = db.Column(db.String(32), nullable=False)     # "twilio"
    # maps to OutgoingMessage.ProviderSID
    ProviderSID = db.Column(db.String(80), index=True)
    PayloadJSON = db.Column(db.Text, nullable=False)
    # delivered/failed/...
    Status = db.Column(db.String(32), index=True)
    ReceivedAt = db.Column(db.DateTime, nullable=False,
                           server_default=func.now())
    MessageID = db.Column(db.Integer, db.ForeignKey(
        "OutgoingMessages.MessageID"), index=True)

    def __repr__(self):
        return f"<WebhookLog {self.Provider} {self.Status} {self.ProviderSID}>"


class CommsSetting(db.Model):
    """
    Per-landlord communication preferences (quiet hours, etc.).
    """
    __tablename__ = "CommsSettings"

    SettingID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    LandlordID = db.Column(db.Integer, db.ForeignKey(
        "Users.UserID"), unique=True, index=True)

    QuietStartH = db.Column(db.Integer, nullable=False, default=20)  # 20:00
    QuietEndH = db.Column(db.Integer, nullable=False, default=8)   # 08:00
    UseWhatsApp = db.Column(db.Boolean, nullable=False, default=False)
    CountryCode = db.Column(db.String(8), nullable=False, default="+254")

    CreatedAt = db.Column(db.DateTime, nullable=False,
                          server_default=func.now())
    UpdatedAt = db.Column(db.DateTime, nullable=False,
                          server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<CommsSetting LandlordID={self.LandlordID}>"
