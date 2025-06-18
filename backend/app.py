from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from models import db  # ✅ shared db instance
from models import (   # ✅ all model classes imported
    User, Apartment, UnitCategory, RentalUnitStatus, RentalUnit, Tenant,
    VacateNotice, TenantBill, RentPayment, LandlordExpense,
    NotificationTag, Notification
)

app = Flask(__name__)

# ✅ Working connection string using IP + port
app.config['SQLALCHEMY_DATABASE_URI'] = (
    "mssql+pyodbc://sa:AZiza%402812@192.168.100.3:1433/NyumbaSmart?"
    "driver=ODBC+Driver+17+for+SQL+Server&Encrypt=no&TrustServerCertificate=yes"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ✅ Bind db to Flask app
db.init_app(app)

# ✅ Test route
@app.route('/')
def home():
    return {'message': 'NyumbaSmart Backend Running Successfully'}

# ✅ Run and create all tables
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
