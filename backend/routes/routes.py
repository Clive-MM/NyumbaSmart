from flask import current_app, Blueprint, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from sqlalchemy import func, case, cast, Date
from flask_mail import Message, Mail
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import jwt
import os
import re
import time
import cloudinary.uploader
from datetime import datetime, timedelta, date
from decimal import Decimal

from utils.sms_helper import send_sms
from utils.billing_helper import calculate_bill_amount
from utils.cloudinary_helper import upload_to_cloudinary
from models.models import (
    db, User, Apartment, UnitCategory, RentalUnitStatus, RentalUnit, Tenant,
    VacateLog, TransferLog, VacateNotice, SMSUsageLog, TenantBill,
    RentPayment, LandlordExpense, Profile, Feedback, Rating,  PaymentAllocation
)

# ✅ Initialize Blueprint
routes = Blueprint("routes", __name__)

# ✅ Configure CORS for specific origins
CORS(
    routes,
    resources={r"/*": {"origins": [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://nyumbasmart.vercel.app"
    ]}},
    supports_credentials=True
)

# ✅ Initialize Bcrypt
bcrypt = Bcrypt()

# ✅ Mail instance (to be set from app.py)
mail = None
# Email validator
EMAIL_RE = re.compile(
    r"^(?=.{1,254}$)(?=.{1,64}@)"
    r"[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@"
    r"(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$"
)


def register_mail_instance(mail_instance):
    """
    Registers the Flask-Mail instance from app.py
    so that routes can send emails.
    """
    global mail
    mail = mail_instance


def _fmt_date(d):
    return d.strftime("%Y-%m-%d") if d else None


KRA_RE = re.compile(r'^[A-Z]\d{9}[A-Z]$')


def normalize_phone(phone: str) -> str:
    if not phone:
        return ""
    p = re.sub(r'\D', '', phone.strip())
    if p.startswith('0'):         # 07xx → 2547xx
        p = '254' + p[1:]
    if p.startswith('7') and len(p) == 9:  # 7xx… → 2547xx…
        p = '254' + p
    return p


def validate_profile_payload(d: dict) -> list[str]:
    """Return list of validation error strings (empty = OK)."""
    errors = []

    kra = (d.get("KRA_PIN") or "").strip().upper()
    if kra and not KRA_RE.match(kra):
        errors.append("KRA_PIN must match format (e.g., A123456789B).")

    nid = (d.get("NationalID") or "").strip()
    if nid and not re.fullmatch(r"\d{6,8}", nid):
        errors.append("NationalID must be 6–8 digits.")

    paybill = (d.get("MpesaPaybill") or "").strip()
    if paybill and not re.fullmatch(r"\d{5,6}", paybill):
        errors.append("MpesaPaybill must be 5–6 digits.")

    till = (d.get("MpesaTill") or "").strip()
    if till and not re.fullmatch(r"\d{4,8}", till):
        errors.append("MpesaTill must be 4–8 digits.")

    dob = (d.get("DateOfBirth") or "").strip()
    if dob:
        try:
            dt = datetime.strptime(dob, "%Y-%m-%d").date()
            if dt > datetime.utcnow().date():
                errors.append("DateOfBirth cannot be in the future.")
        except ValueError:
            errors.append("DateOfBirth must be YYYY-MM-DD.")
    return errors


def profile_completeness(profile, user) -> int:
    """8-point score focusing on what drives automation & reporting."""
    score, req = 0, 8
    if (profile.DisplayName or user.FullName):
        score += 1
    if (profile.SupportEmail or user.Email):
        score += 1
    if profile.Address:
        score += 1
    if profile.ProfilePicture:
        score += 1
    if profile.KRA_PIN and KRA_RE.match(profile.KRA_PIN):
        score += 1
    if profile.NationalID and re.fullmatch(r"\d{6,8}", profile.NationalID):
        score += 1
    if (profile.MpesaPaybill or profile.MpesaTill):
        score += 1
    if (profile.City and profile.County):
        score += 1
    return round((score/req)*100)


def profile_next_steps(p) -> list[str]:
    steps = []
    if not (p.KRA_PIN and KRA_RE.match(p.KRA_PIN)):
        steps.append("Add a valid KRA PIN to enable KRA-ready reports.")
    if not (p.MpesaPaybill or p.MpesaTill):
        steps.append("Add your M-Pesa Paybill/Till to reconcile payments.")
    if not p.ProfilePicture:
        steps.append("Upload a logo/photo to brand statements and receipts.")
    if not (p.City and p.County):
        steps.append("Add your City & County for official notices.")
    return steps[:3]


def serialize_profile(user, profile):
    return {
        "UserID": user.UserID,
        "FullName": user.FullName,
        "Email": user.Email,
        "Phone": user.Phone,

        "ProfilePicture": profile.ProfilePicture if profile else None,
        "Address": profile.Address if profile else "",
        "NationalID": profile.NationalID if profile else "",
        "KRA_PIN": (profile.KRA_PIN or "") if profile else "",
        "Bio": profile.Bio if profile else "",
        "DateOfBirth": profile.DateOfBirth.strftime("%Y-%m-%d") if profile and profile.DateOfBirth else None,

        # New fields
        "DisplayName": profile.DisplayName if profile else user.FullName,
        "SupportEmail": profile.SupportEmail if profile else user.Email,
        "SupportPhone": profile.SupportPhone if profile else (normalize_phone(user.Phone) if user.Phone else ""),

        "MpesaPaybill": profile.MpesaPaybill if profile else "",
        "MpesaTill": profile.MpesaTill if profile else "",
        "MpesaAccountName": profile.MpesaAccountName if profile else "",

        "BankName": profile.BankName if profile else "",
        "BankBranch": profile.BankBranch if profile else "",
        "AccountName": profile.AccountName if profile else "",
        "AccountNumber": profile.AccountNumber if profile else "",

        "City": profile.City if profile else "",
        "County": profile.County if profile else "",
        "PostalCode": profile.PostalCode if profile else "",

        "UpdatedAt": profile.UpdatedAt.strftime("%Y-%m-%d %H:%M:%S") if profile and profile.UpdatedAt else None,

        # Smart extras
        "completeness": profile_completeness(profile, user) if profile else 25,
        "next_steps": profile_next_steps(profile) if profile else ["Complete your profile to personalize statements."]
    }


def _fmt_dt(d):
    """Format datetime → 'YYYY-MM-DD HH:MM:SS' (or None)."""
    return d.strftime("%Y-%m-%d %H:%M:%S") if d else None


def _parse_month_any(month_str: str):
    """
    Accepts either 'YYYY-MM' or 'MMMM YYYY' (e.g., '2025-08' or 'August 2025').
    Returns (year:int, month:int) or (None, None) if invalid/empty.
    """
    if not month_str:
        return None, None
    month_str = month_str.strip()
    # try YYYY-MM
    try:
        y, m = month_str.split("-")
        return int(y), int(m)
    except Exception:
        pass
    # try 'MMMM YYYY'
    try:
        dt = datetime.strptime(month_str, "%B %Y")
        return dt.year, dt.month
    except Exception:
        return None, None


def _landlord_scope_ids(user_id: int, apartment_id: int | None = None):
    """
    Returns (apartment_ids, unit_ids, unit_by_id) scoped to the landlord.
    Optionally restrict to a specific apartment_id.
    """
    a_q = Apartment.query.filter_by(UserID=user_id)
    if apartment_id:
        a_q = a_q.filter(Apartment.ApartmentID == apartment_id)
    apartments = a_q.all()
    apartment_ids = [a.ApartmentID for a in apartments]

    units = RentalUnit.query.filter(
        RentalUnit.ApartmentID.in_(apartment_ids)).all()
    unit_ids = [u.UnitID for u in units]
    unit_by_id = {u.UnitID: u for u in units}
    return apartment_ids, unit_ids, unit_by_id


# ✅ Landlord registration route with full validation


@routes.route('/register', methods=['POST'])
def register_landlord():
    data = request.get_json()
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')  # ✅ New field
    phone = data.get('phone')

    # ✅ Basic required field check
    if not all([full_name, email, password, confirm_password, phone]):
        return jsonify({'message': 'Full name, email, password, confirm password, and phone are required'}), 400

    # ✅ Check if passwords match
    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match!'}), 400

    # ✅ Check if user already exists (email)
    if User.query.filter_by(Email=email).first():
        return jsonify({'message': 'Email is already registered'}), 409

    # ✅ Check if user already exists (phone)
    if User.query.filter_by(Phone=phone).first():
        return jsonify({'message': 'Phone number is already registered'}), 409

    # ✅ Validate phone number format (Kenya format 2547XXXXXXXX)
    if not re.fullmatch(r"2547\d{8}", phone):
        return jsonify({'message': 'Phone number must be in format 2547XXXXXXXX'}), 400

    # ✅ Password strength validation
    if len(password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters long.'}), 400
    if not re.search(r'[A-Z]', password):
        return jsonify({'message': 'Password must contain at least one uppercase letter.'}), 400
    if not re.search(r'[a-z]', password):
        return jsonify({'message': 'Password must contain at least one lowercase letter.'}), 400
    if not re.search(r'[0-9]', password):
        return jsonify({'message': 'Password must contain at least one digit.'}), 400
    if not re.search(r'[\W_]', password):  # \W matches any non-alphanumeric character
        return jsonify({'message': 'Password must contain at least one special character.'}), 400

    # ✅ Hash and save user
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = User(
        FullName=full_name,
        Email=email,
        Password=hashed_pw,
        Phone=phone,
        IsAdmin=True
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': '🚀 You’re all set!. Welcome aboard! Your NyumbaSmart account is ready!'}), 201


# Track failed login attempts
login_attempts = {}
MAX_ATTEMPTS = 5
LOCKOUT_TIME = 60  # seconds

# Landlord login


@routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Both email and password are required.'}), 400

    # ⏱ Check if user is locked out
    if email in login_attempts:
        attempts, last_time = login_attempts[email]
        if attempts >= MAX_ATTEMPTS and time.time() - last_time < LOCKOUT_TIME:
            wait_time = int(LOCKOUT_TIME - (time.time() - last_time))
            return jsonify({'message': f'Too many failed attempts. Try again in {wait_time} seconds.'}), 429

    user = User.query.filter_by(Email=email).first()

    if not user:
        # Update failed attempts
        update_attempts(email)
        return jsonify({'message': 'No account found for this email. Try signing up instead.'}), 404

    if not bcrypt.check_password_hash(user.Password, password):
        update_attempts(email)
        return jsonify({'message': 'The password entered seems a bit off. Please try again carefully..'}), 401

    # Successful login → reset failed attempts
    login_attempts.pop(email, None)

    token = create_access_token(
        identity=user.UserID, expires_delta=timedelta(days=1))
    return jsonify({
        'message': 'Login successful!',
        'token': token,
        'user': {
            'UserID': user.UserID,
            'FullName': user.FullName,
            'Email': user.Email,
            'Phone': user.Phone,
            'IsAdmin': user.IsAdmin
        }
    }), 200

# Helper to track login failures


def update_attempts(email):
    now = time.time()
    if email not in login_attempts:
        login_attempts[email] = [1, now]
    else:
        login_attempts[email][0] += 1
        login_attempts[email][1] = now


# ✅ Route for changing the password


@routes.route('/new_password_change', methods=['PATCH'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': '❌ Account not found.'}), 404

    data = request.get_json()
    current_pw = data.get('current_password')
    new_pw = data.get('new_password')
    confirm_pw = data.get('confirm_password')

    if not all([current_pw, new_pw, confirm_pw]):
        return jsonify({'message': '❗All password fields are required.'}), 400

    if not bcrypt.check_password_hash(user.Password, current_pw):
        return jsonify({'message': '🚫 The current password you entered is incorrect.'}), 401

    if new_pw != confirm_pw:
        return jsonify({'message': '⚠️ New password and confirmation do not match.'}), 400

    # ✅ Check for password strength
    if len(new_pw) < 8:
        return jsonify({'message': '🔐 Password must be at least 8 characters long.'}), 400
    if not re.search(r'[A-Z]', new_pw):
        return jsonify({'message': '🔐 Password must include at least one uppercase letter.'}), 400
    if not re.search(r'[a-z]', new_pw):
        return jsonify({'message': '🔐 Password must include at least one lowercase letter.'}), 400
    if not re.search(r'\d', new_pw):
        return jsonify({'message': '🔐 Password must include at least one number.'}), 400
    if not re.search(r'[\W_]', new_pw):
        return jsonify({'message': '🔐 Password must include at least one special character.'}), 400

    # ✅ Hash and update
    user.Password = bcrypt.generate_password_hash(new_pw).decode('utf-8')
    db.session.commit()

    return jsonify({'message': '✅ Password changed successfully!'}), 200

# Route for enabling forgot password


@routes.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    # ✅ Validate email input
    if not email:
        return jsonify({'message': '❌ Email is required.'}), 400

    # ✅ Check if user exists
    user = User.query.filter_by(Email=email).first()
    if not user:
        return jsonify({'message': '❌ This email is not registered with us.'}), 404

    # ✅ Generate a token valid for 24 hours
    token = jwt.encode(
        {
            'user_id': user.UserID,
            'exp': datetime.utcnow() + timedelta(hours=24)
        },
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )

    # ✅ Get frontend URL from environment (fallback to localhost if missing)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend_url}/reset-password/{token}"

    # ✅ Create email message
    msg = Message(
        subject="🔐 Reset Your Password - NyumbaSmart",
        recipients=[email],
        body=f"""
Hello {user.FullName},

We received a request to reset your NyumbaSmart password.

Click the link below to reset your password:
{reset_link}

⚠️ This link is valid for 24 hours. If you didn’t request this, you can safely ignore this email.

Best regards,  
NyumbaSmart Support Team
"""
    )

    # ✅ Send email safely
    try:
        mail.send(msg)
        return jsonify({'message': '✅ Password reset link sent to your email address.'}), 200
    except Exception as e:
        return jsonify({'message': '❌ Failed to send email. Please try again later.', 'error': str(e)}), 500
# Reset Password Link Route from Forgotten Password


@routes.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')

    if not new_password or not confirm_password:
        return jsonify({'message': 'Both password fields are required'}), 400

    if new_password != confirm_password:
        return jsonify({'message': 'Passwords do not match'}), 400

    if len(new_password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters long.'}), 400
    if not re.search(r'[A-Z]', new_password):
        return jsonify({'message': 'Password must contain at least one uppercase letter.'}), 400
    if not re.search(r'[a-z]', new_password):
        return jsonify({'message': 'Password must contain at least one lowercase letter.'}), 400
    if not re.search(r'[0-9]', new_password):
        return jsonify({'message': 'Password must contain at least one digit.'}), 400
    if not re.search(r'[\W_]', new_password):
        return jsonify({'message': 'Password must contain at least one special character.'}), 400

    # Decode token
    try:
        payload = jwt.decode(
            token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256']
        )
        user_id = payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Reset link has expired.'}), 400
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid reset link.'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if bcrypt.check_password_hash(user.Password, new_password):
        return jsonify({'message': '⚠️ You cannot reuse your previous password. Choose a different one.'}), 400

    # ✅ Hash and save new password
    hashed_pw = bcrypt.generate_password_hash(new_password).decode('utf-8')
    user.Password = hashed_pw
    db.session.commit()

    # ✅ Optional email notification
    try:
        msg = Message("🔐 Your Password Was Successfully Changed",
                      recipients=[user.Email])
        msg.body = f"""
Hi {user.FullName},

Your PayNest password was successfully changed. If this wasn't you, please contact our support team immediately.

Best regards,  
PayNest Security Team
"""
        mail.send(msg)
    except Exception as e:
        print("Failed to send email notification:", str(e))

    return jsonify({'message': '✅ Password reset successful! You can now log in.'}), 200


# Route for creating an apartment


@routes.route('/apartments/create', methods=['POST'])
@jwt_required()
def create_apartment():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # Check if the user is an admin/landlord
    if not user or not user.IsAdmin:
        return jsonify({"message": "Unauthorized. Only landlords can create apartments."}), 403

    data = request.get_json()
    name = data.get('ApartmentName')
    location = data.get('Location')
    description = data.get('Description')

    # Validate required fields
    if not name or not location:
        return jsonify({"message": "Apartment name and location are required."}), 400

    # Create and save apartment
    new_apartment = Apartment(
        ApartmentName=name,
        Location=location,
        Description=description,
        UserID=user.UserID
    )

    db.session.add(new_apartment)
    db.session.commit()

    return jsonify({
        "message": "✅ Apartment created successfully!",
        "Apartment": {
            "ApartmentID": new_apartment.ApartmentID,
            "ApartmentName": new_apartment.ApartmentName,
            "Location": new_apartment.Location,
            "Description": new_apartment.Description,
            "Owner": user.FullName
        }
    }), 201

# Route for viewing for viewing all apartments by logged in landlord


@routes.route('/myapartments', methods=['GET'])
@jwt_required()
def get_my_apartments():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"message": "Unauthorized. Only landlords can view their apartments."}), 403

    q = (
        db.session.query(
            Apartment.ApartmentID,
            Apartment.ApartmentName,
            Apartment.Location,
            Apartment.Description,
            Apartment.CreatedAt,
            func.count(RentalUnit.UnitID).label('total_units'),
            func.sum(case((RentalUnitStatus.StatusName == 'Occupied', 1), else_=0)).label(
                'occupied_units'),
            func.sum(case((RentalUnitStatus.StatusName == 'Vacant', 1), else_=0)).label(
                'vacant_units'),
            func.sum(case((RentalUnitStatus.StatusName == 'Reserved', 1), else_=0)).label(
                'reserved_units'),
        )
        .outerjoin(RentalUnit, RentalUnit.ApartmentID == Apartment.ApartmentID)
        .outerjoin(RentalUnitStatus, RentalUnitStatus.StatusID == RentalUnit.StatusID)
        .filter(Apartment.UserID == user.UserID)
        .group_by(
            Apartment.ApartmentID, Apartment.ApartmentName,
            Apartment.Location, Apartment.Description, Apartment.CreatedAt
        )
        .order_by(Apartment.CreatedAt.desc())
    )

    apartments = []
    for r in q.all():
        total = int(r.total_units or 0)
        vac = int(r.vacant_units or 0)
        apartments.append({
            "ApartmentID": r.ApartmentID,
            "ApartmentName": r.ApartmentName,
            "Location": r.Location,
            "Description": r.Description,
            "CreatedAt": r.CreatedAt.strftime('%Y-%m-%d %H:%M:%S') if r.CreatedAt else None,
            "Stats": {
                "TotalUnits": total,
                "OccupiedUnits": int(r.occupied_units or 0),
                "VacantUnits": vac,
                "ReservedUnits": int(r.reserved_units or 0),
                "VacancyRate": round((vac/total)*100, 1) if total else 0.0
            }
        })

    return jsonify({
        "message": f"✅ Found {len(apartments)} apartment(s) for landlord {user.FullName}.",
        "Apartments": apartments
    }), 200

# route for updating the details of an apartment


@routes.route('/apartments/update/<int:apartment_id>', methods=['PUT'])
@jwt_required()
def update_apartment(apartment_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"message": "Unauthorized. Only landlords can update apartments."}), 403

    apartment = Apartment.query.get(apartment_id)

    if not apartment:
        return jsonify({"message": "Apartment not found."}), 404

    if apartment.UserID != user.UserID:
        return jsonify({"message": "You can only update your own apartments."}), 403

    data = request.get_json()
    name = data.get('ApartmentName')
    location = data.get('Location')
    description = data.get('Description')

    # Update only if values are provided
    if name:
        apartment.ApartmentName = name
    if location:
        apartment.Location = location
    if description:
        apartment.Description = description

    db.session.commit()

    return jsonify({
        "message": "✅ Apartment updated successfully.",
        "Apartment": {
            "ApartmentID": apartment.ApartmentID,
            "ApartmentName": apartment.ApartmentName,
            "Location": apartment.Location,
            "Description": apartment.Description
        }
    }), 200

# Viewing aparticular apartment


@routes.route('/apartments/<int:apartment_id>', methods=['GET'])
@jwt_required()
def view_apartment(apartment_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"message": "Unauthorized. Only landlords can view apartment details."}), 403

    apartment = Apartment.query.get(apartment_id)

    if not apartment:
        return jsonify({"message": "Apartment not found."}), 404

    if apartment.UserID != user.UserID:
        return jsonify({"message": "Access denied. You can only view your own apartments."}), 403

    # Fetch associated rental units
    unit_list = []
    for unit in apartment.rental_units:
        unit_list.append({
            "UnitID": unit.UnitID,
            "Label": unit.Label,
            "Description": unit.Description,
            "MonthlyRent": unit.MonthlyRent,
            # "AdditionalBills": unit.AdditionalBills,
            "Status": unit.status.StatusName if unit.status else None,
            "Category": unit.category.CategoryName if unit.category else None,
            "CreatedAt": unit.CreatedAt.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify({
        "ApartmentID": apartment.ApartmentID,
        "ApartmentName": apartment.ApartmentName,
        "Location": apartment.Location,
        "Description": apartment.Description,
        "CreatedAt": apartment.CreatedAt.strftime('%Y-%m-%d %H:%M:%S'),
        "RentalUnits": unit_list
    }), 200

# Create a Rental Unit Category


@routes.route('/unit-categories/create', methods=['POST'])
@jwt_required()
def create_unit_category():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # Only allow admins (landlords)
    if not user or not user.IsAdmin:
        return jsonify({"message": "Unauthorized. Only admins can create unit categories."}), 403

    data = request.get_json()
    category_name = data.get('CategoryName')

    if not category_name:
        return jsonify({"message": "Category name is required."}), 400

    # Check for duplicate
    existing = UnitCategory.query.filter_by(
        CategoryName=category_name.strip()).first()
    if existing:
        return jsonify({"message": f"'{category_name}' category already exists."}), 409

    # Create and save new category
    new_category = UnitCategory(CategoryName=category_name.strip())
    db.session.add(new_category)
    db.session.commit()

    return jsonify({
        "message": "✅ Unit category created successfully.",
        "UnitCategory": {
            "CategoryID": new_category.CategoryID,
            "CategoryName": new_category.CategoryName,
            "CreatedAt": new_category.CreatedAt.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 201

# Fetching the rental units categories


@routes.route('/unit-categories', methods=['GET'])
@jwt_required()
def get_unit_categories():
    categories = UnitCategory.query.order_by(UnitCategory.CategoryName).all()

    results = [
        {
            "CategoryID": cat.CategoryID,
            "CategoryName": cat.CategoryName,
            "CreatedAt": cat.CreatedAt.strftime('%Y-%m-%d %H:%M:%S')
        }
        for cat in categories
    ]

    return jsonify({
        "message": f"✅ Found {len(results)} unit category(ies).",
        "UnitCategories": results
    }), 200


# route for creating a rental unit status
@routes.route('/rental-unit-statuses/create', methods=['POST'])
@jwt_required()
def create_rental_unit_status():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # Ensure only admin/landlord can access
    if not user or not user.IsAdmin:
        return jsonify({"message": "Unauthorized. Only admins can create rental unit statuses."}), 403

    data = request.get_json()
    status_name = data.get('StatusName')

    if not status_name:
        return jsonify({"message": "Status name is required."}), 400

    # Check for duplicate
    existing_status = RentalUnitStatus.query.filter_by(
        StatusName=status_name.strip()).first()
    if existing_status:
        return jsonify({"message": f"'{status_name}' status already exists."}), 409

    # Create and save the new status
    new_status = RentalUnitStatus(StatusName=status_name.strip())
    db.session.add(new_status)
    db.session.commit()

    return jsonify({
        "message": "✅ Rental unit status created successfully.",
        "RentalUnitStatus": {
            "StatusID": new_status.StatusID,
            "StatusName": new_status.StatusName,
            "CreatedAt": new_status.CreatedAt.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 201

# Fetching rental unit status


@routes.route('/rental-unit-statuses', methods=['GET'])
@jwt_required()
def get_rental_unit_statuses():
    statuses = RentalUnitStatus.query.order_by(
        RentalUnitStatus.StatusName).all()

    results = [
        {
            "StatusID": status.StatusID,
            "StatusName": status.StatusName,
            "CreatedAt": status.CreatedAt.strftime('%Y-%m-%d %H:%M:%S')
        }
        for status in statuses
    ]

    return jsonify({
        "message": f"✅ Found {len(results)} rental unit status(es).",
        "RentalUnitStatuses": results
    }), 200

# Create a Rental Unit


@routes.route('/rental-units/create', methods=['POST'])
@jwt_required()
def create_rental_unit():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # Ensure user is an admin/landlord
    if not user or not user.IsAdmin:
        return jsonify({"message": "Unauthorized. Only landlords can create rental units."}), 403

    data = request.get_json()
    apartment_id = data.get('ApartmentID')
    label = data.get('Label')
    description = data.get('Description')
    monthly_rent = data.get('MonthlyRent')
    # additional_bills = data.get('AdditionalBills', 0.0)
    status_id = data.get('StatusID')  # Typically Vacant by default
    category_id = data.get('CategoryID')

    # ✅ Validate required fields
    if not all([apartment_id, label, monthly_rent, category_id, status_id]):
        return jsonify({"message": "Missing required fields (ApartmentID, Label, MonthlyRent, CategoryID, StatusID)."}), 400

    # ✅ Ensure the apartment belongs to this landlord
    apartment = Apartment.query.get(apartment_id)
    if not apartment or apartment.UserID != user.UserID:
        return jsonify({"message": "You can only add units to your own apartments."}), 403

    # ✅ Create and save the new rental unit
    rental_unit = RentalUnit(
        ApartmentID=apartment_id,
        Label=label,
        Description=description,
        MonthlyRent=monthly_rent,
        # AdditionalBills=additional_bills,
        StatusID=status_id,
        CategoryID=category_id
    )

    db.session.add(rental_unit)
    db.session.commit()

    return jsonify({
        "message": "✅ Rental unit created successfully.",
        "RentalUnit": {
            "UnitID": rental_unit.UnitID,
            "Label": rental_unit.Label,
            "MonthlyRent": rental_unit.MonthlyRent,
            # "AdditionalBills": rental_unit.AdditionalBills,
            "CategoryID": rental_unit.CategoryID,
            "StatusID": rental_unit.StatusID,
            "ApartmentID": rental_unit.ApartmentID,
            "CreatedAt": rental_unit.CreatedAt.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 201


# Update a Rental Unit
@routes.route('/rental-units/update/<int:unit_id>', methods=['PUT'])
@jwt_required()
def update_rental_unit(unit_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"message": "Unauthorized. Only landlords can update rental units."}), 403

    unit = RentalUnit.query.get(unit_id)

    if not unit:
        return jsonify({"message": "Rental unit not found."}), 404

    # Ensure the unit belongs to an apartment owned by this user
    apartment = Apartment.query.get(unit.ApartmentID)
    if not apartment or apartment.UserID != user.UserID:
        return jsonify({"message": "You can only update units in your own apartments."}), 403

    data = request.get_json()

    # Update provided fields only
    unit.Label = data.get('Label', unit.Label)
    unit.Description = data.get('Description', unit.Description)
    unit.MonthlyRent = data.get('MonthlyRent', unit.MonthlyRent)
    # unit.AdditionalBills = data.get('AdditionalBills', unit.AdditionalBills)
    unit.StatusID = data.get('StatusID', unit.StatusID)
    unit.CategoryID = data.get('CategoryID', unit.CategoryID)

    db.session.commit()

    return jsonify({
        "message": "✅ Rental unit updated successfully.",
        "RentalUnit": {
            "UnitID": unit.UnitID,
            "Label": unit.Label,
            "Description": unit.Description,
            "MonthlyRent": unit.MonthlyRent,
            # "AdditionalBills": unit.AdditionalBills,
            "StatusID": unit.StatusID,
            "CategoryID": unit.CategoryID,
            "ApartmentID": unit.ApartmentID,
            "UpdatedAt": datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 200

# Fetch rental units for a specific apartment


@routes.route('/apartments/<int:apartment_id>/units', methods=['GET'])
@jwt_required()
def get_units_by_apartment(apartment_id):
    user_id = get_jwt_identity()
    # Confirm landlord owns the apartment
    apartment = Apartment.query.filter_by(
        ApartmentID=apartment_id, UserID=user_id).first()

    if not apartment:
        return jsonify({"message": "Apartment not found or not owned by you."}), 404

    # Get all rental units under this apartment
    units = RentalUnit.query.filter_by(ApartmentID=apartment_id).all()

    result = []
    for unit in units:
        result.append({
            "UnitID": unit.UnitID,
            "Label": unit.Label,
            "Description": unit.Description,
            "RentAmount": unit.MonthlyRent,
            "StatusID": unit.StatusID,
            "CategoryID": unit.CategoryID
        })

    return jsonify(result), 200

# Route for assigning tenants to rental units


@routes.route('/tenants/add', methods=['POST'])
@jwt_required()
def add_tenant():
    user_id = get_jwt_identity()
    data = request.get_json()

    full_name = data.get('FullName')
    phone = data.get('Phone')
    email = data.get('Email')
    id_number = data.get('IDNumber')
    rental_unit_id = data.get('RentalUnitID')
    move_in_date = data.get('MoveInDate')

    # Validate required fields
    if not all([full_name, phone, id_number, rental_unit_id, move_in_date]):
        return jsonify({"message": "All required fields must be filled."}), 400

    # Validate phone format
    if not re.fullmatch(r'2547\d{8}', phone):
        return jsonify({"message": "Invalid phone number. It must start with '2547' and be 12 digits long."}), 400

    # Parse move-in date
    try:
        move_in = datetime.strptime(move_in_date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"message": "Invalid date format. Use YYYY-MM-DD."}), 400

    # Fetch unit
    unit = RentalUnit.query.get(rental_unit_id)
    if not unit:
        return jsonify({"message": "Rental unit not found."}), 404

    # Verify landlord owns the apartment
    apartment = Apartment.query.get(unit.ApartmentID)
    if not apartment or apartment.UserID != user_id:
        return jsonify({"message": "Unauthorized: You do not own the apartment for this unit."}), 403

    # Check if unit is vacant
    if unit.StatusID != 1:  # 1 = Vacant
        return jsonify({"message": "This unit is not available. Only vacant units can be assigned."}), 400

    # ✅ Check for returning inactive tenant
    existing_tenant = Tenant.query.filter_by(
        Phone=phone, IDNumber=id_number).first()
    if existing_tenant:
        if existing_tenant.Status == 'Inactive':
            # Reactivate and assign new unit
            existing_tenant.RentalUnitID = rental_unit_id
            existing_tenant.MoveInDate = move_in
            existing_tenant.MoveOutDate = None
            existing_tenant.Status = 'Active'

            unit.StatusID = 2
            unit.CurrentTenantID = existing_tenant.TenantID

            # ✅ Log this as a returning tenant move
            log = TransferLog(
                TenantID=existing_tenant.TenantID,
                OldUnitID=None,
                NewUnitID=rental_unit_id,
                TransferredBy=user_id,
                Reason="Returning tenant"
            )
            db.session.add(log)
            db.session.commit()

            return jsonify({
                "message": f"🔁 Returning tenant {existing_tenant.FullName} successfully reassigned to {unit.Label}.",
                "tenant": {
                    "TenantID": existing_tenant.TenantID,
                    "FullName": existing_tenant.FullName,
                    "RentalUnit": unit.Label,
                    "MoveInDate": existing_tenant.MoveInDate.strftime('%Y-%m-%d')
                }
            }), 200
        else:
            return jsonify({"message": "A tenant with this phone number is already active."}), 400

    # ✅ New tenant logic
    tenant = Tenant(
        FullName=full_name,
        Phone=phone,
        Email=email,
        IDNumber=id_number,
        RentalUnitID=rental_unit_id,
        MoveInDate=move_in,
        Status="Active"
    )
    db.session.add(tenant)
    db.session.flush()

    unit.StatusID = 2
    unit.CurrentTenantID = tenant.TenantID

    # Optional: trigger SMS
    # sms_message = f"Dear {tenant.FullName}, you have been successfully allocated to unit {unit.Label}."
    # send_sms(tenant.Phone, sms_message)

    db.session.commit()

    return jsonify({
        "message": f"✅ Tenant {tenant.FullName} successfully assigned to {unit.Label}.",
        "tenant": {
            "TenantID": tenant.TenantID,
            "FullName": tenant.FullName,
            "Phone": tenant.Phone,
            "Email": tenant.Email,
            "IDNumber": tenant.IDNumber,
            "RentalUnit": unit.Label,
            "MoveInDate": tenant.MoveInDate.strftime('%Y-%m-%d')
        }
    }), 201

# route for vacating tenant


@routes.route('/tenants/vacate/<int:tenant_id>', methods=['PUT'])
@jwt_required()
def vacate_unit(tenant_id):
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    reason = data.get("Reason")
    notes = data.get("Notes")

    tenant = Tenant.query.get(tenant_id)
    if not tenant:
        return jsonify({"message": "Tenant not found."}), 404

    if tenant.Status != "Active":
        return jsonify({"message": "This tenant is already inactive."}), 400

    unit = RentalUnit.query.get(tenant.RentalUnitID)
    if not unit:
        return jsonify({"message": "Rental unit not found."}), 404

    if unit.StatusID == 1:
        return jsonify({"message": "This unit is already vacant."}), 400

    apartment = Apartment.query.get(unit.ApartmentID)
    if not apartment or apartment.UserID != user_id:
        return jsonify({"message": "Unauthorized: You do not own the apartment for this unit."}), 403

    # Update tenant status and move-out time
    tenant.Status = "Inactive"
    tenant.MoveOutDate = datetime.utcnow()

    # Update rental unit status
    unit.StatusID = 1  # Vacant
    unit.CurrentTenantID = None

    # Log vacate action
    vacate_log = VacateLog(
        TenantID=tenant.TenantID,
        UnitID=unit.UnitID,
        ApartmentID=apartment.ApartmentID,
        VacatedBy=user_id,
        VacateDate=datetime.utcnow(),
        Reason=reason,
        Notes=notes
    )
    db.session.add(vacate_log)

    # --- Optional: send SMS to tenant (commented out for now) ---
    # if tenant.Phone:
    #     message = f"Dear {tenant.FullName}, your move-out from unit {unit.Label} has been successfully recorded. Thank you."
    #     send_sms(phone_number=tenant.Phone, message=message)

    db.session.commit()

    return jsonify({
        "message": f"✅ Tenant {tenant.FullName} has been vacated from unit {unit.Label}.",
        "vacate_log": {
            "TenantID": tenant.TenantID,
            "UnitID": unit.UnitID,
            "ApartmentID": apartment.ApartmentID,
            "VacatedBy": user_id,
            "Reason": reason,
            "Notes": notes,
            "VacateDate": vacate_log.VacateDate.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 200


# Transfering a tenant from apartment to another apartment
@routes.route('/tenants/transfer/<int:tenant_id>', methods=['PUT'])
@jwt_required()
def transfer_tenant(tenant_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    new_unit_id = data.get('NewRentalUnitID')
    move_in_date = data.get('MoveInDate')
    reason = data.get('Reason', 'Unit-to-unit transfer')

    if not new_unit_id or not move_in_date:
        return jsonify({"message": "NewRentalUnitID and MoveInDate are required."}), 400

    try:
        new_move_in = datetime.strptime(move_in_date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"message": "Invalid date format. Use YYYY-MM-DD."}), 400

    tenant = Tenant.query.get(tenant_id)
    if not tenant:
        return jsonify({"message": "Tenant not found."}), 404

    old_unit = RentalUnit.query.get(tenant.RentalUnitID)
    if not old_unit:
        return jsonify({"message": "Current rental unit not found."}), 404

    new_unit = RentalUnit.query.get(new_unit_id)
    if not new_unit:
        return jsonify({"message": "New rental unit not found."}), 404

    old_apartment = Apartment.query.get(old_unit.ApartmentID)
    new_apartment = Apartment.query.get(new_unit.ApartmentID)

    if not old_apartment or not new_apartment or old_apartment.UserID != user_id or new_apartment.UserID != user_id:
        return jsonify({"message": "Unauthorized: You can only transfer between your own units."}), 403

    if new_unit.StatusID != 1:
        return jsonify({"message": "New unit is not available. Only vacant units can be assigned."}), 400

    # Vacate old unit
    old_unit.StatusID = 1
    old_unit.CurrentTenantID = None

    # Assign tenant to new unit
    tenant.RentalUnitID = new_unit_id
    tenant.MoveInDate = new_move_in
    tenant.MoveOutDate = None
    tenant.Status = "Active"

    new_unit.StatusID = 2
    new_unit.CurrentTenantID = tenant.TenantID

    # ✅ Log the transfer
    transfer_log = TransferLog(
        TenantID=tenant.TenantID,
        OldUnitID=old_unit.UnitID,
        NewUnitID=new_unit.UnitID,
        TransferredBy=user_id,
        Reason=reason
    )
    db.session.add(transfer_log)

    db.session.commit()

    # --- Optional Notifications ---
    # sms_message = (
    #     f"Dear {tenant.FullName}, you have been successfully transferred from unit {old_unit.Label} in "
    #     f"{old_apartment.ApartmentName} to unit {new_unit.Label} in {new_apartment.ApartmentName}. "
    #     f"Your new move-in date is {tenant.MoveInDate.strftime('%Y-%m-%d')}."
    # )
    # send_sms(tenant.Phone, sms_message)  # Implement send_sms() in utils.py

    # email_subject = "NyumbaSmart - Tenant Transfer Notification"
    # email_body = (
    #     f"Hello {tenant.FullName},\n\n"
    #     f"This is to confirm that you have been successfully transferred from:\n"
    #     f" - Unit: {old_unit.Label}, Apartment: {old_apartment.ApartmentName}\n"
    #     f"to:\n"
    #     f" - Unit: {new_unit.Label}, Apartment: {new_apartment.ApartmentName}\n\n"
    #     f"Effective Move-In Date: {tenant.MoveInDate.strftime('%Y-%m-%d')}\n\n"
    #     f"Thank you for staying with us.\n\n"
    #     f"NyumbaSmart Team"
    # )
    # send_email(to=tenant.Email, subject=email_subject, body=email_body)  # Implement send_email()

    return jsonify({
        "message": f"✅ Tenant {tenant.FullName} successfully transferred from unit {old_unit.Label} in apartment '{old_apartment.ApartmentName}' "
                   f"to unit {new_unit.Label} in apartment '{new_apartment.ApartmentName}'.",
        "from_unit": old_unit.Label,
        "from_apartment": old_apartment.ApartmentName,
        "to_unit": new_unit.Label,
        "to_apartment": new_apartment.ApartmentName,
        "MoveInDate": tenant.MoveInDate.strftime('%Y-%m-%d')
    }), 200


# # Route for allocating a tenant to a different rental unit in the same apartment
@routes.route('/tenants/transfer/<int:id>', methods=['PUT'])
@jwt_required()
def transfer_tenant_by_id(id):
    user_id = get_jwt_identity()
    data = request.get_json()

    new_unit_id = data.get('NewRentalUnitID')
    move_in_date = data.get('MoveInDate')
    reason = data.get('Reason')  # Optional

    if not new_unit_id or not move_in_date:
        return jsonify({"message": "NewRentalUnitID and MoveInDate are required."}), 400

    try:
        new_move_in = datetime.strptime(move_in_date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"message": "Invalid date format. Use YYYY-MM-DD."}), 400

    # Get tenant
    tenant = Tenant.query.get(id)
    if not tenant:
        return jsonify({"message": "Tenant not found."}), 404

    # Get old and new units
    old_unit = RentalUnit.query.get(tenant.RentalUnitID)
    new_unit = RentalUnit.query.get(new_unit_id)
    if not old_unit or not new_unit:
        return jsonify({"message": "Rental unit not found."}), 404

    # Validate ownership
    old_apartment = Apartment.query.get(old_unit.ApartmentID)
    new_apartment = Apartment.query.get(new_unit.ApartmentID)
    if not old_apartment or not new_apartment or old_apartment.UserID != user_id or new_apartment.UserID != user_id:
        return jsonify({"message": "Unauthorized: You can only transfer between your own apartments."}), 403

    # Check that the new unit is vacant
    if new_unit.StatusID != 1:
        return jsonify({"message": "New unit is not vacant."}), 400

    old_unit.StatusID = 1
    old_unit.CurrentTenantID = None

    tenant.RentalUnitID = new_unit_id
    tenant.MoveInDate = new_move_in
    tenant.MoveOutDate = None
    tenant.Status = 'Active'

    new_unit.StatusID = 2
    new_unit.CurrentTenantID = tenant.TenantID

    log = TransferLog(
        TenantID=tenant.TenantID,
        OldUnitID=old_unit.UnitID,
        NewUnitID=new_unit.UnitID,
        TransferredBy=user_id,
        Reason=reason
    )
    db.session.add(log)
    db.session.flush()  # ✅ Ensures log.TransferDate and ID are populated before access

    db.session.commit()

    # 6. Optional: Send SMS notification to the tenant (commented out)
    """
    try:
        message = (
            f"Hello {tenant.FullName}, your rental unit has been updated.\n"
            f"You've been transferred from unit {old_unit.Label} to unit {new_unit.Label} "
            f"effective {move_in_date}. Welcome to your new space!"
        )
        tenant_phone = tenant.Phone

        # Example using requests to send SMS via API (replace with actual provider)
        import requests
        sms_payload = {
            'to': tenant_phone,
            'message': message
        }
        response = requests.post('https://api.smsprovider.com/send', json=sms_payload)

        # Optional: log or handle response status
        if response.status_code != 200:
            print(f"Failed to send SMS: {response.text}")
    except Exception as e:
        print(f"SMS sending failed: {str(e)}")
    """

    return jsonify({
        "message": f"✅ Tenant {tenant.FullName} has been transferred to unit {new_unit.Label}.",
        "log": {
            "TenantID": tenant.TenantID,
            "FromUnit": old_unit.Label,
            "ToUnit": new_unit.Label,
            "Reason": reason,
            "TransferDate": log.TransferDate.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 200

# ✅ Route to view all active tenants for the logged-in landlord


@routes.route('/tenants', methods=['GET'])
@jwt_required()
def get_all_tenants():
    user_id = get_jwt_identity()
    page = max(int(request.args.get('page', 1)), 1)
    limit = min(max(int(request.args.get('limit', 20)), 1), 100)
    qstr = (request.args.get('query') or '').strip()
    apartment_filter = request.args.get('apartment_id', type=int)
    status_filter = (request.args.get('status') or '').strip()

    # landlord apartments -> units
    apartment_ids = [
        a.ApartmentID for a in Apartment.query.filter_by(UserID=user_id).all()]
    units_q = RentalUnit.query.filter(
        RentalUnit.ApartmentID.in_(apartment_ids))
    if apartment_filter:
        units_q = units_q.filter_by(ApartmentID=apartment_filter)
    units = units_q.all()
    unit_ids = [u.UnitID for u in units]
    unit_by_id = {u.UnitID: u for u in units}

    tq = Tenant.query.filter(Tenant.RentalUnitID.in_(unit_ids))
    if status_filter:
        tq = tq.filter(Tenant.Status == status_filter)
    if qstr:
        like = f"%{qstr}%"
        tq = tq.filter(
            (Tenant.FullName.ilike(like)) |
            (Tenant.Phone.ilike(like)) |
            (Tenant.Email.ilike(like)) |
            (Tenant.IDNumber.ilike(like))
        )

    total = tq.count()
    items = (tq.order_by(Tenant.CreatedAt.desc())
               .offset((page-1)*limit)
               .limit(limit)
               .all())

    out = []
    for t in items:
        u = unit_by_id.get(t.RentalUnitID)
        a = Apartment.query.get(u.ApartmentID) if u else None
        out.append({
            "TenantID": t.TenantID, "FullName": t.FullName, "Phone": t.Phone,
            "Email": t.Email, "IDNumber": t.IDNumber, "Status": t.Status,
            "Apartment": a.ApartmentName if a else "N/A",
            "Unit": u.Label if u else "N/A",
            "MoveInDate": t.MoveInDate.strftime("%Y-%m-%d") if t.MoveInDate else None,
            "MoveOutDate": t.MoveOutDate.strftime("%Y-%m-%d") if t.MoveOutDate else None,
        })

    return jsonify({
        "page": page, "limit": limit, "total": total, "items": out
    }), 200


# Route for creating and sending a vacation notice to a tenant
@routes.route('/vacate-notice/<int:tenant_id>', methods=['POST'])
@jwt_required()
def create_vacate_notice(tenant_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    expected_vacate_date = data.get('ExpectedVacateDate')
    reason = data.get('Reason')
    inspection_date = data.get('InspectionDate')

    if not expected_vacate_date:
        return jsonify({"message": "ExpectedVacateDate is required."}), 400

    try:
        vacate_date = datetime.strptime(
            expected_vacate_date, '%Y-%m-%d').date()
        inspection = datetime.strptime(
            inspection_date, '%Y-%m-%d').date() if inspection_date else None
    except ValueError:
        return jsonify({"message": "Invalid date format. Use YYYY-MM-DD."}), 400

    tenant = Tenant.query.get(tenant_id)
    if not tenant:
        return jsonify({"message": "Tenant not found."}), 404

    unit = RentalUnit.query.get(tenant.RentalUnitID)
    apartment = Apartment.query.get(unit.ApartmentID) if unit else None

    if not apartment or apartment.UserID != user_id:
        return jsonify({"message": "Unauthorized. You do not own this apartment."}), 403

    existing_notice = VacateNotice.query.filter_by(
        TenantID=tenant_id,
        Status='Pending'
    ).first()
    if existing_notice:
        return jsonify({"message": "A pending vacate notice already exists for this tenant."}), 400

    notice = VacateNotice(
        TenantID=tenant.TenantID,
        RentalUnitID=tenant.RentalUnitID,
        ExpectedVacateDate=vacate_date,
        Reason=reason,
        InspectionDate=inspection
    )

    db.session.add(notice)
    db.session.commit()

    # ✅ OPTIONAL: Send SMS Notification (Commented out)
    """
    try:
        message = (
            f"Hello {tenant.FullName},\n"
            f"Your vacating notice has been received.\n"
            f"Inspection is scheduled for: {inspection.strftime('%Y-%m-%d') if inspection else 'Not Scheduled'}\n"
            f"Expected move-out date: {vacate_date.strftime('%Y-%m-%d')}.\n"
            f"Thank you for staying with us."
        )
        tenant_phone = tenant.Phone

        # Replace this block with actual SMS API integration
        import requests
        sms_payload = {
            'to': tenant_phone,
            'message': message
        }
        # Example: requests.post('https://api.smsprovider.com/send', json=sms_payload)

    except Exception as e:
        print(f"❌ Failed to send SMS: {str(e)}")
    """

    return jsonify({
        "message": "✅ Vacate notice created successfully.",
        "Tenant": tenant.FullName,
        "Apartment": apartment.ApartmentName,
        "RentalUnit": unit.Label,
        "ExpectedVacateDate": vacate_date.strftime('%Y-%m-%d'),
        "InspectionDate": inspection.strftime('%Y-%m-%d') if inspection else "Not Scheduled"
    }), 201


@routes.route('/logs/timeline', methods=['GET'])
@jwt_required()
def logs_timeline():
    user_id = get_jwt_identity()
    month_in = (request.args.get("month") or "").strip()
    log_type = (request.args.get("type") or "all").lower()
    search = (request.args.get("q") or request.args.get(
        "search") or "").strip().lower()
    apartment_filter = request.args.get("apartment_id", type=int)
    page = max(int(request.args.get("page", 1)), 1)
    limit = min(max(int(request.args.get("limit", 100)), 1), 500)

    y, m = _parse_month_any(month_in)
    apt_ids, unit_ids, unit_by_id = _landlord_scope_ids(
        user_id, apartment_filter)

    # Transfers that touch landlord units (from OR to)
    tq = TransferLog.query.filter(
        (TransferLog.OldUnitID.in_(unit_ids)) | (
            TransferLog.NewUnitID.in_(unit_ids))
    )
    if y and m:
        tq = tq.filter(func.extract('year', TransferLog.TransferDate) == y,
                       func.extract('month', TransferLog.TransferDate) == m)

    # Vacates within landlord apartments
    vq = VacateLog.query.filter(VacateLog.ApartmentID.in_(apt_ids))
    if y and m:
        vq = vq.filter(func.extract('year', VacateLog.VacateDate) == y,
                       func.extract('month', VacateLog.VacateDate) == m)

    items = []

    # Transfers
    if log_type in ("all", "transfer"):
        for t in tq.all():
            tenant = Tenant.query.get(t.TenantID)
            old_u = unit_by_id.get(t.OldUnitID)
            new_u = unit_by_id.get(t.NewUnitID)
            hay = " ".join([
                (t.Reason or ""),
                (tenant.FullName if tenant else ""),
                (old_u.Label if old_u else ""),
                (new_u.Label if new_u else "")
            ]).lower()
            if search and search not in hay:
                continue
            items.append({
                "id": f"T-{t.LogID}",
                "type": "transfer",
                "TenantID": t.TenantID,
                "TenantName": tenant.FullName if tenant else "Unknown",
                "FromUnit": old_u.Label if old_u else "N/A",
                "ToUnit": new_u.Label if new_u else "N/A",
                "Reason": t.Reason or "",
                "Timestamp": _fmt_dt(t.TransferDate)
            })

    # Vacates
    if log_type in ("all", "vacate"):
        for v in vq.all():
            tenant = Tenant.query.get(v.TenantID)
            unit = unit_by_id.get(v.UnitID)
            hay = " ".join([
                (v.Reason or ""), (v.Notes or ""),
                (tenant.FullName if tenant else ""),
                (unit.Label if unit else "")
            ]).lower()
            if search and search not in hay:
                continue
            items.append({
                "id": f"V-{v.LogID}",
                "type": "vacate",
                "TenantID": v.TenantID,
                "TenantName": tenant.FullName if tenant else "Unknown",
                "Unit": unit.Label if unit else "N/A",
                "Reason": v.Reason or "",
                "Notes": v.Notes or "",
                "Timestamp": _fmt_dt(v.VacateDate)
            })

    # Sort + paginate
    items.sort(key=lambda e: e["Timestamp"] or "", reverse=True)
    start = (page - 1) * limit
    end = start + limit
    sliced = items[start:end]

    return jsonify({
        "page": page,
        "limit": limit,
        "total": len(items),
        "items": sliced
    }), 200

# GET /logs/stats
# KPI summary for the selected month: transfers, vacates, unitsImpacted, topReason.
# Filters: month (YYYY-MM or 'MMMM YYYY'), apartment_id (optional)
# ──────────────────────────────────────────────────────────────────────────────


@routes.route('/logs/stats', methods=['GET'])
@jwt_required()
def logs_stats():
    user_id = get_jwt_identity()
    month_in = (request.args.get("month") or "").strip()
    apartment_filter = request.args.get("apartment_id", type=int)

    y, m = _parse_month_any(month_in)
    apt_ids, unit_ids, _ = _landlord_scope_ids(user_id, apartment_filter)

    tq = TransferLog.query.filter(
        (TransferLog.OldUnitID.in_(unit_ids)) | (
            TransferLog.NewUnitID.in_(unit_ids))
    )
    vq = VacateLog.query.filter(VacateLog.ApartmentID.in_(apt_ids))

    if y and m:
        tq = tq.filter(func.extract('year', TransferLog.TransferDate) == y,
                       func.extract('month', TransferLog.TransferDate) == m)
        vq = vq.filter(func.extract('year', VacateLog.VacateDate) == y,
                       func.extract('month', VacateLog.VacateDate) == m)

    transfers = tq.all()
    vacates = vq.all()

    units_impacted = len({t.NewUnitID for t in transfers}
                         | {v.UnitID for v in vacates})

    reasons = [t.Reason for t in transfers if t.Reason] + \
        [v.Reason for v in vacates if v.Reason]
    top_reason = "—"
    if reasons:
        counts = {}
        for r in reasons:
            counts[r] = counts.get(r, 0) + 1
        top_reason = max(counts, key=counts.get)

    return jsonify({
        "month": month_in or "All",
        "transfers": len(transfers),
        "vacates": len(vacates),
        "unitsImpacted": units_impacted,
        "topReason": top_reason
    }), 200
# ──────────────────────────────────────────────────────────────────────────────
# GET /logs/recent
# Latest N transfer logs and vacate logs (for the two side tables).
# Filters: limit (default 5), apartment_id (optional)
# ──────────────────────────────────────────────────────────────────────────────


@routes.route('/logs/recent', methods=['GET'])
@jwt_required()
def logs_recent():
    user_id = get_jwt_identity()
    lim = min(max(request.args.get("limit", default=5, type=int), 1), 50)
    apartment_filter = request.args.get("apartment_id", type=int)

    apt_ids, unit_ids, unit_by_id = _landlord_scope_ids(
        user_id, apartment_filter)

    transfers = (TransferLog.query
                 .filter((TransferLog.OldUnitID.in_(unit_ids)) | (TransferLog.NewUnitID.in_(unit_ids)))
                 .order_by(TransferLog.TransferDate.desc())
                 .limit(lim).all())
    vacates = (VacateLog.query
               .filter(VacateLog.ApartmentID.in_(apt_ids))
               .order_by(VacateLog.VacateDate.desc())
               .limit(lim).all())

    recent_transfers = []
    for t in transfers:
        tenant = Tenant.query.get(t.TenantID)
        recent_transfers.append({
            "Date": _fmt_dt(t.TransferDate),
            "TenantID": t.TenantID,
            "TenantName": tenant.FullName if tenant else "Unknown",
            "From": unit_by_id.get(t.OldUnitID).Label if unit_by_id.get(t.OldUnitID) else "N/A",
            "To": unit_by_id.get(t.NewUnitID).Label if unit_by_id.get(t.NewUnitID) else "N/A",
            "Reason": t.Reason or "—"
        })

    recent_vacates = []
    for v in vacates:
        tenant = Tenant.query.get(v.TenantID)
        recent_vacates.append({
            "Date": _fmt_dt(v.VacateDate),
            "TenantID": v.TenantID,
            "TenantName": tenant.FullName if tenant else "Unknown",
            "Unit": unit_by_id.get(v.UnitID).Label if unit_by_id.get(v.UnitID) else "N/A",
            "Reason": v.Reason or "—",
            "Notes": v.Notes or "—"
        })

    return jsonify({
        "recentTransfers": recent_transfers,
        "recentVacates": recent_vacates
    }), 200

# ──────────────────────────────────────────────────────────────────────────────
# GET /logs/alerts/repeat-transfers
# Detect tenants with more than <threshold> transfers in the last <months>.
# Filters: months=6 (default), threshold=2 (default), apartment_id (optional)
# ──────────────────────────────────────────────────────────────────────────────


@routes.route('/logs/alerts/repeat-transfers', methods=['GET'])
@jwt_required()
def logs_alerts_repeat_transfers():
    user_id = get_jwt_identity()
    months = request.args.get("months", type=int) or 6
    threshold = request.args.get("threshold", type=int) or 2
    apartment_filter = request.args.get("apartment_id", type=int)
    cutoff = datetime.utcnow() - timedelta(days=30 * months)

    _, unit_ids, _ = _landlord_scope_ids(user_id, apartment_filter)

    q = (TransferLog.query
         .filter(((TransferLog.OldUnitID.in_(unit_ids)) | (TransferLog.NewUnitID.in_(unit_ids))),
                 TransferLog.TransferDate >= cutoff))

    counts = {}
    last_dates = {}
    for t in q.all():
        counts[t.TenantID] = counts.get(t.TenantID, 0) + 1
        last_dates[t.TenantID] = max(last_dates.get(
            t.TenantID, datetime.min), t.TransferDate or datetime.min)

    flagged_ids = [tid for tid, c in counts.items() if c > threshold]
    flagged = []
    for tid in flagged_ids:
        tenant = Tenant.query.get(tid)
        flagged.append({
            "TenantID": tid,
            "TenantName": tenant.FullName if tenant else "Unknown",
            "TransfersInPeriod": counts[tid],
            "LastTransfer": _fmt_dt(last_dates.get(tid))
        })

    flagged.sort(key=lambda x: x["LastTransfer"] or "", reverse=True)
    return jsonify({
        "months": months,
        "threshold": threshold,
        "flagged": flagged
    }), 200


# ──────────────────────────────────────────────────────────────────────────────
# GET /logs/upcoming-vacates
# List pending vacate notices in the future (optionally within X days).
# Filters: days (optional horizon), apartment_id (optional)
# ──────────────────────────────────────────────────────────────────────────────
@routes.route('/logs/upcoming-vacates', methods=['GET'])
@jwt_required()
def logs_upcoming_vacates():
    user_id = get_jwt_identity()
    days = request.args.get("days", type=int)  # if None => all future
    apartment_filter = request.args.get("apartment_id", type=int)
    today = date.today()

    apt_ids, unit_ids, unit_by_id = _landlord_scope_ids(
        user_id, apartment_filter)

    q = (VacateNotice.query
         .filter(VacateNotice.RentalUnitID.in_(unit_ids),
                 VacateNotice.Status == 'Pending',
                 VacateNotice.ExpectedVacateDate >= today))
    if days:
        q = q.filter(VacateNotice.ExpectedVacateDate <=
                     (today + timedelta(days=days)))

    notices = q.order_by(VacateNotice.ExpectedVacateDate.asc()).all()

    out = []
    for n in notices:
        tenant = Tenant.query.get(n.TenantID)
        unit = unit_by_id.get(n.RentalUnitID)
        days_left = (n.ExpectedVacateDate - today).days
        out.append({
            "TenantID": n.TenantID,
            "TenantName": tenant.FullName if tenant else "Unknown",
            "Unit": unit.Label if unit else "N/A",
            "ExpectedVacateDate": n.ExpectedVacateDate.strftime("%Y-%m-%d"),
            "InspectionDate": n.InspectionDate.strftime("%Y-%m-%d") if n.InspectionDate else None,
            "Reason": n.Reason or "—",
            "Status": n.Status,
            "DaysLeft": days_left
        })

    return jsonify({"upcoming": out}), 200


# ──────────────────────────────────────────────────────────────────────────────
# GET /logs/export
# Download CSV of merged transfer + vacate events. Supports same filters
# as /logs/timeline (month, type, q/search, apartment_id).
# ──────────────────────────────────────────────────────────────────────────────
@routes.route('/logs/export', methods=['GET'])
@jwt_required()
def logs_export_csv():
    from io import StringIO
    import csv
    from flask import Response

    user_id = get_jwt_identity()
    month_in = (request.args.get("month") or "").strip()
    log_type = (request.args.get("type") or "all").lower()
    search = (request.args.get("q") or request.args.get(
        "search") or "").strip().lower()
    apartment_filter = request.args.get("apartment_id", type=int)

    y, m = _parse_month_any(month_in)
    apt_ids, unit_ids, unit_by_id = _landlord_scope_ids(
        user_id, apartment_filter)

    tq = TransferLog.query.filter(
        (TransferLog.OldUnitID.in_(unit_ids)) | (
            TransferLog.NewUnitID.in_(unit_ids))
    )
    vq = VacateLog.query.filter(VacateLog.ApartmentID.in_(apt_ids))

    if y and m:
        tq = tq.filter(func.extract('year', TransferLog.TransferDate) == y,
                       func.extract('month', TransferLog.TransferDate) == m)
        vq = vq.filter(func.extract('year', VacateLog.VacateDate) == y,
                       func.extract('month', VacateLog.VacateDate) == m)

    rows = []

    # Transfers
    if log_type in ("all", "transfer"):
        for t in tq.all():
            tenant = Tenant.query.get(t.TenantID)
            old_u = unit_by_id.get(t.OldUnitID)
            new_u = unit_by_id.get(t.NewUnitID)
            hay = " ".join([
                (t.Reason or ""),
                (tenant.FullName if tenant else ""),
                (old_u.Label if old_u else ""),
                (new_u.Label if new_u else "")
            ]).lower()
            if search and search not in hay:
                continue
            rows.append([
                "Transfer",
                tenant.FullName if tenant else "Unknown",
                f"{(old_u.Label if old_u else 'N/A')} -> {(new_u.Label if new_u else 'N/A')}",
                _fmt_dt(t.TransferDate),
                t.Reason or "",
                ""
            ])

    # Vacates
    if log_type in ("all", "vacate"):
        for v in vq.all():
            tenant = Tenant.query.get(v.TenantID)
            unit = unit_by_id.get(v.UnitID)
            hay = " ".join([
                (v.Reason or ""), (v.Notes or ""),
                (tenant.FullName if tenant else ""),
                (unit.Label if unit else "")
            ]).lower()
            if search and search not in hay:
                continue
            rows.append([
                "Vacate",
                tenant.FullName if tenant else "Unknown",
                (unit.Label if unit else "N/A"),
                _fmt_dt(v.VacateDate),
                v.Reason or "",
                v.Notes or ""
            ])

    rows.sort(key=lambda r: r[3] or "", reverse=True)

    sio = StringIO()
    writer = csv.writer(sio)
    writer.writerow(["Type", "Tenant", "Unit / From → To",
                    "Date", "Reason", "Notes"])
    writer.writerows(rows)
    sio.seek(0)

    filename = f"logs_{(month_in or 'all').replace(' ', '_')}.csv"
    return Response(
        sio.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
# View All Transfers for a Landlord


@routes.route('/transfer-logs', methods=['GET'])
@jwt_required()
def view_transfer_logs():
    user_id = get_jwt_identity()

    # Step 1: Get all apartments owned by this landlord
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apartment_ids = [apt.ApartmentID for apt in apartments]

    # Step 2: Get all units in those apartments
    units = RentalUnit.query.filter(
        RentalUnit.ApartmentID.in_(apartment_ids)).all()
    unit_ids = [unit.UnitID for unit in units]
    unit_dict = {unit.UnitID: unit for unit in units}

    # Step 3: Fetch relevant transfer logs where the tenant moved to or from a unit in the landlord’s apartments
    transfer_logs = TransferLog.query.filter(
        (TransferLog.OldUnitID.in_(unit_ids)) | (
            TransferLog.NewUnitID.in_(unit_ids))
    ).order_by(TransferLog.TransferDate.desc()).all()

    result = []
    for log in transfer_logs:
        tenant = Tenant.query.get(log.TenantID)
        old_unit = unit_dict.get(log.OldUnitID)
        new_unit = unit_dict.get(log.NewUnitID)

        old_apartment = Apartment.query.get(
            old_unit.ApartmentID) if old_unit else None
        new_apartment = Apartment.query.get(
            new_unit.ApartmentID) if new_unit else None

        result.append({
            "TenantID": tenant.TenantID,
            "TenantName": tenant.FullName,
            "FromUnit": old_unit.Label if old_unit else "N/A",
            "FromApartment": old_apartment.ApartmentName if old_apartment else "N/A",
            "ToUnit": new_unit.Label if new_unit else "N/A",
            "ToApartment": new_apartment.ApartmentName if new_apartment else "N/A",
            "TransferredByUserID": log.TransferredBy,
            "TransferDate": log.TransferDate.strftime('%Y-%m-%d %H:%M:%S'),
            "Reason": log.Reason
        })

    return jsonify({
        "total_transfers": len(result),
        "transfer_logs": result
    }), 200

# View Tenant Vacating History for Landlord


@routes.route('/vacate-logs', methods=['GET'])
@jwt_required()
def view_vacate_logs():
    user_id = get_jwt_identity()

    # Step 1: Get landlord's apartments
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apartment_ids = [a.ApartmentID for a in apartments]

    # Step 2: Get units in those apartments
    units = RentalUnit.query.filter(
        RentalUnit.ApartmentID.in_(apartment_ids)).all()
    unit_dict = {unit.UnitID: unit for unit in units}

    # Step 3: Query vacate logs for those units/apartments
    vacate_logs = VacateLog.query.filter(
        VacateLog.ApartmentID.in_(apartment_ids)
    ).order_by(VacateLog.VacateDate.desc()).all()

    result = []
    for log in vacate_logs:
        tenant = Tenant.query.get(log.TenantID)
        unit = unit_dict.get(log.UnitID)
        apartment = Apartment.query.get(log.ApartmentID)

        result.append({
            "TenantID": tenant.TenantID if tenant else None,
            "TenantName": tenant.FullName if tenant else "Unknown",
            "Apartment": apartment.ApartmentName if apartment else "N/A",
            "Unit": unit.Label if unit else "N/A",
            "VacateDate": log.VacateDate.strftime('%Y-%m-%d %H:%M:%S') if log.VacateDate else "N/A",
            "Reason": log.Reason or "Not Provided",
            "Notes": log.Notes or "None",
            "VacatedByUserID": log.VacatedBy
        })

    return jsonify({
        "total_vacate_logs": len(result),
        "vacate_logs": result
    }), 200


# ✅ Route for generating the monthly bill for all tenants
@routes.route('/bills/generate-or-update', methods=['POST'])
@jwt_required()
def generate_or_update_bills():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({
            "status": "error",
            "message": "Unauthorized. Only landlords can manage bills."
        }), 403

    data = request.get_json() or {}

    # Optional for individual tenant
    tenant_id = data.get("TenantID")
    billing_month = data.get("BillingMonth")         # e.g., "July 2025"
    utilities_data = data.get("utilities", {}) or {}

    # ✅ If BillingMonth not provided, use current month label
    if not billing_month:
        today = datetime.today()
        billing_month = today.strftime("%B %Y")

    # 🆕 Try to derive canonical first-of-month date for BillingPeriod (safe no-op if parse fails)
    def _parse_period(label: str):
        try:
            dt = datetime.strptime(label, "%B %Y")
            return datetime(dt.year, dt.month, 1).date()
        except Exception:
            return None
    billing_period = _parse_period(billing_month)

    try:
        # ⛳ Keep your existing due date logic (5th of *current* month) to avoid changing behavior
        due_date = datetime(datetime.today().year,
                            datetime.today().month, 5).date()

        # ✅ Filter active tenants (optionally one tenant)
        query = Tenant.query.filter_by(Status="Active")
        if tenant_id:
            query = query.filter_by(TenantID=tenant_id)

        active_tenants = query.all()
        if not active_tenants:
            return jsonify({"status": "error", "message": "No active tenants found."}), 404

        bills_created_or_updated = 0

        for tenant in active_tenants:
            unit = RentalUnit.query.get(tenant.RentalUnitID)
            if not unit:
                continue

            # 🆕 Resolve landlord from unit → apartment → user
            apartment = Apartment.query.get(unit.ApartmentID) if unit else None
            resolved_landlord_id = apartment.UserID if apartment else None

            # ✅ Check if a bill for this tenant & month exists (keep your exact lookup)
            bill = TenantBill.query.filter_by(
                TenantID=tenant.TenantID,
                BillingMonth=billing_month
            ).first()

            if not bill:
                # ✅ Create new bill (keep your totals via helper)
                # Defaults (coerce to float to match existing Float columns)
                water = float(utilities_data.get("WaterBill", 0.0) or 0.0)
                elec = float(utilities_data.get("ElectricityBill", 0.0) or 0.0)
                garb = float(utilities_data.get("Garbage", 0.0) or 0.0)
                net = float(utilities_data.get("Internet", 0.0) or 0.0)

                bill = TenantBill(
                    TenantID=tenant.TenantID,
                    RentalUnitID=tenant.RentalUnitID,
                    BillingMonth=billing_month,
                    # 🆕 add if present (kept nullable in DB)
                    LandlordID=resolved_landlord_id,
                    BillingPeriod=billing_period,

                    RentAmount=float(unit.MonthlyRent),
                    WaterBill=water,
                    ElectricityBill=elec,
                    Garbage=garb,
                    Internet=net,

                    DueDate=due_date,
                    IssuedDate=datetime.now(),
                    BillStatus="Unpaid"
                )

                # ✅ Your helper to compute Total + Carry Forward
                total_due, carried_balance = calculate_bill_amount(
                    tenant.TenantID,
                    unit.MonthlyRent,
                    bill.WaterBill,
                    bill.ElectricityBill,
                    bill.Garbage,
                    bill.Internet
                )

                bill.CarriedForwardBalance = float(carried_balance or 0.0)
                bill.TotalAmountDue = float(total_due or 0.0)

                db.session.add(bill)

            else:
                # ✅ Update existing bill utilities only if provided
                if "WaterBill" in utilities_data:
                    bill.WaterBill = float(utilities_data.get(
                        "WaterBill") or bill.WaterBill or 0.0)
                if "ElectricityBill" in utilities_data:
                    bill.ElectricityBill = float(utilities_data.get(
                        "ElectricityBill") or bill.ElectricityBill or 0.0)
                if "Garbage" in utilities_data:
                    bill.Garbage = float(utilities_data.get(
                        "Garbage") or bill.Garbage or 0.0)
                if "Internet" in utilities_data:
                    bill.Internet = float(utilities_data.get(
                        "Internet") or bill.Internet or 0.0)

                # 🆕 Ensure LandlordID/BillingPeriod are set if missing (non-breaking)
                if getattr(bill, "LandlordID", None) is None and resolved_landlord_id:
                    bill.LandlordID = resolved_landlord_id
                if getattr(bill, "BillingPeriod", None) is None and billing_period:
                    bill.BillingPeriod = billing_period

                # ✅ Recompute totals using your helper (same behavior)
                total_due, carried_balance = calculate_bill_amount(
                    tenant.TenantID,
                    unit.MonthlyRent,
                    bill.WaterBill,
                    bill.ElectricityBill,
                    bill.Garbage,
                    bill.Internet
                )

                bill.CarriedForwardBalance = float(carried_balance or 0.0)
                bill.TotalAmountDue = float(total_due or 0.0)

            bills_created_or_updated += 1

        db.session.commit()

        return jsonify({
            "status": "success",
            "alert": f"✅ {bills_created_or_updated} bill(s) created/updated for {billing_month}.",
            "details": {
                "bills_created_or_updated": bills_created_or_updated,
                "billing_month": billing_month
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "alert": "❌ Failed to generate/update bills.",
            "error": str(e)
        }), 500


# Route for fetching the bills for all the tenants of a landlord


@routes.route("/bills", methods=["GET"])
@jwt_required()
def get_filtered_bills():
    """
    Original behavior preserved:
      - Authz: landlord/admin only
      - Filters: apartment_id (optional), month (optional), status (optional)
      - Result shape unchanged; adds PaidToDate & Balance as extra fields

    Dependencies:
      - compute_paid_to_date_for_bill(bill_id)  -> Decimal
      - compute_balance_and_status(total_due, paid_to_date) -> (balance Decimal, status str)
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized access."}), 403

    # ✅ Query params
    apartment_id = request.args.get("apartment_id", type=int)   # e.g., 3
    month_filter = request.args.get(
        "month")                     # e.g., "July 2025"
    status_filter = request.args.get(
        "status")                   # e.g., "Unpaid"

    valid_statuses = ["Unpaid", "Paid", "Partially Paid", "Overpaid"]
    if status_filter and status_filter not in valid_statuses:
        return jsonify({
            "status": "error",
            "message": f"Invalid status. Choose from {valid_statuses}"
        }), 400

    # ✅ Landlord's apartments
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apartment_ids = [a.ApartmentID for a in apartments]

    if apartment_id and apartment_id not in apartment_ids:
        return jsonify({"status": "error", "message": "You do not own this apartment."}), 403

    # ✅ Units under landlord (optionally a single apartment)
    units_query = RentalUnit.query.filter(
        RentalUnit.ApartmentID.in_(apartment_ids))
    if apartment_id:
        units_query = units_query.filter_by(ApartmentID=apartment_id)
    units = units_query.all()
    unit_ids = [u.UnitID for u in units]

    # ✅ Base bills query (keep your original unit filter)
    query = TenantBill.query.filter(TenantBill.RentalUnitID.in_(unit_ids))

    # ✅ Apply filters
    if month_filter:
        query = query.filter(TenantBill.BillingMonth.ilike(month_filter))
    if status_filter:
        query = query.filter(TenantBill.BillStatus == status_filter)

    bills = query.order_by(TenantBill.BillID.asc()).all()

    if not bills:
        return jsonify({
            "status": "success",
            "message": "No bills found for the given filters.",
            "total_bills": 0,
            "bills": []
        }), 200

    result = []
    for bill in bills:
        tenant = Tenant.query.get(bill.TenantID)
        unit = RentalUnit.query.get(bill.RentalUnitID)
        apartment = Apartment.query.get(unit.ApartmentID) if unit else None

        # 🆕 Non-breaking computed fields (do not overwrite stored status)
        paid_to_date = compute_paid_to_date_for_bill(bill.BillID)
        balance, _recomp_status = compute_balance_and_status(
            Decimal(bill.TotalAmountDue or 0), paid_to_date
        )

        result.append({
            # 🔁 original fields (unchanged)
            "BillID": bill.BillID,
            "TenantName": tenant.FullName if tenant else "Unknown",
            "ApartmentName": apartment.ApartmentName if apartment else "Unknown",
            "UnitLabel": unit.Label if unit else "Unknown",
            "BillingMonth": bill.BillingMonth,
            "TotalAmountDue": bill.TotalAmountDue,
            "BillStatus": bill.BillStatus,
            "DueDate": bill.DueDate.strftime("%Y-%m-%d") if bill.DueDate else None,
            "IssuedDate": bill.IssuedDate.strftime("%Y-%m-%d %H:%M:%S") if bill.IssuedDate else None,

            # 🆕 extras for UI (safe to ignore on old clients)
            # or str(paid_to_date) if you prefer
            "PaidToDate": float(paid_to_date),
            "Balance": float(balance)
        })

    return jsonify({
        "status": "success",
        "filters": {
            "apartment": apartment_id if apartment_id else "All",
            "month": month_filter if month_filter else "All",
            "status": status_filter if status_filter else "All"
        },
        "total_bills": len(result),
        "bills": result
    }), 200


# Route for fecthing  bills for tenants of a specific apartment


@routes.route("/bills/apartment/<int:apartment_id>", methods=["GET"])
@jwt_required()
def get_bills_by_apartment(apartment_id):
    from decimal import Decimal

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized access."}), 403

    # ✅ Ensure the apartment exists and belongs to this landlord
    apartment = Apartment.query.get(apartment_id)
    if not apartment:
        return jsonify({"status": "error", "message": "Apartment not found."}), 404
    if apartment.UserID != user_id:
        return jsonify({"status": "error", "message": "You do not own this apartment."}), 403

    # ✅ Units for this apartment
    units = RentalUnit.query.filter_by(ApartmentID=apartment_id).all()
    unit_ids = [u.UnitID for u in units]

    if not unit_ids:
        return jsonify({
            "status": "success",
            "message": "No rental units found for this apartment.",
            "apartment_id": apartment_id,
            "bills": [],
            "total_bills": 0
        }), 200

    # ✅ Bills for tenants in those units (keep your original ordering)
    bills = (TenantBill.query
             .filter(TenantBill.RentalUnitID.in_(unit_ids))
             .order_by(TenantBill.BillID.asc())
             .all())

    result = []
    for bill in bills:
        tenant = Tenant.query.get(bill.TenantID)
        unit = RentalUnit.query.get(bill.RentalUnitID)

        # 🆕 Non-breaking computed fields
        paid_to_date = compute_paid_to_date_for_bill(bill.BillID)
        balance, _ = compute_balance_and_status(
            Decimal(bill.TotalAmountDue or 0), paid_to_date
        )

        result.append({
            # 🔁 original fields (unchanged)
            "BillID": bill.BillID,
            "TenantName": tenant.FullName if tenant else "Unknown",
            "UnitLabel": unit.Label if unit else "Unknown",
            "BillingMonth": bill.BillingMonth,
            "RentAmount": bill.RentAmount,
            "WaterBill": bill.WaterBill,
            "ElectricityBill": bill.ElectricityBill,
            "Garbage": bill.Garbage,
            "Internet": bill.Internet,
            "CarriedForwardBalance": bill.CarriedForwardBalance,
            "TotalAmountDue": bill.TotalAmountDue,
            "BillStatus": bill.BillStatus,
            "DueDate": bill.DueDate.strftime("%Y-%m-%d") if bill.DueDate else None,
            "IssuedDate": bill.IssuedDate.strftime("%Y-%m-%d %H:%M:%S") if bill.IssuedDate else None,

            # 🆕 extras (safe to ignore on old clients)
            "PaidToDate": float(paid_to_date),
            "Balance": float(balance)
        })

    return jsonify({
        "status": "success",
        "apartment_id": apartment_id,
        "total_bills": len(result),
        "bills": result
    }), 200

# route for fetching a tenant bill for a specific rental unit


@routes.route("/bills/unit/<int:unit_id>", methods=["GET"])
@jwt_required()
def get_bills_for_unit(unit_id):
    """
    Original behavior preserved:
      - Auth: landlord/admin only
      - Ownership check: landlord must own the apartment containing the unit
      - Ordering: latest first by IssuedDate
      - Response keys unchanged: status, unit, apartment, total_bills, bills[...]
    Added (non-breaking):
      - Each bill now also includes PaidToDate and Balance (derived, not persisted)
    """
    from decimal import Decimal

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # ✅ Only landlords/admins can view bills
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized access."}), 403

    # ✅ Get the rental unit
    unit = RentalUnit.query.get(unit_id)
    if not unit:
        return jsonify({"status": "error", "message": "Rental unit not found."}), 404

    # ✅ Ensure landlord owns the apartment where this unit belongs
    apartment = Apartment.query.get(unit.ApartmentID)
    if not apartment or apartment.UserID != user_id:
        return jsonify({"status": "error", "message": "You can only view bills for your own units."}), 403

    # ✅ Fetch bills for this unit (latest first)
    bills = (TenantBill.query
             .filter_by(RentalUnitID=unit_id)
             .order_by(TenantBill.IssuedDate.desc())
             .all())

    if not bills:
        return jsonify({
            "status": "success",
            "message": f"No bills found for unit {unit.Label}.",
            "bills": []
        }), 200

    result = []
    for bill in bills:
        tenant = Tenant.query.get(bill.TenantID)

        # 🆕 Non-breaking computed fields
        paid_to_date = compute_paid_to_date_for_bill(bill.BillID)
        balance, _ = compute_balance_and_status(
            Decimal(bill.TotalAmountDue or 0), paid_to_date
        )

        result.append({
            # 🔁 original fields (unchanged)
            "BillID": bill.BillID,
            "TenantName": tenant.FullName if tenant else "Unknown",
            "UnitLabel": unit.Label,
            "BillingMonth": bill.BillingMonth,
            "RentAmount": bill.RentAmount,
            "WaterBill": bill.WaterBill,
            "ElectricityBill": bill.ElectricityBill,
            "Garbage": bill.Garbage,
            "Internet": bill.Internet,
            "CarriedForwardBalance": bill.CarriedForwardBalance,
            "TotalAmountDue": bill.TotalAmountDue,
            "BillStatus": bill.BillStatus,
            "DueDate": bill.DueDate.strftime("%Y-%m-%d") if bill.DueDate else None,
            "IssuedDate": bill.IssuedDate.strftime("%Y-%m-%d %H:%M:%S") if bill.IssuedDate else None,

            # 🆕 extras for UI (safe to ignore by old clients)
            "PaidToDate": float(paid_to_date),
            "Balance": float(balance)
        })

    return jsonify({
        "status": "success",
        "unit": unit.Label,
        "apartment": apartment.ApartmentName,
        "total_bills": len(result),
        "bills": result
    }), 200


# View Bills for a Specific Month
@routes.route("/bills/month/<string:month>", methods=["GET"])
@jwt_required()
def get_bills_by_month(month):
    from decimal import Decimal

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized access."}), 403

    # Get apartments owned by landlord
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apartment_ids = [a.ApartmentID for a in apartments]

    # Get all rental units under these apartments
    units = RentalUnit.query.filter(
        RentalUnit.ApartmentID.in_(apartment_ids)
    ).all()
    unit_ids = [u.UnitID for u in units]

    # Fetch bills for given month and landlord's units (keep original behavior)
    bills = (TenantBill.query
             .filter(TenantBill.RentalUnitID.in_(unit_ids),
                     TenantBill.BillingMonth.ilike(month))   # e.g. "July 2025"
             .order_by(TenantBill.BillID.asc())
             .all())

    if not bills:
        return jsonify({"status": "success", "message": f"No bills found for {month}."}), 200

    result = []
    for bill in bills:
        tenant = Tenant.query.get(bill.TenantID)
        unit = RentalUnit.query.get(bill.RentalUnitID)

        # 🆕 Non-breaking computed fields
        paid_to_date = compute_paid_to_date_for_bill(bill.BillID)
        balance, _ = compute_balance_and_status(
            Decimal(bill.TotalAmountDue or 0), paid_to_date
        )

        result.append({
            # 🔁 original fields (unchanged)
            "BillID": bill.BillID,
            "TenantName": tenant.FullName if tenant else "Unknown",
            "UnitLabel": unit.Label if unit else "Unknown",
            "BillingMonth": bill.BillingMonth,
            "TotalAmountDue": bill.TotalAmountDue,
            "BillStatus": bill.BillStatus,
            # 🆕 extras (safe to ignore on old clients)
            "PaidToDate": float(paid_to_date),
            "Balance": float(balance)
        })

    return jsonify({
        "status": "success",
        "month": month,
        "total_bills": len(result),
        "bills": result
    }), 200

# View Bills Filtered by BillStatus (Unpaid, Paid, Partially Paid, Overpaid)


@routes.route("/bills/status/<string:status>", methods=["GET"])
@jwt_required()
def get_bills_by_status(status):
    """
    Original behavior preserved:
      - Auth: landlord/admin only
      - Valid statuses: Unpaid, Paid, Partially Paid, Overpaid
      - Scope: bills under the landlord's apartments
      - Ordering: by BillID ascending
      - Response keys unchanged (adds PaidToDate, Balance as extras)

    Dependencies:
      - compute_paid_to_date_for_bill(bill_id)  -> Decimal
      - compute_balance_and_status(total_due, paid_to_date) -> (balance Decimal, status str)
    """
    from decimal import Decimal

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized access."}), 403

    valid_statuses = ["Unpaid", "Paid", "Partially Paid", "Overpaid"]
    if status not in valid_statuses:
        return jsonify({
            "status": "error",
            "message": f"Invalid status. Choose from {valid_statuses}"
        }), 400

    # Landlord scope: apartments -> units
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apartment_ids = [a.ApartmentID for a in apartments]

    units = RentalUnit.query.filter(
        RentalUnit.ApartmentID.in_(apartment_ids)
    ).all()
    unit_ids = [u.UnitID for u in units]

    # Bills filtered by status (keep original logic/order)
    bills = (TenantBill.query
             .filter(TenantBill.RentalUnitID.in_(unit_ids),
                     TenantBill.BillStatus == status)
             .order_by(TenantBill.BillID.asc())
             .all())

    if not bills:
        return jsonify({
            "status": "success",
            "message": f"No bills found with status '{status}'."
        }), 200

    result = []
    for bill in bills:
        tenant = Tenant.query.get(bill.TenantID)
        unit = RentalUnit.query.get(bill.RentalUnitID)

        # 🆕 Derived, non-persisted fields
        paid_to_date = compute_paid_to_date_for_bill(bill.BillID)
        balance, _ = compute_balance_and_status(
            Decimal(bill.TotalAmountDue or 0), paid_to_date
        )

        result.append({
            # 🔁 original fields (unchanged)
            "BillID": bill.BillID,
            "TenantName": tenant.FullName if tenant else "Unknown",
            "UnitLabel": unit.Label if unit else "Unknown",
            "BillingMonth": bill.BillingMonth,
            "TotalAmountDue": bill.TotalAmountDue,
            "BillStatus": bill.BillStatus,

            # 🆕 extras (safe to ignore on older clients)
            "PaidToDate": float(paid_to_date),
            "Balance": float(balance)
        })

    return jsonify({
        "status": "success",
        "filter_status": status,
        "total_bills": len(result),
        "bills": result
    }), 200


# View Bills for a Specific Month for All Units in a Landlord’s Apartments


@routes.route("/bills/apartment/<string:month>", methods=["GET"])
@jwt_required()
def get_bills_by_apartment_month(month):
    """
    Original behavior preserved:
      - Auth: landlord/admin only
      - For each apartment owned by landlord, list bills for the given month
      - Response keys unchanged at the top level and per-apartment
      - Bills keep original fields; we add PaidToDate and Balance (non-breaking)
    """
    from decimal import Decimal

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized access."}), 403

    apartments = Apartment.query.filter_by(UserID=user_id).all()

    response = []
    for apartment in apartments:
        units = RentalUnit.query.filter_by(
            ApartmentID=apartment.ApartmentID).all()
        unit_ids = [u.UnitID for u in units]

        bills = (TenantBill.query
                 .filter(TenantBill.RentalUnitID.in_(unit_ids),
                         TenantBill.BillingMonth.ilike(month))
                 .order_by(TenantBill.BillID.asc())
                 .all())

        bills_list = []
        for bill in bills:
            tenant = Tenant.query.get(bill.TenantID)
            unit = RentalUnit.query.get(bill.RentalUnitID)

            # 🆕 Non-breaking computed fields
            paid_to_date = compute_paid_to_date_for_bill(bill.BillID)
            balance, _ = compute_balance_and_status(
                Decimal(bill.TotalAmountDue or 0), paid_to_date
            )

            bills_list.append({
                # 🔁 original fields (unchanged)
                "BillID": bill.BillID,
                "TenantName": tenant.FullName if tenant else "Unknown",
                "UnitLabel": unit.Label if unit else "Unknown",
                "BillingMonth": bill.BillingMonth,
                "TotalAmountDue": bill.TotalAmountDue,
                "BillStatus": bill.BillStatus,
                # 🆕 extras (safe to ignore on old clients)
                "PaidToDate": float(paid_to_date),
                "Balance": float(balance)
            })

        response.append({
            "ApartmentID": apartment.ApartmentID,
            "ApartmentName": apartment.ApartmentName,
            "TotalBills": len(bills_list),
            "Bills": bills_list
        })

    return jsonify({
        "status": "success",
        "month": month,
        "apartments": response
    }), 200


# KPI routes
@routes.route("/billing/kpis", methods=["GET"])
@jwt_required()
def billing_kpis():
    """
    KPI summary for landlord bills.
    - Non-breaking: NEW endpoint.
    - Filters:
        ?month=July 2025                (matches BillingMonth label)
        &apartment_id=123               (optional, must belong to landlord)
        &include_apartments=true|false  (optional; default false)
    - Output:
        {
          status: "success",
          filters: {...},
          kpis: {
            counts_by_status: {Paid, Partially Paid, Unpaid, Overpaid},
            totals: {sum_due, sum_paid, sum_balance},
            by_apartment: [ ... ]   # only when include_apartments=true
          }
        }
    """
    from decimal import Decimal

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized access."}), 403

    month = request.args.get("month")  # e.g., "July 2025"
    apartment_id = request.args.get("apartment_id", type=int)
    include_apts = (request.args.get(
        "include_apartments", "false").lower() == "true")

    # landlord scope
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apartment_ids = [a.ApartmentID for a in apartments]
    if apartment_id:
        if apartment_id not in apartment_ids:
            return jsonify({"status": "error", "message": "You do not own this apartment."}), 403
        apartment_ids = [apartment_id]  # narrow scope

    # units in-scope
    units = RentalUnit.query.filter(
        RentalUnit.ApartmentID.in_(apartment_ids)).all()
    unit_ids = [u.UnitID for u in units]
    if not unit_ids:
        return jsonify({
            "status": "success",
            "filters": {"month": month or "All", "apartment_id": apartment_id or "All"},
            "kpis": {
                "counts_by_status": {"Paid": 0, "Partially Paid": 0, "Unpaid": 0, "Overpaid": 0},
                "totals": {"sum_due": 0.0, "sum_paid": 0.0, "sum_balance": 0.0},
                "by_apartment": [] if include_apts else None
            }
        }), 200

    # base bills query
    q = TenantBill.query.filter(TenantBill.RentalUnitID.in_(unit_ids))
    if month:
        q = q.filter(TenantBill.BillingMonth.ilike(month))
    bills = q.all()

    counts = {"Paid": 0, "Partially Paid": 0, "Unpaid": 0, "Overpaid": 0}
    sum_due = Decimal('0.00')
    sum_paid = Decimal('0.00')

    # For optional apartment grouping
    by_apartment = {}  # apt_id -> accumulator
    unit_by_id = {u.UnitID: u for u in units}
    apt_by_id = {a.ApartmentID: a for a in apartments}

    for b in bills:
        # derive paid_to_date using allocations if present; else fallback to summed payments
        paid = compute_paid_to_date_for_bill(b.BillID)
        balance, derived_status = compute_balance_and_status(
            Decimal(b.TotalAmountDue or 0), paid)

        # overall aggregates
        counts[derived_status] = counts.get(derived_status, 0) + 1
        sum_due += Decimal(b.TotalAmountDue or 0)
        sum_paid += paid

        # per-apartment aggregates (optional)
        if include_apts:
            unit = unit_by_id.get(b.RentalUnitID)
            apt_id = unit.ApartmentID if unit else None
            if apt_id:
                acc = by_apartment.setdefault(apt_id, {
                    "ApartmentID": apt_id,
                    "ApartmentName": apt_by_id.get(apt_id).ApartmentName if apt_by_id.get(apt_id) else "Unknown",
                    "counts_by_status": {"Paid": 0, "Partially Paid": 0, "Unpaid": 0, "Overpaid": 0},
                    "sum_due": Decimal('0.00'),
                    "sum_paid": Decimal('0.00'),
                })
                acc["counts_by_status"][derived_status] += 1
                acc["sum_due"] += Decimal(b.TotalAmountDue or 0)
                acc["sum_paid"] += paid

    payload = {
        "status": "success",
        "filters": {
            "month": month or "All",
            "apartment_id": apartment_id or "All",
            "include_apartments": include_apts
        },
        "kpis": {
            "counts_by_status": counts,
            "totals": {
                "sum_due": float(sum_due),
                "sum_paid": float(sum_paid),
                "sum_balance": float((sum_due - sum_paid))
            }
        }
    }

    if include_apts:
        payload["kpis"]["by_apartment"] = [
            {
                "ApartmentID": v["ApartmentID"],
                "ApartmentName": v["ApartmentName"],
                "counts_by_status": v["counts_by_status"],
                "sum_due": float(v["sum_due"]),
                "sum_paid": float(v["sum_paid"]),
                "sum_balance": float(v["sum_due"] - v["sum_paid"])
            }
            for v in by_apartment.values()
        ]

    return jsonify(payload), 200


def compute_paid_to_date_for_bill(bill_id: int) -> Decimal:
    bill = TenantBill.query.get(bill_id)
    if not bill:
        return Decimal('0.00')

    # Prefer allocations if any exist
    if getattr(bill, 'allocations', None):
        total = sum((a.AllocatedAmount or 0) for a in bill.allocations)
        return Decimal(total).quantize(Decimal('0.01'))

    # Fallback: sum direct payments for that (tenant, unit, month)
    total = (db.session.query(func.coalesce(func.sum(RentPayment.AmountPaid), 0))
             .filter(RentPayment.TenantID == bill.TenantID,
                     RentPayment.RentalUnitID == bill.RentalUnitID,
                     RentPayment.BillingMonth == bill.BillingMonth)
             .scalar())
    return Decimal(total).quantize(Decimal('0.01'))


def compute_balance_and_status(total_due: Decimal, paid_to_date: Decimal):
    balance = (Decimal(total_due or 0) - Decimal(paid_to_date or 0)
               ).quantize(Decimal('0.01'))
    if balance < 0:
        return balance, "Overpaid"
    if balance == 0 and paid_to_date > 0:
        return Decimal('0.00'), "Paid"
    if paid_to_date == 0:
        return balance, "Unpaid"
    return balance, "Partially Paid"
# Route for posting the rent payment and updating its status as paid


@routes.route("/tenant-payments", methods=["POST"])
@jwt_required()
def record_rent_payment():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized."}), 403

    data = request.get_json() or {}
    tenant_id = data.get("TenantID")
    rental_unit_id = data.get("RentalUnitID")
    billing_month = data.get("BillingMonth")
    paid_via_mobile = data.get("PaidViaMobile")
    txref = data.get("TxRef")
    note = data.get("PaymentNote")

    # Validate required fields
    missing = [k for k in ["TenantID", "RentalUnitID",
                           "BillingMonth", "PaidViaMobile"] if not data.get(k)]
    if missing:
        return jsonify({"status": "error", "message": f"Missing required field(s): {', '.join(missing)}"}), 400
    if "AmountPaid" not in data:
        return jsonify({"status": "error", "message": "AmountPaid is required."}), 400

    try:
        amount_paid = float(data.get("AmountPaid"))
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "AmountPaid must be a number."}), 400
    if amount_paid <= 0:
        return jsonify({"status": "error", "message": "AmountPaid must be greater than zero."}), 400

    # Find the bill
    tenant_bill = (TenantBill.query
                   .filter_by(TenantID=tenant_id, RentalUnitID=rental_unit_id, BillingMonth=billing_month)
                   .first())
    if not tenant_bill:
        return jsonify({"status": "error", "message": "Tenant bill not found for this month."}), 404

    # Snapshot billed amount from bill
    billed_amount = float(tenant_bill.TotalAmountDue or 0)

    # Create the payment (now with LandlordID + optional IntendedBillingPeriod/TxRef/Note)
    payment = RentPayment(
        TenantID=tenant_id,
        RentalUnitID=rental_unit_id,
        # use bill landlord if present
        LandlordID=getattr(tenant_bill, "LandlordID", None) or
        Apartment.query.get(RentalUnit.query.get(
            rental_unit_id).ApartmentID).UserID,
        BillingMonth=billing_month,
        IntendedBillingPeriod=None,  # you can parse from label later if desired
        BilledAmount=billed_amount,
        AmountPaid=amount_paid,
        Balance=billed_amount - amount_paid,   # will be recomputed below for response
        PaidViaMobile=paid_via_mobile,
        TxRef=txref,
        PaymentNote=note
    )
    db.session.add(payment)
    db.session.flush()  # ensure PaymentID is available

    # Optional: write allocation row (1:1 with this bill in your current flow)
    try:
        db.session.add(PaymentAllocation(
            PaymentID=payment.PaymentID,
            BillID=tenant_bill.BillID,
            AllocatedAmount=amount_paid,
            LandlordID=payment.LandlordID
        ))
    except Exception:
        # If table not present or any issue, skip silently to keep backward-compat
        pass

    # Recompute paid-to-date and status based on allocations (or fallback)
    paid_to_date = compute_paid_to_date_for_bill(tenant_bill.BillID)
    balance, status = compute_balance_and_status(
        Decimal(tenant_bill.TotalAmountDue or 0), paid_to_date)

    # Persist updated status on the bill
    tenant_bill.BillStatus = status

    # Keep Balance in response consistent
    payment.Balance = float(balance)

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": f"Payment recorded successfully. Bill is now '{status}'.",
        "payment_details": {
            "TenantID": tenant_id,
            "RentalUnitID": rental_unit_id,
            "BillingMonth": billing_month,
            "BilledAmount": billed_amount,
            "AmountPaid": amount_paid,
            "Balance": float(balance),
            "BillStatus": status,
            "TxRef": txref
        }
    }), 201


# Add new expense
# -------------------------------
@routes.route("/landlord-expenses/add", methods=["POST"])
@jwt_required()
def add_landlord_expense():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    data = request.get_json() or {}

    apartment_id = data.get("ApartmentID")
    expense_type = data.get("ExpenseType")
    amount = data.get("Amount")
    description = data.get("Description", "")

    # New fields
    payee = data.get("Payee")
    payment_method = data.get("PaymentMethod")
    payment_ref = data.get("PaymentRef")
    # YYYY-MM-DD (period)
    expense_date_in = data.get("ExpenseDate")
    # YYYY-MM-DD (actual paid date)
    expense_paid_date_in = data.get("ExpensePaymentDate")

    # Validate required
    if not apartment_id or not expense_type or amount is None:
        return jsonify({"status": "error", "message": "ApartmentID, ExpenseType, and Amount are required."}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({"status": "error", "message": "Amount must be greater than zero."}), 400
    except Exception:
        return jsonify({"status": "error", "message": "Amount must be a valid number."}), 400

    # Apartment exists?
    apartment = Apartment.query.get(apartment_id)
    if not apartment:
        return jsonify({"status": "error", "message": "Apartment not found."}), 404

    # Parse dates
    try:
        expense_date = datetime.strptime(
            expense_date_in, "%Y-%m-%d") if expense_date_in else datetime.utcnow()
    except ValueError:
        return jsonify({"status": "error", "message": "ExpenseDate must be YYYY-MM-DD."}), 400

    try:
        expense_payment_date = (
            datetime.strptime(expense_paid_date_in, "%Y-%m-%d")
            if expense_paid_date_in else None
        )
    except ValueError:
        return jsonify({"status": "error", "message": "ExpensePaymentDate must be YYYY-MM-DD."}), 400

    # Optional: validate payment method (if provided)
    valid_methods = {"Cash", "Bank Transfer", "M-Pesa", "Cheque", "Other"}
    if payment_method and payment_method not in valid_methods:
        return jsonify({"status": "error", "message": f"PaymentMethod must be one of {sorted(valid_methods)}"}), 400

    # Save
    new_expense = LandlordExpense(
        ApartmentID=apartment_id,
        ExpenseType=expense_type,
        Amount=amount,
        Description=description,
        ExpenseDate=expense_date,
        ExpensePaymentDate=expense_payment_date,
        Payee=payee,
        PaymentMethod=payment_method,
        PaymentRef=payment_ref,
    )
    db.session.add(new_expense)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Expense recorded successfully.",
        "expense": {
            "ExpenseID": new_expense.ExpenseID,
            "Apartment": apartment.ApartmentName,
            "ExpenseType": new_expense.ExpenseType,
            "Amount": new_expense.Amount,
            "Description": new_expense.Description,
            "ExpenseDate": _fmt_date(new_expense.ExpenseDate),
            "ExpensePaymentDate": _fmt_date(new_expense.ExpensePaymentDate),
            "Payee": new_expense.Payee,
            "PaymentMethod": new_expense.PaymentMethod,
            "PaymentRef": new_expense.PaymentRef,
        }
    }), 201


# -------------------------------
# View expenses grouped by Apartment
# -------------------------------
@routes.route("/landlord-expenses/by-apartment", methods=["GET"])
@jwt_required()
def view_expenses_by_apartment():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    expenses = LandlordExpense.query.join(Apartment).all()
    result = {}

    for exp in expenses:
        apt_name = exp.apartment.ApartmentName
        result.setdefault(apt_name, []).append({
            "ExpenseID": exp.ExpenseID,
            "ExpenseType": exp.ExpenseType,
            "Amount": exp.Amount,
            "Description": exp.Description,
            "ExpenseDate": _fmt_date(exp.ExpenseDate),
            "ExpensePaymentDate": _fmt_date(exp.ExpensePaymentDate),
            "Payee": exp.Payee,
            "PaymentMethod": exp.PaymentMethod,
            "PaymentRef": exp.PaymentRef,
        })

    return jsonify({"status": "success", "expenses": result}), 200


# -------------------------------
# View expenses grouped by Month (period month)
# -------------------------------
@routes.route("/landlord-expenses/by-month", methods=["GET"])
@jwt_required()
def view_expenses_by_month():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    expenses = LandlordExpense.query.join(Apartment).all()
    result = {}

    for exp in expenses:
        month_key = exp.ExpenseDate.strftime("%B %Y")
        result.setdefault(month_key, []).append({
            "ExpenseID": exp.ExpenseID,
            "Apartment": exp.apartment.ApartmentName,
            "ExpenseType": exp.ExpenseType,
            "Amount": exp.Amount,
            "Description": exp.Description,
            "ExpenseDate": _fmt_date(exp.ExpenseDate),
            "ExpensePaymentDate": _fmt_date(exp.ExpensePaymentDate),
            "Payee": exp.Payee,
            "PaymentMethod": exp.PaymentMethod,
            "PaymentRef": exp.PaymentRef,
        })

    return jsonify({"status": "success", "expenses": result}), 200


# -------------------------------
# Monthly expense totals (by period)
# -------------------------------
@routes.route("/landlord-expenses/monthly-summary", methods=["GET"])
@jwt_required()
def monthly_expense_summary():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    expenses = LandlordExpense.query.all()
    summary = {}

    for exp in expenses:
        month_key = exp.ExpenseDate.strftime("%B %Y")
        summary[month_key] = summary.get(month_key, 0) + float(exp.Amount or 0)

    return jsonify({"status": "success", "summary": summary}), 200


# -------------------------------
# Annual expense totals (by period)
# -------------------------------
@routes.route("/landlord-expenses/annual-summary", methods=["GET"])
@jwt_required()
def annual_expense_summary():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    expenses = LandlordExpense.query.all()
    summary = {}

    for exp in expenses:
        year = exp.ExpenseDate.strftime("%Y")
        summary[year] = summary.get(year, 0) + float(exp.Amount or 0)

    return jsonify({"status": "success", "summary": summary}), 200


# -------------------------------
# Expense totals per Apartment
# -------------------------------
@routes.route("/landlord-expenses/apartment-summary", methods=["GET"])
@jwt_required()
def apartment_expense_summary():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    expenses = LandlordExpense.query.join(Apartment).all()
    summary = {}

    for exp in expenses:
        apt_name = exp.apartment.ApartmentName
        summary[apt_name] = summary.get(apt_name, 0) + float(exp.Amount or 0)

    return jsonify({"status": "success", "summary": summary}), 200


# -------------------------------
# Expense totals by Type
# -------------------------------
@routes.route("/landlord-expenses/by-type", methods=["GET"])
@jwt_required()
def expenses_by_type():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    expenses = LandlordExpense.query.all()
    summary = {}

    for exp in expenses:
        summary[exp.ExpenseType] = summary.get(
            exp.ExpenseType, 0) + float(exp.Amount or 0)

    return jsonify({"status": "success", "summary": summary}), 200


# -------------------------------
# Export CSV (includes both dates)
# -------------------------------
@routes.route("/landlord-expenses/export", methods=["GET"])
@jwt_required()
def export_expenses():
    import csv
    from io import StringIO
    from flask import Response

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    expenses = LandlordExpense.query.join(Apartment).all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ExpenseID", "Apartment", "ExpenseType", "Amount", "Description",
        "ExpenseDate", "ExpensePaymentDate", "Payee", "PaymentMethod", "PaymentRef"
    ])

    for exp in expenses:
        writer.writerow([
            exp.ExpenseID,
            exp.apartment.ApartmentName,
            exp.ExpenseType,
            float(exp.Amount or 0),
            exp.Description or "",
            _fmt_date(exp.ExpenseDate) or "",
            _fmt_date(exp.ExpensePaymentDate) or "",
            exp.Payee or "",
            exp.PaymentMethod or "",
            exp.PaymentRef or "",
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=landlord_expenses.csv"}
    )


# -------------------------------
# Filter by date range
#   ?start=YYYY-MM-DD&end=YYYY-MM-DD&field=period|paid
#   - field=period (default) => ExpenseDate
#   - field=paid             => ExpensePaymentDate
# -------------------------------
@routes.route("/landlord-expenses/filter", methods=["GET"])
@jwt_required()
def filter_expenses():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    start_date = request.args.get("start")
    end_date = request.args.get("end")
    field = (request.args.get("field") or "period").lower()

    # choose column
    col = LandlordExpense.ExpenseDate if field == "period" else LandlordExpense.ExpensePaymentDate

    # parse dates
    try:
        start_dt = datetime.strptime(
            start_date, "%Y-%m-%d") if start_date else None
        end_dt = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
    except ValueError:
        return jsonify({"status": "error", "message": "Dates must be YYYY-MM-DD."}), 400

    q = LandlordExpense.query.join(Apartment)
    if start_dt:
        q = q.filter(col >= start_dt)
    if end_dt:
        q = q.filter(col <= end_dt)

    expenses = q.all()
    result = [{
        "ExpenseID": exp.ExpenseID,
        "Apartment": exp.apartment.ApartmentName,
        "ExpenseType": exp.ExpenseType,
        "Amount": float(exp.Amount or 0),
        "Description": exp.Description,
        "ExpenseDate": _fmt_date(exp.ExpenseDate),
        "ExpensePaymentDate": _fmt_date(exp.ExpensePaymentDate),
        "Payee": exp.Payee,
        "PaymentMethod": exp.PaymentMethod,
        "PaymentRef": exp.PaymentRef,
    } for exp in expenses]

    return jsonify({"status": "success", "expenses": result}), 200


# -------------------------------
# Unpaid expenses (no payment date OR empty ref)
# -------------------------------
@routes.route("/landlord-expenses/unpaid", methods=["GET"])
@jwt_required()
def unpaid_expenses():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    expenses = (
        LandlordExpense.query
        .filter(
            (LandlordExpense.ExpensePaymentDate == None) |
            (func.nullif(LandlordExpense.PaymentRef, '') == None)
        )
        .join(Apartment)
        .all()
    )

    result = [{
        "ExpenseID": exp.ExpenseID,
        "Apartment": exp.apartment.ApartmentName,
        "ExpenseType": exp.ExpenseType,
        "Amount": float(exp.Amount or 0),
        "Description": exp.Description,
        "ExpenseDate": _fmt_date(exp.ExpenseDate),
        "ExpensePaymentDate": _fmt_date(exp.ExpensePaymentDate),
        "Payee": exp.Payee,
        "PaymentMethod": exp.PaymentMethod,
        "PaymentRef": exp.PaymentRef,
    } for exp in expenses]

    return jsonify({"status": "success", "unpaid_expenses": result}), 200


@routes.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No file provided"}), 400

    file = request.files["file"]

    try:
        upload_result = upload_to_cloudinary(file)  # ✅ Uses helper
        return jsonify({
            "status": "success",
            "url": upload_result["url"],
            "public_id": upload_result["public_id"]
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ✅ Create Profile
@routes.route("/create_profile", methods=["POST"])
@jwt_required()
def create_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    if Profile.query.filter_by(UserID=user_id).first():
        return jsonify({"message": "Profile already exists. Use PUT to update."}), 400

    data = request.form.to_dict()
    errors = validate_profile_payload(data)
    if errors:
        return jsonify({"message": "Validation failed", "errors": errors}), 400

    # Normalize phone
    if data.get("SupportPhone"):
        data["SupportPhone"] = normalize_phone(data["SupportPhone"])

    # Date
    dob = None
    if data.get("DateOfBirth"):
        dob = datetime.strptime(data["DateOfBirth"], "%Y-%m-%d").date()

    # Image
    profile_pic_url = None
    file = request.files.get("ProfilePicture")
    if file:
        try:
            upload_result = cloudinary.uploader.upload(
                file, folder="profile_pictures")
            profile_pic_url = upload_result.get(
                "secure_url") or upload_result.get("url")
        except Exception as e:
            return jsonify({"message": "Image upload failed", "error": str(e)}), 500

    profile = Profile(
        UserID=user_id,
        ProfilePicture=profile_pic_url,
        Address=data.get("Address"),
        NationalID=data.get("NationalID"),
        KRA_PIN=(data.get("KRA_PIN") or "").strip().upper() or None,
        Bio=data.get("Bio"),
        DateOfBirth=dob,

        DisplayName=data.get("DisplayName") or user.FullName,
        SupportEmail=data.get("SupportEmail") or user.Email,
        SupportPhone=data.get("SupportPhone"),

        MpesaPaybill=data.get("MpesaPaybill"),
        MpesaTill=data.get("MpesaTill"),
        MpesaAccountName=data.get("MpesaAccountName"),

        BankName=data.get("BankName"),
        BankBranch=data.get("BankBranch"),
        AccountName=data.get("AccountName"),
        AccountNumber=data.get("AccountNumber"),

        City=data.get("City"),
        County=data.get("County"),
        PostalCode=data.get("PostalCode"),
    )

    db.session.add(profile)
    db.session.commit()

    return jsonify({
        "message": "✅ Profile created successfully!",
        "profile": serialize_profile(user, profile)
    }), 201


# ✅ Update Profile


@routes.route("/refreshprofile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    profile = Profile.query.filter_by(UserID=user_id).first()
    if not profile:
        return jsonify({"message": "Profile not found. Please create one first."}), 404

    data = request.form.to_dict()
    errors = validate_profile_payload(data)
    if errors:
        return jsonify({"message": "Validation failed", "errors": errors}), 400

    # Normalize phone if provided
    if data.get("SupportPhone"):
        data["SupportPhone"] = normalize_phone(data["SupportPhone"])

    # Date
    if "DateOfBirth" in data:
        if data["DateOfBirth"]:
            profile.DateOfBirth = datetime.strptime(
                data["DateOfBirth"], "%Y-%m-%d").date()
        else:
            profile.DateOfBirth = None

    # Image
    file = request.files.get("ProfilePicture")
    if file:
        try:
            upload_result = cloudinary.uploader.upload(
                file, folder="profile_pictures")
            profile.ProfilePicture = upload_result.get(
                "secure_url") or upload_result.get("url")
        except Exception as e:
            return jsonify({"message": "Image upload failed", "error": str(e)}), 500

    # Update simple fields if provided
    for fld in [
        "Address", "NationalID", "Bio", "DisplayName", "SupportEmail", "SupportPhone",
        "MpesaPaybill", "MpesaTill", "MpesaAccountName", "BankName", "BankBranch",
        "AccountName", "AccountNumber", "City", "County", "PostalCode"
    ]:
        if fld in data:
            setattr(profile, fld, (data[fld].strip() if isinstance(
                data[fld], str) else data[fld]) or None)

    if "KRA_PIN" in data:
        profile.KRA_PIN = (data["KRA_PIN"] or "").strip().upper() or None

    db.session.commit()

    return jsonify({
        "message": "✅ Profile updated successfully!",
        "profile": serialize_profile(user, profile)
    }), 200


# ✅ Get Profile
@routes.route("/viewprofile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    profile = Profile.query.filter_by(UserID=user_id).first()
    if not profile:
        # Keep 404 to match your current frontend’s “create flow”
        return jsonify({"message": "Profile not found"}), 404

    return jsonify(serialize_profile(user, profile)), 200


# ✅ Helper function to format profile response
# ✅ Partial update (JSON) — great for autosave
@routes.route("/profile", methods=["PATCH"])
@jwt_required()
def patch_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    profile = Profile.query.filter_by(UserID=user_id).first()
    if not profile:
        return jsonify({"message": "Profile not found. Please create one first."}), 404

    data = request.get_json(silent=True) or {}

    # Validate payload (re-uses same rules you added)
    errors = validate_profile_payload(data)
    if errors:
        return jsonify({"message": "Validation failed", "errors": errors}), 400

    # Normalize phone if present
    if "SupportPhone" in data and data["SupportPhone"]:
        data["SupportPhone"] = normalize_phone(str(data["SupportPhone"]))

    # Allowed fields to patch (strings/numbers)
    PATCHABLE_FIELDS = {
        "Address", "NationalID", "KRA_PIN", "Bio",
        "DisplayName", "SupportEmail", "SupportPhone",
        "MpesaPaybill", "MpesaTill", "MpesaAccountName",
        "BankName", "BankBranch", "AccountName", "AccountNumber",
        "City", "County", "PostalCode"
    }

    # Apply scalar fields if provided
    for key, val in data.items():
        if key in PATCHABLE_FIELDS:
            if key == "KRA_PIN":
                # store normalized uppercase or NULL
                setattr(profile, key, (str(val).strip().upper() or None))
            else:
                setattr(profile, key, (str(val).strip()
                        if isinstance(val, str) else val) or None)

    # Handle DateOfBirth separately (YYYY-MM-DD or null to clear)
    if "DateOfBirth" in data:
        dob_raw = data["DateOfBirth"]
        if dob_raw:
            try:
                profile.DateOfBirth = datetime.strptime(
                    dob_raw, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"message": "DateOfBirth must be YYYY-MM-DD."}), 400
        else:
            profile.DateOfBirth = None

    db.session.commit()

    return jsonify({
        "message": "✅ Saved",
        "profile": serialize_profile(user, profile)
    }), 200

# ✅ Upload/replace profile avatar (one-shot; multipart/form-data)


@routes.route("/profile/avatar", methods=["POST"])
@jwt_required()
def upload_profile_avatar():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Accept either "file" or "ProfilePicture" for convenience
    file = request.files.get("file") or request.files.get("ProfilePicture")
    if not file:
        return jsonify({"message": "No file provided. Use field name 'file' or 'ProfilePicture'."}), 400

    # Optional: quick content-type guard
    ct = (file.mimetype or "").lower()
    if not ct.startswith("image/"):
        return jsonify({"message": "Invalid file type. Please upload an image."}), 400

    # Upload to Cloudinary
    try:
        # If you prefer the helper:
        # from utils.cloudinary_helper import upload_to_cloudinary
        # up = upload_to_cloudinary(file, folder="profile_pictures")
        # url = up["url"]

        up = cloudinary.uploader.upload(file, folder="profile_pictures")
        url = up.get("secure_url") or up.get("url")
        if not url:
            return jsonify({"message": "Image upload failed: missing URL from provider."}), 500
    except Exception as e:
        return jsonify({"message": "Image upload failed", "error": str(e)}), 500

    # Upsert profile (create if first-time)
    profile = Profile.query.filter_by(UserID=user_id).first()
    if not profile:
        profile = Profile(UserID=user_id)
        db.session.add(profile)

    profile.ProfilePicture = url
    db.session.commit()

    return jsonify({
        "message": "✅ Avatar updated",
        "url": url,
        "profile": serialize_profile(user, profile)
    }), 200


# Profile picture uploading route
@routes.route("/profile/avatar", methods=["POST"])
@jwt_required()
def upload_avatar():
    user_id = get_jwt_identity()
    profile = Profile.query.filter_by(UserID=user_id).first()
    if not profile:
        return jsonify({"message": "Profile not found. Create it first."}), 404

    file = request.files.get("avatar") or request.files.get("ProfilePicture")
    if not file:
        return jsonify({"message": "No avatar file provided."}), 400

    try:
        up = cloudinary.uploader.upload(file, folder="profile_pictures")
        url = up.get("secure_url") or up.get("url")
        if not url:
            return jsonify({"message": "Upload succeeded, but no URL returned."}), 500

        profile.ProfilePicture = url
        db.session.commit()

        # return the whole profile so UI can refresh
        user = User.query.get(user_id)
        return jsonify({"message": "✅ Avatar updated.", "profile": serialize_profile(user, profile)}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Avatar upload failed.", "error": str(e)}), 500


# route for enabling the user send a feedback abput the website


@routes.route('/feedback', methods=['POST'])
def create_feedback():
    try:
        data = request.get_json(silent=True) or request.form
        email = (data.get('Email') or '').strip()
        subject = (data.get('Subject') or '').strip()
        message = (data.get('Message') or '').strip()

        # Basic validation
        if not EMAIL_RE.match(email):
            return jsonify({"error": "A valid Email is required."}), 400
        if not subject or len(subject) > 200:
            return jsonify({"error": "Subject is required (max 200 chars)."}), 400
        if not message:
            return jsonify({"error": "Message is required."}), 400

        fb = Feedback(Email=email, Subject=subject, Message=message)
        db.session.add(fb)
        db.session.commit()

        # Optional: send an acknowledgment email (if mail is configured)
        try:
            if mail:
                msg = Message(
                    subject="Thanks for your feedback",
                    recipients=[email],
                    body=f"Hi,\n\nWe received your feedback:\n\n{message}\n\n— Team"
                )
                mail.send(msg)
        except Exception:
            # Don’t fail the request if email sending has issues
            pass

        return jsonify({
            "message": "Thanks for your feedback!",
            "feedback": {
                "FeedbackID": fb.FeedbackID,
                "Email": fb.Email,
                "Subject": fb.Subject,
                "Message": fb.Message,
                "CreatedAt": fb.CreatedAt.isoformat()
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to save feedback.", "details": str(e)}), 500

# route for enabling the user rate the website


@routes.route('/ratings', methods=['POST'])
def create_rating():
    try:
        data = request.get_json(silent=True) or request.form

        # Pull & validate rating
        raw = data.get('RatingValue')
        try:
            rating_value = int(raw)
        except (TypeError, ValueError):
            return jsonify({"error": "RatingValue must be an integer 1–5."}), 400

        if not 1 <= rating_value <= 5:
            return jsonify({"error": "RatingValue must be between 1 and 5."}), 400

        comment = (data.get('Comment') or '').strip() or None

        # Save
        rating = Rating(RatingValue=rating_value, Comment=comment)
        db.session.add(rating)
        db.session.commit()

        return jsonify({
            "message": "Thanks for rating!",
            "rating": {
                "RatingID": rating.RatingID,
                "RatingValue": rating.RatingValue,
                "Comment": rating.Comment,
                "CreatedAt": rating.CreatedAt.isoformat()
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to save rating.", "details": str(e)}), 500
# Get single tenant + computed summary


@routes.route('/tenants/<int:tenant_id>', methods=['GET'])
@jwt_required()
def get_tenant(tenant_id):
    user_id = get_jwt_identity()
    t = Tenant.query.get(tenant_id)
    if not t:
        return jsonify({"message": "Tenant not found"}), 404

    unit = RentalUnit.query.get(t.RentalUnitID)
    apt = Apartment.query.get(unit.ApartmentID) if unit else None
    if not apt or apt.UserID != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    # last payment
    last_pmt = (RentPayment.query
                .filter_by(TenantID=t.TenantID)
                .order_by(RentPayment.PaymentDate.desc())
                .first())

    # current month bill (or latest)
    last_bill = (TenantBill.query
                 .filter_by(TenantID=t.TenantID)
                 .order_by(TenantBill.IssuedDate.desc())
                 .first())

    return jsonify({
        "TenantID": t.TenantID,
        "FullName": t.FullName, "Phone": t.Phone, "Email": t.Email, "IDNumber": t.IDNumber,
        "Status": t.Status, "MoveInDate": t.MoveInDate.strftime("%Y-%m-%d") if t.MoveInDate else None,
        "Apartment": apt.ApartmentName if apt else "N/A",
        "Unit": unit.Label if unit else "N/A",
        "MonthlyRent": unit.MonthlyRent if unit else None,
        "LastPayment": {
            "AmountPaid": last_pmt.AmountPaid if last_pmt else 0.0,
            "Date": last_pmt.PaymentDate.strftime("%Y-%m-%d %H:%M:%S") if last_pmt else None
        },
        "LatestBill": {
            "BillingMonth": last_bill.BillingMonth if last_bill else None,
            "TotalAmountDue": last_bill.TotalAmountDue if last_bill else 0.0,
            "BillStatus": last_bill.BillStatus if last_bill else None,
            "DueDate": last_bill.DueDate.strftime("%Y-%m-%d") if last_bill and last_bill.DueDate else None
        }
    }), 200
# update the tenant's details partially


@routes.route('/tenants/<int:tenant_id>', methods=['PATCH'])
@jwt_required()
def update_tenant(tenant_id):
    user_id = get_jwt_identity()
    t = Tenant.query.get(tenant_id)
    if not t:
        return jsonify({"message": "Tenant not found"}), 404
    unit = RentalUnit.query.get(t.RentalUnitID) if t.RentalUnitID else None
    apt = Apartment.query.get(unit.ApartmentID) if unit else None
    if unit and (not apt or apt.UserID != user_id):
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json() or {}
    for fld in ["FullName", "Phone", "Email", "IDNumber", "Status", "MoveInDate", "MoveOutDate"]:
        if fld in data and data[fld] is not None:
            if fld in ["MoveInDate", "MoveOutDate"]:
                try:
                    setattr(t, fld, datetime.strptime(
                        data[fld], "%Y-%m-%d").date())
                except ValueError:
                    return jsonify({"message": f"{fld} must be YYYY-MM-DD"}), 400
            else:
                setattr(t, fld, data[fld])
    db.session.commit()
    return jsonify({"message": "✅ Tenant updated"}), 200


# Per-tenant statement (bills + payments)
@routes.route('/tenants/<int:tenant_id>/statement', methods=['GET'])
@jwt_required()
def tenant_statement(tenant_id):
    user_id = get_jwt_identity()
    t = Tenant.query.get(tenant_id)
    if not t:
        return jsonify({"message": "Tenant not found"}), 404
    u = RentalUnit.query.get(t.RentalUnitID)
    a = Apartment.query.get(u.ApartmentID) if u else None
    if not a or a.UserID != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    # optional date filters
    start = request.args.get("from")
    end = request.args.get("to")

    def in_range(dt):
        if start and dt.date() < datetime.strptime(start, "%Y-%m-%d").date():
            return False
        if end and dt.date() > datetime.strptime(end, "%Y-%m-%d").date():
            return False
        return True

    bills = []
    for b in TenantBill.query.filter_by(TenantID=tenant_id).order_by(TenantBill.IssuedDate.asc()).all():
        if in_range(b.IssuedDate):
            bills.append({
                "Issued": b.IssuedDate.strftime("%Y-%m-%d"),
                "BillingMonth": b.BillingMonth,
                "TotalAmountDue": b.TotalAmountDue,
                "Status": b.BillStatus
            })

    pays = []
    for p in RentPayment.query.filter_by(TenantID=tenant_id).order_by(RentPayment.PaymentDate.asc()).all():
        if in_range(p.PaymentDate):
            pays.append({
                "Date": p.PaymentDate.strftime("%Y-%m-%d %H:%M:%S"),
                "BillingMonth": p.BillingMonth,
                "AmountPaid": p.AmountPaid,
                "Method": p.PaidViaMobile,
                "BalanceAfter": p.Balance
            })

    return jsonify({
        "Tenant": {"TenantID": t.TenantID, "FullName": t.FullName},
        "Apartment": a.ApartmentName if a else None,
        "Unit": u.Label if u else None,
        "Bills": bills, "Payments": pays
    }), 200

# Reminders (SMS/Email logging)


@routes.route('/tenants/<int:tenant_id>/remind', methods=['POST'])
@jwt_required()
def remind_tenant(tenant_id):
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    channel = (data.get("channel") or "sms").lower()  # sms|email
    template = (data.get("template") or "due")        # due|late|custom
    custom = data.get("message")

    t = Tenant.query.get(tenant_id)
    if not t:
        return jsonify({"message": "Tenant not found"}), 404
    u = RentalUnit.query.get(t.RentalUnitID)
    a = Apartment.query.get(u.ApartmentID) if u else None
    if not a or a.UserID != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    # build message
    latest_bill = (TenantBill.query.filter_by(TenantID=tenant_id)
                   .order_by(TenantBill.IssuedDate.desc()).first())
    msg = custom or f"Hello {t.FullName}, your rent for {latest_bill.BillingMonth if latest_bill else 'this month'} is due. Kindly clear your balance."

    if channel == "sms" and t.Phone:
        try:
            send_sms(t.Phone, msg)  # your util
            log = SMSUsageLog(LandlordID=user_id, TenantID=tenant_id,
                              PhoneNumber=t.Phone, Message=msg, CostPerSMS=1.0)
            db.session.add(log)
            db.session.commit()
        except Exception as e:
            return jsonify({"message": "Failed to send SMS", "error": str(e)}), 500
    else:
        # (optional) email integration if you want
        pass

    return jsonify({"message": "✅ Reminder sent"}), 200

# # Vacant units helper for onboarding


# @routes.route('/units/vacant', methods=['GET'])
# @jwt_required()
# def list_vacant_units():
#     user_id = get_jwt_identity()
#     apt_id = request.args.get('apartment_id', type=int)
#     q = (RentalUnit.query
#          .join(Apartment, RentalUnit.ApartmentID == Apartment.ApartmentID)
#          .filter(Apartment.UserID == user_id))
#     if apt_id:
#         q = q.filter(RentalUnit.ApartmentID == apt_id)

#     # use status name if you adopt name-based check
#     vacant_id = get_status_id("Vacant")
#     units = q.filter(RentalUnit.StatusID == vacant_id).order_by(
#         RentalUnit.ApartmentID.asc()).all()

#     return jsonify([{
#         "UnitID": u.UnitID, "Label": u.Label, "ApartmentID": u.ApartmentID,
#         "Rent": u.MonthlyRent
#     } for u in units]), 200

# Alerts for the dashboard toolbar


@routes.route('/tenants/alerts', methods=['GET'])
@jwt_required()
def tenant_alerts():
    user_id = get_jwt_identity()
    # landlord units
    apartment_ids = [
        a.ApartmentID for a in Apartment.query.filter_by(UserID=user_id).all()]
    unit_ids = [u.UnitID for u in RentalUnit.query.filter(
        RentalUnit.ApartmentID.in_(apartment_ids)).all()]

    # due within next 7 days
    now = datetime.utcnow()
    # simplistic: end of month or use +7d
    future = datetime(now.year, now.month, 28)
    due_soon = TenantBill.query.filter(
        TenantBill.RentalUnitID.in_(unit_ids),
        TenantBill.DueDate <= future,
        TenantBill.BillStatus.in_(["Unpaid", "Partially Paid"])
    ).count()

    # vacating soon
    vacating_soon = VacateNotice.query.filter(
        VacateNotice.RentalUnitID.in_(unit_ids),
        VacateNotice.Status == 'Pending',
        VacateNotice.ExpectedVacateDate >= now.date()
    ).count()

    # unmatched payments would be handled if you add that concept; placeholder 0
    unmatched = 0

    return jsonify({
        "due_soon": due_soon,
        "vacating_soon": vacating_soon,
        "unmatched_payments": unmatched
    }), 200

# Edit tenant's profile
# # Edit / update a tenant's details (name, phone, email, ID, move-in/out, status)


# @routes.route('/edittenantsprofile/<int:tenant_id>', methods=['PUT', 'PATCH'])
# @jwt_required()
# def update_tenant(tenant_id):
#     user_id = get_jwt_identity()
#     data = request.get_json() or {}

#     tenant = Tenant.query.get(tenant_id)
#     if not tenant:
#         return jsonify({"message": "Tenant not found."}), 404

#     # Verify the landlord owns the apartment for this tenant's unit
#     unit = RentalUnit.query.get(
#         tenant.RentalUnitID) if tenant.RentalUnitID else None
#     apartment = Apartment.query.get(unit.ApartmentID) if unit else None
#     if not apartment or apartment.UserID != user_id:
#         return jsonify({"message": "Unauthorized: You do not own the apartment for this tenant."}), 403

#     # Allowed fields
#     full_name = data.get("FullName")
#     phone = data.get("Phone")
#     email = data.get("Email")
#     id_number = data.get("IDNumber")
#     move_in = data.get("MoveInDate")
#     move_out = data.get("MoveOutDate")
#     status = data.get("Status")  # "Active" | "Inactive"

#     # Optional validations
#     if phone is not None:
#         import re
#         if phone and not re.fullmatch(r'2547\d{8}', phone):
#             return jsonify({"message": "Invalid phone number. It must start with '2547' and be 12 digits long."}), 400

#     from datetime import datetime

#     def parse_date(val):
#         if not val:
#             return None
#         try:
#             return datetime.strptime(val, '%Y-%m-%d').date()
#         except ValueError:
#             return None

#     # Apply updates only if provided
#     if full_name is not None:
#         tenant.FullName = full_name.strip()
#     if phone is not None:
#         tenant.Phone = phone.strip() if phone else None
#     if email is not None:
#         tenant.Email = email.strip() if email else None
#     if id_number is not None:
#         tenant.IDNumber = id_number.strip() if id_number else None

#     if move_in is not None:
#         dt = parse_date(move_in)
#         if move_in and not dt:
#             return jsonify({"message": "Invalid MoveInDate. Use YYYY-MM-DD."}), 400
#         tenant.MoveInDate = dt

#     if move_out is not None:
#         dt = parse_date(move_out)
#         if move_out and not dt:
#             return jsonify({"message": "Invalid MoveOutDate. Use YYYY-MM-DD."}), 400
#         tenant.MoveOutDate = dt

#     if status is not None:
#         if status not in ("Active", "Inactive"):
#             return jsonify({"message": "Invalid Status. Use 'Active' or 'Inactive'."}), 400
#         tenant.Status = status

#     db.session.commit()

#     return jsonify({
#         "message": "✅ Tenant updated successfully.",
#         "tenant": {
#             "TenantID": tenant.TenantID,
#             "FullName": tenant.FullName,
#             "Phone": tenant.Phone,
#             "Email": tenant.Email,
#             "IDNumber": tenant.IDNumber,
#             "Status": tenant.Status,
#             "MoveInDate": tenant.MoveInDate.strftime('%Y-%m-%d') if tenant.MoveInDate else None,
#             "MoveOutDate": tenant.MoveOutDate.strftime('%Y-%m-%d') if tenant.MoveOutDate else None,
#         }
#     }), 200

# ---- /billing/cashflow ------------------------------------------------------
@routes.route("/billing/cashflow", methods=["GET"])
@jwt_required()
def billing_cashflow():
    """
    Returns billed vs collected between ?from=YYYY-MM-DD & ?to=YYYY-MM-DD
    Shape:
      {
        status: "success",
        series: [{ date: "2025-08-01", billed: 1234.00, collected: 567.00 }, ...],
        totals: { billed: 0.0, collected: 0.0 }
      }
    """
    from collections import defaultdict
    from decimal import Decimal
    from datetime import datetime, date, timedelta

    def _parse(dstr, fallback):
        try:
            return datetime.strptime(dstr, "%Y-%m-%d").date()
        except Exception:
            return fallback

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized access."}), 403

    today = date.today()
    d_from = _parse(request.args.get("from"), today.replace(day=1))
    d_to = _parse(request.args.get("to"),   today)
    if d_to < d_from:
        d_from, d_to = d_to, d_from

    # landlord scope -> apartments -> units
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apt_ids = [a.ApartmentID for a in apartments]
    units = RentalUnit.query.filter(RentalUnit.ApartmentID.in_(apt_ids)).all()
    unit_ids = [u.UnitID for u in units]

    # time boundaries (inclusive end)
    start_dt = datetime.combine(d_from, datetime.min.time())
    end_dt = datetime.combine(d_to + timedelta(days=1), datetime.min.time())

    # Collected: payments in date window
    payments = (RentPayment.query
                .filter(RentPayment.RentalUnitID.in_(unit_ids),
                        RentPayment.PaymentDate >= start_dt,
                        RentPayment.PaymentDate < end_dt)
                .all())

    collected_by_day = defaultdict(Decimal)
    for p in payments:
        key = p.PaymentDate.date()
        collected_by_day[key] += Decimal(p.AmountPaid or 0)

    # Billed: bills issued in window (use IssuedDate for generation day)
    bills = (TenantBill.query
             .filter(TenantBill.RentalUnitID.in_(unit_ids),
                     TenantBill.IssuedDate >= start_dt,
                     TenantBill.IssuedDate < end_dt)
             .all())

    billed_by_day = defaultdict(Decimal)
    for b in bills:
        key = b.IssuedDate.date()
        billed_by_day[key] += Decimal(b.TotalAmountDue or 0)

    # Build continuous series day by day
    series, tot_billed, tot_collected = [], Decimal("0"), Decimal("0")
    day = d_from
    while day <= d_to:
        billed = billed_by_day.get(day, Decimal("0"))
        collected = collected_by_day.get(day, Decimal("0"))
        series.append({
            "date": day.strftime("%Y-%m-%d"),
            "billed": float(billed),
            "collected": float(collected)
        })
        tot_billed += billed
        tot_collected += collected
        day += timedelta(days=1)

    return jsonify({
        "status": "success",
        "series": series,
        "totals": {"billed": float(tot_billed), "collected": float(tot_collected)}
    }), 200

# ---- /billing/arrears -------------------------------------------------------


@routes.route("/billing/arrears", methods=["GET"])
@jwt_required()
def billing_arrears():
    """
    Returns list of open balances (balance > 0).
    Shape:
      { status: "success", items: [{ BillID, TenantName, ApartmentName, UnitLabel,
                                     BillingMonth, TotalAmountDue, PaidToDate, Balance }] }
    """
    from decimal import Decimal

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized access."}), 403

    # landlord scope
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apt_ids = [a.ApartmentID for a in apartments]
    units = RentalUnit.query.filter(RentalUnit.ApartmentID.in_(apt_ids)).all()
    unit_ids = [u.UnitID for u in units]

    bills = (TenantBill.query
             .filter(TenantBill.RentalUnitID.in_(unit_ids))
             .order_by(TenantBill.BillID.asc())
             .all())

    items = []
    for b in bills:
        paid = compute_paid_to_date_for_bill(b.BillID)
        balance, _ = compute_balance_and_status(
            Decimal(b.TotalAmountDue or 0), paid)
        if balance > 0:
            tenant = Tenant.query.get(b.TenantID)
            unit = RentalUnit.query.get(b.RentalUnitID)
            apt = Apartment.query.get(unit.ApartmentID) if unit else None
            items.append({
                "BillID": b.BillID,
                "TenantName": tenant.FullName if tenant else "Unknown",
                "ApartmentName": apt.ApartmentName if apt else "Unknown",
                "UnitLabel": unit.Label if unit else "Unknown",
                "BillingMonth": b.BillingMonth,
                "TotalAmountDue": float(b.TotalAmountDue or 0),
                "PaidToDate": float(paid),
                "Balance": float(balance)
            })

    return jsonify({"status": "success", "items": items}), 200
