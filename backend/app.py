# app.py
from flask import Flask
from flask_mail import Mail
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import text
from dotenv import load_dotenv
from twilio.rest import Client
import os
import cloudinary

# --- Models / DB ---
from models import db
# Import models so SQLAlchemy sees all tables before create_all()
from models import (
    User, Apartment, UnitCategory, RentalUnitStatus, RentalUnit, Tenant,
    VacateNotice, TenantBill, RentPayment, LandlordExpense,
    NotificationTag, Notification, VacateLog, TransferLog, Feedback, Rating
)

# --- Routes / Blueprint ---
# <- use same bcrypt instance as routes
from routes.routes import routes, register_mail_instance, bcrypt

# Load env
load_dotenv()

app = Flask(__name__)

# -------------------------
# Core Config
# -------------------------
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
app.config['JWT_IDENTITY_CLAIM'] = 'identity'

# Mail
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

# Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

# CORS (match frontend origins incl. Vercel)
CORS(
    app,
    resources={r"/*": {"origins": [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://nyumbasmart.vercel.app"
    ]}},
    supports_credentials=True,
)

# -------------------------
# Twilio (single client)
# -------------------------
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_VERIFY_SERVICE_SID = os.getenv("TWILIO_VERIFY_SERVICE_SID")
TWILIO_MESSAGING_SID = os.getenv("TWILIO_MESSAGING_SID")

app.config["TWILIO_VERIFY_SERVICE_SID"] = TWILIO_VERIFY_SERVICE_SID
app.config["TWILIO_MESSAGING_SID"] = TWILIO_MESSAGING_SID

# Attach a single Twilio client (or None) to app.extensions
app.extensions = getattr(app, "extensions", {})
app.extensions["twilio_client"] = (
    Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN else None
)

# -------------------------
# Init extensions
# -------------------------
db.init_app(app)
mail = Mail(app)
jwt = JWTManager(app)
bcrypt.init_app(app)  # <-- initialize the SAME bcrypt imported from routes

# Let routes send emails
register_mail_instance(mail)

# Register blueprint
app.register_blueprint(routes)

# -------------------------
# Health checks
# -------------------------


@app.route("/")
def home():
    return {"message": "NyumbaSmart Backend Running Successfully"}, 200


@app.route("/health/twilio")
def health_twilio():
    return {
        "has_twilio_client": app.extensions.get("twilio_client") is not None,
        "verify_service_sid_set": bool(app.config.get("TWILIO_VERIFY_SERVICE_SID")),
        "messaging_sid_set": bool(app.config.get("TWILIO_MESSAGING_SID")),
    }, 200


@app.route("/health/db")
def health_db():
    try:
        with db.engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_name = db.engine.url.database  # portable way to show DB name
        return {"ok": True, "database": db_name}, 200
    except Exception as e:
        return {"ok": False, "error": str(e)}, 500


# -------------------------
# Run (dev)
# -------------------------
if __name__ == "__main__":
    with app.app_context():
        try:
            # Ensure tables exist (use migrations in production)
            db.create_all()
            print("✅ All tables created/verified.")
        except Exception as e:
            print("❌ Database init failed:", e)

    app.run(debug=True)
