from flask import current_app, Blueprint, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_mail import Message, Mail
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import jwt
import os
import re
import time
import cloudinary.uploader

from utils.sms_helper import send_sms
from utils.billing_helper import calculate_bill_amount
from utils.cloudinary_helper import upload_to_cloudinary
from models.models import (
    db, User, Apartment, UnitCategory, RentalUnitStatus, RentalUnit, Tenant,
    VacateLog, TransferLog, VacateNotice, SMSUsageLog, TenantBill,
    RentPayment, LandlordExpense, Profile
)

# ✅ Initialize Blueprint
routes = Blueprint("routes", __name__)

# ✅ Configure CORS for specific origins
CORS(
    routes,
    resources={r"/*": {"origins": [
        "http://localhost:3000",       # Local frontend
        "http://127.0.0.1:3000",       # Alternative local frontend
        "https://nyumbasmart.vercel.app"  # Production frontend
    ]}},
    supports_credentials=True
)

# ✅ Initialize Bcrypt
bcrypt = Bcrypt()

# ✅ Mail instance (to be set from app.py)
mail = None


def register_mail_instance(mail_instance):
    """
    Registers the Flask-Mail instance from app.py
    so that routes can send emails.
    """
    global mail
    mail = mail_instance


def serialize_profile(user, profile):
    return {
        "UserID": user.UserID,
        "FullName": user.FullName,
        "Email": user.Email,
        "Phone": user.Phone,
        "ProfilePicture": profile.ProfilePicture if profile else None,
        "Address": profile.Address if profile else "",
        "NationalID": profile.NationalID if profile else "",
        "KRA_PIN": profile.KRA_PIN if profile else "",
        "Bio": profile.Bio if profile else "",
        "DateOfBirth": profile.DateOfBirth.strftime("%Y-%m-%d") if profile and profile.DateOfBirth else None,
        "UpdatedAt": profile.UpdatedAt.strftime("%Y-%m-%d %H:%M:%S") if profile and profile.UpdatedAt else None
    }


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

    # Ensure only landlords can access this route
    if not user or not user.IsAdmin:
        return jsonify({"message": "Unauthorized. Only landlords can view their apartments."}), 403

    # Fetch apartments belonging to this landlord
    apartments = Apartment.query.filter_by(UserID=user.UserID).all()

    apartment_list = []
    for apt in apartments:
        apartment_list.append({
            "ApartmentID": apt.ApartmentID,
            "ApartmentName": apt.ApartmentName,
            "Location": apt.Location,
            "Description": apt.Description,
            "CreatedAt": apt.CreatedAt.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify({
        "message": f"✅ Found {len(apartment_list)} apartment(s) for landlord {user.FullName}.",
        "Apartments": apartment_list
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
            "AdditionalBills": unit.AdditionalBills,
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
    additional_bills = data.get('AdditionalBills', 0.0)
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
        AdditionalBills=additional_bills,
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
            "AdditionalBills": rental_unit.AdditionalBills,
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
    unit.AdditionalBills = data.get('AdditionalBills', unit.AdditionalBills)
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
            "AdditionalBills": unit.AdditionalBills,
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


# Route for allocating a tenant to a different rental unit in the same apartment
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

    # 1. Vacate old unit
    old_unit.StatusID = 1
    old_unit.CurrentTenantID = None

    # 2. Update tenant
    tenant.RentalUnitID = new_unit_id
    tenant.MoveInDate = new_move_in
    tenant.MoveOutDate = None
    tenant.Status = 'Active'

    # 3. Occupy new unit
    new_unit.StatusID = 2
    new_unit.CurrentTenantID = tenant.TenantID

    # 4. Log transfer
    log = TransferLog(
        TenantID=tenant.TenantID,
        OldUnitID=old_unit.UnitID,
        NewUnitID=new_unit.UnitID,
        TransferredBy=user_id,
        Reason=reason
    )
    db.session.add(log)
    db.session.flush()  # ✅ Ensures log.TransferDate and ID are populated before access

    # 5. Commit all changes
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

    # Optional filters
    apartment_filter = request.args.get('apartment_id')
    # 'Active', 'Inactive', or None for all
    status_filter = request.args.get('status')
    sort_by = request.args.get('sort', 'Apartment')

    # Step 1: Get apartments owned by this landlord
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apartment_ids = [apt.ApartmentID for apt in apartments]

    # Step 2: Get rental units in those apartments (optionally filter by apartment_id)
    units_query = RentalUnit.query.filter(
        RentalUnit.ApartmentID.in_(apartment_ids))
    if apartment_filter:
        units_query = units_query.filter_by(ApartmentID=int(apartment_filter))
    units = units_query.all()
    unit_dict = {unit.UnitID: unit for unit in units}

    # Step 3: Get all tenants in those units (optionally filter by status)
    tenants_query = Tenant.query.filter(
        Tenant.RentalUnitID.in_(unit_dict.keys()))
    if status_filter:
        tenants_query = tenants_query.filter_by(Status=status_filter)
    tenants = tenants_query.all()

    # Step 4: Build response list
    tenant_list = []
    for t in tenants:
        unit = unit_dict.get(t.RentalUnitID)
        apartment = Apartment.query.get(unit.ApartmentID) if unit else None

        tenant_list.append({
            "TenantID": t.TenantID,
            "FullName": t.FullName,
            "Email": t.Email,
            "Phone": t.Phone,
            "IDNumber": t.IDNumber,
            "RentalUnit": unit.Label if unit else "N/A",
            "Apartment": apartment.ApartmentName if apartment else "N/A",
            "MoveInDate": t.MoveInDate.strftime('%Y-%m-%d') if t.MoveInDate else None,
            "MoveOutDate": t.MoveOutDate.strftime('%Y-%m-%d') if t.Status == "Inactive" and t.MoveOutDate else None,
            "Status": t.Status
        })

    # Step 5: Sort by apartment name
    if sort_by.lower() == "apartment":
        tenant_list.sort(key=lambda x: x['Apartment'])

    return jsonify({
        "total_tenants": len(tenant_list),
        "filtered_status": status_filter or "All",
        "tenants": tenant_list
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

    tenant_id = data.get("TenantID")  # Optional for individual tenant
    billing_month = data.get("BillingMonth")

    # ✅ If BillingMonth not provided, use current month
    if not billing_month:
        today = datetime.today()
        billing_month = today.strftime("%B %Y")

    utilities_data = data.get("utilities", {})

    try:
        due_date = datetime(datetime.today().year, datetime.today().month, 5)

        # ✅ Filter active tenants
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

            # ✅ Check if a bill for this tenant & month exists
            bill = TenantBill.query.filter_by(
                TenantID=tenant.TenantID,
                BillingMonth=billing_month
            ).first()

            if not bill:
                # ✅ Create new bill
                bill = TenantBill(
                    TenantID=tenant.TenantID,
                    RentalUnitID=tenant.RentalUnitID,
                    BillingMonth=billing_month,
                    RentAmount=unit.MonthlyRent,
                    WaterBill=utilities_data.get("WaterBill", 0.0),
                    ElectricityBill=utilities_data.get("ElectricityBill", 0.0),
                    Garbage=utilities_data.get("Garbage", 0.0),
                    Internet=utilities_data.get("Internet", 0.0),
                    DueDate=due_date,
                    IssuedDate=datetime.now(),
                    BillStatus="Unpaid"
                )

                # ✅ Calculate totals BEFORE adding to DB
                total_due, carried_balance = calculate_bill_amount(
                    tenant.TenantID,
                    unit.MonthlyRent,
                    bill.WaterBill,
                    bill.ElectricityBill,
                    bill.Garbage,
                    bill.Internet
                )

                bill.CarriedForwardBalance = carried_balance
                bill.TotalAmountDue = total_due

                db.session.add(bill)

            else:
                # ✅ Update bill utilities if already exists
                bill.WaterBill = utilities_data.get(
                    "WaterBill", bill.WaterBill)
                bill.ElectricityBill = utilities_data.get(
                    "ElectricityBill", bill.ElectricityBill)
                bill.Garbage = utilities_data.get("Garbage", bill.Garbage)
                bill.Internet = utilities_data.get("Internet", bill.Internet)

                total_due, carried_balance = calculate_bill_amount(
                    tenant.TenantID,
                    unit.MonthlyRent,
                    bill.WaterBill,
                    bill.ElectricityBill,
                    bill.Garbage,
                    bill.Internet
                )

                bill.CarriedForwardBalance = carried_balance
                bill.TotalAmountDue = total_due

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
        return jsonify({
            "status": "error",
            "alert": "❌ Failed to generate/update bills.",
            "error": str(e)
        }), 500

# Route for fetching the bills for all the tenants of a landlord


@routes.route("/bills", methods=["GET"])
@jwt_required()
def get_filtered_bills():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized access."}), 403

    # ✅ Get query parameters
    apartment_id = request.args.get("apartment_id", type=int)  # e.g., 3
    month_filter = request.args.get(
        "month")                   # e.g., "July 2025"
    status_filter = request.args.get("status")                 # e.g., "Unpaid"

    valid_statuses = ["Unpaid", "Paid", "Partially Paid", "Overpaid"]
    if status_filter and status_filter not in valid_statuses:
        return jsonify({
            "status": "error",
            "message": f"Invalid status. Choose from {valid_statuses}"
        }), 400

    # ✅ Get landlord's apartments
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apartment_ids = [a.ApartmentID for a in apartments]

    if apartment_id and apartment_id not in apartment_ids:
        return jsonify({"status": "error", "message": "You do not own this apartment."}), 403

    # ✅ Get units (filtered by apartment if specified)
    units_query = RentalUnit.query.filter(
        RentalUnit.ApartmentID.in_(apartment_ids))
    if apartment_id:
        units_query = units_query.filter_by(ApartmentID=apartment_id)

    units = units_query.all()
    unit_ids = [u.UnitID for u in units]

    # ✅ Base query for bills
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

        result.append({
            "BillID": bill.BillID,
            "TenantName": tenant.FullName if tenant else "Unknown",
            "ApartmentName": apartment.ApartmentName if apartment else "Unknown",
            "UnitLabel": unit.Label if unit else "Unknown",
            "BillingMonth": bill.BillingMonth,
            "TotalAmountDue": bill.TotalAmountDue,
            "BillStatus": bill.BillStatus,
            "DueDate": bill.DueDate.strftime("%Y-%m-%d"),
            "IssuedDate": bill.IssuedDate.strftime("%Y-%m-%d %H:%M:%S")
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
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized access."}), 403

    # ✅ Get units that belong to the given apartment
    units = RentalUnit.query.filter_by(ApartmentID=apartment_id).all()
    unit_ids = [u.UnitID for u in units]

    if not unit_ids:
        return jsonify({"status": "success", "message": "No rental units found for this apartment.", "bills": []}), 200

    # ✅ Get bills for tenants in those units
    bills = TenantBill.query.filter(TenantBill.RentalUnitID.in_(unit_ids))\
                            .order_by(TenantBill.BillID.asc()).all()

    result = []
    for bill in bills:
        tenant = Tenant.query.get(bill.TenantID)
        unit = RentalUnit.query.get(bill.RentalUnitID)

        result.append({
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
            "DueDate": bill.DueDate.strftime("%Y-%m-%d"),
            "IssuedDate": bill.IssuedDate.strftime("%Y-%m-%d %H:%M:%S")
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
    bills = TenantBill.query.filter_by(RentalUnitID=unit_id).order_by(
        TenantBill.IssuedDate.desc()).all()

    if not bills:
        return jsonify({
            "status": "success",
            "message": f"No bills found for unit {unit.Label}.",
            "bills": []
        }), 200

    result = []
    for bill in bills:
        tenant = Tenant.query.get(bill.TenantID)

        result.append({
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
            "DueDate": bill.DueDate.strftime("%Y-%m-%d"),
            "IssuedDate": bill.IssuedDate.strftime("%Y-%m-%d %H:%M:%S")
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
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized access."}), 403

    # Get apartments owned by landlord
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apartment_ids = [a.ApartmentID for a in apartments]

    # Get all rental units under these apartments
    units = RentalUnit.query.filter(
        RentalUnit.ApartmentID.in_(apartment_ids)).all()
    unit_ids = [u.UnitID for u in units]

    # Fetch bills for given month and landlord's units
    bills = TenantBill.query.filter(
        TenantBill.RentalUnitID.in_(unit_ids),
        TenantBill.BillingMonth.ilike(month)  # e.g. "July 2025"
    ).order_by(TenantBill.BillID.asc()).all()

    if not bills:
        return jsonify({"status": "success", "message": f"No bills found for {month}."}), 200

    result = []
    for bill in bills:
        tenant = Tenant.query.get(bill.TenantID)
        unit = RentalUnit.query.get(bill.RentalUnitID)

        result.append({
            "BillID": bill.BillID,
            "TenantName": tenant.FullName if tenant else "Unknown",
            "UnitLabel": unit.Label if unit else "Unknown",
            "BillingMonth": bill.BillingMonth,
            "TotalAmountDue": bill.TotalAmountDue,
            "BillStatus": bill.BillStatus
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
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized access."}), 403

    valid_statuses = ["Unpaid", "Paid", "Partially Paid", "Overpaid"]
    if status not in valid_statuses:
        return jsonify({"status": "error", "message": f"Invalid status. Choose from {valid_statuses}"}), 400

    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apartment_ids = [a.ApartmentID for a in apartments]

    units = RentalUnit.query.filter(
        RentalUnit.ApartmentID.in_(apartment_ids)).all()
    unit_ids = [u.UnitID for u in units]

    bills = TenantBill.query.filter(
        TenantBill.RentalUnitID.in_(unit_ids),
        TenantBill.BillStatus == status
    ).order_by(TenantBill.BillID.asc()).all()

    if not bills:
        return jsonify({"status": "success", "message": f"No bills found with status '{status}'."}), 200

    result = []
    for bill in bills:
        tenant = Tenant.query.get(bill.TenantID)
        unit = RentalUnit.query.get(bill.RentalUnitID)

        result.append({
            "BillID": bill.BillID,
            "TenantName": tenant.FullName if tenant else "Unknown",
            "UnitLabel": unit.Label if unit else "Unknown",
            "BillingMonth": bill.BillingMonth,
            "TotalAmountDue": bill.TotalAmountDue,
            "BillStatus": bill.BillStatus
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

        bills = TenantBill.query.filter(
            TenantBill.RentalUnitID.in_(unit_ids),
            TenantBill.BillingMonth.ilike(month)
        ).order_by(TenantBill.BillID.asc()).all()

        bills_list = []
        for bill in bills:
            tenant = Tenant.query.get(bill.TenantID)
            unit = RentalUnit.query.get(bill.RentalUnitID)
            bills_list.append({
                "BillID": bill.BillID,
                "TenantName": tenant.FullName if tenant else "Unknown",
                "UnitLabel": unit.Label if unit else "Unknown",
                "BillingMonth": bill.BillingMonth,
                "TotalAmountDue": bill.TotalAmountDue,
                "BillStatus": bill.BillStatus
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

# Route for posting the rent payment and updating its status as paid


@routes.route("/tenant-payments", methods=["POST"])
@jwt_required()
def record_rent_payment():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # ✅ Only landlords can record payments
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized."}), 403

    data = request.get_json()
    tenant_id = data.get("TenantID")
    rental_unit_id = data.get("RentalUnitID")
    billing_month = data.get("BillingMonth")
    paid_via_mobile = data.get("PaidViaMobile")

    # ✅ Validate required fields (except AmountPaid)
    if tenant_id is None or rental_unit_id is None or billing_month is None or paid_via_mobile is None:
        return jsonify({"status": "error", "message": "TenantID, RentalUnitID, BillingMonth, and PaidViaMobile are required."}), 400

    # ✅ Validate AmountPaid separately
    if "AmountPaid" not in data:
        return jsonify({"status": "error", "message": "AmountPaid is required."}), 400

    try:
        amount_paid = float(data.get("AmountPaid"))
    except ValueError:
        return jsonify({"status": "error", "message": "AmountPaid must be a number."}), 400

    # ✅ Find the corresponding TenantBill
    tenant_bill = TenantBill.query.filter_by(
        TenantID=tenant_id,
        RentalUnitID=rental_unit_id,
        BillingMonth=billing_month
    ).first()

    if not tenant_bill:
        return jsonify({"status": "error", "message": "Tenant bill not found for this month."}), 404

    billed_amount = tenant_bill.TotalAmountDue
    balance = billed_amount - amount_paid  # Default balance

    # ✅ Determine Bill Status
    if amount_paid == billed_amount:
        bill_status = "Paid"
        balance = 0.0
    elif amount_paid < billed_amount:
        bill_status = "Partially Paid"
    else:  # Overpayment
        bill_status = "Overpaid"
        balance = -(amount_paid - billed_amount)

    # ✅ Record the payment
    new_payment = RentPayment(
        TenantID=tenant_id,
        RentalUnitID=rental_unit_id,
        BillingMonth=billing_month,
        BilledAmount=billed_amount,
        AmountPaid=amount_paid,
        Balance=balance,
        PaidViaMobile=paid_via_mobile
    )
    db.session.add(new_payment)

    # ✅ Update ONLY Bill Status
    tenant_bill.BillStatus = bill_status
    # ❌ Do NOT update CarriedForwardBalance here
    # It will be recalculated in the next month's bill using helper

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": f"Payment recorded successfully. Bill is now '{bill_status}'.",
        "payment_details": {
            "TenantID": tenant_id,
            "RentalUnitID": rental_unit_id,
            "BillingMonth": billing_month,
            "BilledAmount": billed_amount,
            "AmountPaid": amount_paid,
            "Balance": balance,
            "BillStatus": bill_status
        }
    }), 201


# route for creating landlord expenses for a particular apartment
@routes.route("/landlord-expenses/add", methods=["POST"])
@jwt_required()
def add_landlord_expense():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # ✅ Only landlords (admins) can add expenses
    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized. Only landlords can add expenses."}), 403

    data = request.get_json()

    apartment_id = data.get("ApartmentID")
    expense_type = data.get("ExpenseType")
    amount = data.get("Amount")
    description = data.get("Description", "")

    # ✅ Validate required fields
    if not apartment_id or not expense_type or amount is None:
        return jsonify({"status": "error", "message": "ApartmentID, ExpenseType, and Amount are required."}), 400

    try:
        amount = float(amount)
    except ValueError:
        return jsonify({"status": "error", "message": "Amount must be a valid number."}), 400

    # ✅ Check if apartment exists
    apartment = Apartment.query.get(apartment_id)
    if not apartment:
        return jsonify({"status": "error", "message": "Apartment not found."}), 404

    # ✅ Create the expense record
    new_expense = LandlordExpense(
        ApartmentID=apartment_id,
        ExpenseType=expense_type,
        Amount=amount,
        Description=description,
        ExpenseDate=datetime.utcnow()  # You can allow user to pass custom date if needed
    )

    db.session.add(new_expense)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Expense added successfully.",
        "expense": {
            "ExpenseID": new_expense.ExpenseID,
            "ApartmentID": new_expense.ApartmentID,
            "ExpenseType": new_expense.ExpenseType,
            "Amount": new_expense.Amount,
            "Description": new_expense.Description,
            "ExpenseDate": new_expense.ExpenseDate.strftime("%Y-%m-%d")
        }
    }), 201

# Routes for fetching the landlord expenses grouped by apartment


@routes.route("/landlord-expenses/by-apartment", methods=["GET"])
@jwt_required()
def view_expenses_by_apartment():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    # ✅ Get all expenses grouped by apartment
    expenses = LandlordExpense.query.join(Apartment).all()

    result = {}
    for exp in expenses:
        apt_name = exp.apartment.ApartmentName  # Assuming Apartment has ApartmentName
        if apt_name not in result:
            result[apt_name] = []
        result[apt_name].append({
            "ExpenseID": exp.ExpenseID,
            "ExpenseType": exp.ExpenseType,
            "Amount": exp.Amount,
            "Description": exp.Description,
            "ExpenseDate": exp.ExpenseDate.strftime("%Y-%m-%d")
        })

    return jsonify({"status": "success", "expenses": result}), 200

# View landlord expenses per month


@routes.route("/landlord-expenses/by-month", methods=["GET"])
@jwt_required()
def view_expenses_by_month():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.IsAdmin:
        return jsonify({"status": "error", "message": "Unauthorized"}), 403

    expenses = LandlordExpense.query.all()

    result = {}
    for exp in expenses:
        month_key = exp.ExpenseDate.strftime("%B %Y")
        if month_key not in result:
            result[month_key] = []
        result[month_key].append({
            "ExpenseID": exp.ExpenseID,
            "Apartment": exp.apartment.ApartmentName,
            "ExpenseType": exp.ExpenseType,
            "Amount": exp.Amount,
            "Description": exp.Description,
            "ExpenseDate": exp.ExpenseDate.strftime("%Y-%m-%d")
        })

    return jsonify({"status": "success", "expenses": result}), 200

# Get summary of landlord expenses for a specific month


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
        summary[month_key] = summary.get(month_key, 0) + exp.Amount

    return jsonify({"status": "success", "summary": summary}), 200


# Get expenses summary per apartment
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
        summary[apt_name] = summary.get(apt_name, 0) + exp.Amount

    return jsonify({"status": "success", "summary": summary}), 200


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

    data = request.form
    file = request.files.get("ProfilePicture")

    dob = None
    if data.get("DateOfBirth"):
        try:
            dob = datetime.strptime(data.get("DateOfBirth"), "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"message": "Invalid DateOfBirth format. Use YYYY-MM-DD."}), 400

    profile_pic_url = None
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
        KRA_PIN=data.get("KRA_PIN"),
        Bio=data.get("Bio"),
        DateOfBirth=dob
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

    data = request.form
    file = request.files.get("ProfilePicture")

    dob = profile.DateOfBirth
    if data.get("DateOfBirth"):
        try:
            dob = datetime.strptime(data.get("DateOfBirth"), "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"message": "Invalid DateOfBirth format. Use YYYY-MM-DD."}), 400

    profile_pic_url = profile.ProfilePicture
    if file:
        try:
            upload_result = cloudinary.uploader.upload(
                file, folder="profile_pictures")
            profile_pic_url = upload_result.get(
                "secure_url") or upload_result.get("url")
        except Exception as e:
            return jsonify({"message": "Image upload failed", "error": str(e)}), 500

    profile.Address = data.get("Address", profile.Address)
    profile.NationalID = data.get("NationalID", profile.NationalID)
    profile.KRA_PIN = data.get("KRA_PIN", profile.KRA_PIN)
    profile.Bio = data.get("Bio", profile.Bio)
    profile.DateOfBirth = dob
    profile.ProfilePicture = profile_pic_url

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
        return jsonify({"message": "Profile not found"}), 404

    return jsonify(format_profile_response(user, profile)), 200


# ✅ Helper function to format profile response
def format_profile_response(user, profile):
    return {
        "UserID": user.UserID,
        "FullName": user.FullName,
        "Email": user.Email,
        "Phone": user.Phone,
        "ProfilePicture": profile.ProfilePicture if profile else None,
        "Address": profile.Address if profile else "",
        "NationalID": profile.NationalID if profile else "",
        "KRA_PIN": profile.KRA_PIN if profile else "",
        "Bio": profile.Bio if profile else "",
        "DateOfBirth": profile.DateOfBirth.strftime("%Y-%m-%d") if profile and profile.DateOfBirth else None,
        "UpdatedAt": profile.UpdatedAt.strftime("%Y-%m-%d %H:%M:%S") if profile and profile.UpdatedAt else None
    }
