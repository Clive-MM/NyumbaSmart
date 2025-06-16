from datetime import datetime
from models import db

class User(db.Model):
    __tablename__ = 'Users'

    UserID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    FullName = db.Column(db.String(100), nullable=False)
    Email = db.Column(db.String(120), unique=True, nullable=False)
    Password = db.Column(db.String(200), nullable=False)
    Phone = db.Column(db.String(20))
    IsAdmin = db.Column(db.Boolean, default=True)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    apartments = db.relationship('Apartment', backref='owner', lazy=True)

    def __repr__(self):
        return f"<User ID={self.UserID} Email={self.Email}>"
    
class Apartment(db.Model):
    __tablename__ = 'Apartments'

    ApartmentID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ApartmentName = db.Column(db.String(100), nullable=False)
    Location = db.Column(db.String(150), nullable=False)
    Description = db.Column(db.String(500))
    UserID = db.Column(db.Integer, db.ForeignKey('Users.UserID'))
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    rental_units = db.relationship('RentalUnit', backref='apartment', lazy=True)

    def __repr__(self):
        return f"<Apartment {self.ApartmentName}>"

class RentalUnitCategory(db.Model):
    __tablename__ = 'RentalUnitCategories'

    CategoryID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CategoryName = db.Column(db.String(50), nullable=False, unique=True)  # e.g., Bedsitter, 1 Bedroom, Mixed,  2 Bedroom, 3 Bedroom, Studio
    Description = db.Column(db.String(200))

    def __repr__(self):
        return f"<RentalUnitCategory {self.CategoryName}>"
    
class RentalUnitStatus(db.Model):
    __tablename__ = 'RentalUnitStatus'

    StatusID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    StatusName = db.Column(db.String(30), nullable=False, unique=True)  # e.g., Vacant, Occupied, Reserved
    Description = db.Column(db.String(200))

    def __repr__(self):
        return f"<RentalUnitStatus {self.StatusName}>"
    
class RentalUnit(db.Model):
    __tablename__ = 'RentalUnits'

    UnitID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ApartmentID = db.Column(db.Integer, db.ForeignKey('Apartments.ApartmentID'), nullable=False)
    Label = db.Column(db.String(20), nullable=False)  
    Description = db.Column(db.String(300))
    MonthlyRent = db.Column(db.Float, nullable=False)
    AdditionalBills = db.Column(db.Float, default=0.0)
    StatusID = db.Column(db.Integer, db.ForeignKey('RentalUnitStatus.ID'))
    CategoryID = db.Column(db.Integer, db.ForeignKey('UnitCategory.ID'))
    CurrentTenantID = db.Column(db.Integer, db.ForeignKey('Tenants.TenantID'), nullable=True)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    status = db.relationship('RentalUnitStatus', backref='rental_units')
    category = db.relationship('UnitCategory', backref='rental_units')
    tenant = db.relationship('Tenant', backref='rental_unit', foreign_keys=[CurrentTenantID])

    def __repr__(self):
        return f"<Unit {self.Label} - Apt {self.ApartmentID}>"

class Tenant(db.Model):
    __tablename__ = 'Tenants'

    TenantID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    FullName = db.Column(db.String(100), nullable=False)
    Phone = db.Column(db.String(20), nullable=False)
    Email = db.Column(db.String(100))
    IDNumber = db.Column(db.String(50))
    RentalUnitID = db.Column(db.Integer, db.ForeignKey('RentalUnits.UnitID'))
    MoveInDate = db.Column(db.Date, nullable=False)
    MoveOutDate = db.Column(db.Date)
    Status = db.Column(db.String(50), default="Active") 
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    rental_unit = db.relationship('RentalUnit', backref='tenants', foreign_keys=[RentalUnitID])

    def __repr__(self):
        return f"<Tenant {self.FullName}>"
    
class VacateNotice(db.Model):
    __tablename__ = 'VacateNotices'

    NoticeID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TenantID = db.Column(db.Integer, db.ForeignKey('Tenants.TenantID'), nullable=False)
    RentalUnitID = db.Column(db.Integer, db.ForeignKey('RentalUnits.UnitID'), nullable=False)
    NoticeDate = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    ExpectedVacateDate = db.Column(db.Date, nullable=False)
    Reason = db.Column(db.String(300))
    Status = db.Column(db.String(50), default="Pending") 
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    tenant = db.relationship('Tenant', backref='vacate_notices')
    rental_unit = db.relationship('RentalUnit', backref='vacate_notices')

    def __repr__(self):
        return f"<VacateNotice TenantID={self.TenantID} ExpectedVacateDate={self.ExpectedVacateDate}>"
    
class TenantBill(db.Model):
    __tablename__ = 'TenantBills'

    BillID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TenantID = db.Column(db.Integer, db.ForeignKey('Tenants.TenantID'), nullable=False)
    RentalUnitID = db.Column(db.Integer, db.ForeignKey('RentalUnits.UnitID'), nullable=False)

    BillingMonth = db.Column(db.String(20), nullable=False) 
    RentAmount = db.Column(db.Float, nullable=False)
    WaterBill = db.Column(db.Float, default=0.0)
    ElectricityBill = db.Column(db.Float, default=0.0)
    Garbage = db.Column(db.Float, default=0.0)
    Internet = db.Column(db.Float, default=0.0)

    TotalAmountDue = db.Column(db.Float, nullable=False)
    DueDate = db.Column(db.Date, nullable=False)
    IssuedDate = db.Column(db.DateTime, default=datetime.utcnow)
    IsPaid = db.Column(db.Boolean, default=False)

    tenant = db.relationship('Tenant', backref='bills')
    unit = db.relationship('RentalUnit', backref='bills')

    def __repr__(self):
        return f"<TenantBill {self.BillingMonth} | TenantID {self.TenantID}>"
    
class RentPayment(db.Model):
    __tablename__ = 'RentPayments'

    PaymentID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    TenantID = db.Column(db.Integer, db.ForeignKey('Tenants.TenantID'), nullable=False)
    RentalUnitID = db.Column(db.Integer, db.ForeignKey('RentalUnits.UnitID'), nullable=False)
    
    BillingMonth = db.Column(db.String(20), nullable=False)  
    BilledAmount = db.Column(db.Float, nullable=False)       
    AmountPaid = db.Column(db.Float, nullable=False)        
    Balance = db.Column(db.Float, default=0.0)               
    
    PaymentDate = db.Column(db.DateTime, default=datetime.utcnow)
    PaidViaMobile = db.Column(db.String(20), nullable=False)  

    tenant = db.relationship('Tenant', backref='rent_payments')
    unit = db.relationship('RentalUnit', backref='rent_payments')

    def __repr__(self):
        return f"<RentPayment {self.BillingMonth} | TenantID {self.TenantID}>"
    


