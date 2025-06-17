from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from models import (
    User, Apartment, UnitCategory, RentalUnitStatus, RentalUnit, Tenant,
    VacateNotice, TenantBill, RentPayment, LandlordExpense,
    NotificationTag, Notification
)


# Load .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Config
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Import your models here (adjust if they’re in another file)
from models import (
    User, Apartment, UnitCategory, RentalUnitStatus, RentalUnit, Tenant,
    VacateNotice, TenantBill, RentPayment, LandlordExpense,
    NotificationTag, Notification
)

# Test Route
@app.route('/')
def home():
    return {'message': 'NyumbaSmart Backend Running Successfully'}

# Run App
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("✅ All tables created successfully in NyumbaSmartDB!")
    app.run(debug=True)
