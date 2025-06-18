from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from sqlalchemy import text
from dotenv import load_dotenv
import os

from models import db
from models import (
    User, Apartment, UnitCategory, RentalUnitStatus, RentalUnit, Tenant,
    VacateNotice, TenantBill, RentPayment, LandlordExpense,
    NotificationTag, Notification
)
from routes.routes import routes 

# ✅ Load environment variables
load_dotenv()

# ✅ Initialize Flask app
app = Flask(__name__)
CORS(app)

# ✅ Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
app.config['JWT_IDENTITY_CLAIM'] = 'identity'

# ✅ Initialize extensions
db.init_app(app)
bcrypt = Bcrypt(app)    
jwt = JWTManager(app)    

# ✅ Register blueprint
app.register_blueprint(routes)

# ✅ Root health check
@app.route('/')
def home():
    return {'message': 'NyumbaSmart Backend Running Successfully'}

# ✅ Run and create tables
if __name__ == '__main__':
    with app.app_context():
        try:
            conn = db.engine.connect()
            db_name = conn.execute(text("SELECT DB_NAME()")).scalar()
            print(f"✅ Connected to DB: {db_name}")
            db.create_all()
            print("✅ All tables created successfully in NyumbaSmart!")
        except Exception as e:
            print("❌ Database connection failed:", e)

    app.run(debug=True)
