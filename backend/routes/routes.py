from flask import current_app
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import jwt
from flask_mail import Message
from flask_mail import Mail
from datetime import datetime, timedelta
import time
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from models.models import db, User ,  Apartment ,  UnitCategory,  RentalUnitStatus, RentalUnit
import re  # ✅ For password strength checking

routes = Blueprint('routes', __name__)
CORS(routes)

bcrypt = Bcrypt()

mail = None

# ✅ Placeholder for mail - will be assigned later from app.py
mail = None

# ✅ Register mail instance
def register_mail_instance(mail_instance):
    global mail
    mail = mail_instance

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
    if not all([full_name, email, password, confirm_password]):
        return jsonify({'message': 'Full name, email, password and confirm password are required'}), 400

    # ✅ Check if passwords match
    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match!'}), 400

    # ✅ Check if user already exists
    if User.query.filter_by(Email=email).first():
        return jsonify({'message': 'Email is already registered'}), 409

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

    return jsonify({'message': '✅ Landlord account created successfully!'}), 201

# Track failed login attempts
login_attempts = {}
MAX_ATTEMPTS = 5
LOCKOUT_TIME = 60  # seconds

#Landlord login
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

    token = create_access_token(identity=user.UserID, expires_delta=timedelta(days=1))
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

#Landlord can view the profile
@routes.route('/profile', methods=['GET'])
@jwt_required()
def view_profile():
    user_id = get_jwt_identity()  # ✅ pulls from 'identity'
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({
        'UserID': user.UserID,
        'FullName': user.FullName,
        'Email': user.Email,
        'Phone': user.Phone,
        'IsAdmin': user.IsAdmin,
        'CreatedAt': user.CreatedAt.strftime('%Y-%m-%d %H:%M:%S')
    }), 200


#Editing and Updating profile
@routes.route('/update_profile', methods=['PATCH'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': '❌ User not found.'}), 404

    data = request.get_json()

    full_name = data.get('FullName')
    email = data.get('Email')
    phone = data.get('Phone')

    # ✅ Email uniqueness check
    if email and email != user.Email:
        if User.query.filter_by(Email=email).first():
            return jsonify({'message': '❌ Email is already in use by another account.'}), 409
        user.Email = email

    if full_name:
        user.FullName = full_name

    if phone:
        user.Phone = phone

    db.session.commit()

    return jsonify({
        'message': '✅ Profile updated successfully!',
        'updated_profile': {
            'UserID': user.UserID,
            'FullName': user.FullName,
            'Email': user.Email,
            'Phone': user.Phone
        }
    }), 200

# ✅ Change password route
@routes.route('/password_change', methods=['PATCH'])
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

#Forgot password
@routes.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    user = User.query.filter_by(Email=email).first()
    if not user:
        return jsonify({'message': 'This email is not registered with us.'}), 404

    # Generate a token valid for 24 hours
    token = jwt.encode(
        {
            'user_id': user.UserID,
            'exp': datetime.utcnow() + timedelta(hours=24)
        },
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )

    # Create reset link (adjust domain if hosted)
    reset_link = f"http://127.0.0.1:5000/reset-password/{token}"

    # Send email
    msg = Message(
        subject="🔐 Reset Your Password",
        recipients=[email],
        body=f"""
Dear {user.FullName},

We received a request to reset your password.

Click the link below to reset it:
{reset_link}

This link is valid for 24 hours.

If you didn’t request this, you can ignore this email.

Best regards,  
NyumbaSmart Support
"""
    )

    try:
        mail.send(msg)
        return jsonify({'message': '✅ Password reset link sent to your email.'}), 200
    except Exception as e:
        return jsonify({'message': '❌ Failed to send email.', 'error': str(e)}), 500

#Reset Password Link Route from Forgotten Password
@routes.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')

    if not new_password or not confirm_password:
        return jsonify({'message': 'Both password fields are required'}), 400

    if new_password != confirm_password:
        return jsonify({'message': 'Passwords do not match'}), 400

    # Validate password strength
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
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        user_id = payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Reset link has expired.'}), 400
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid reset link.'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # 🚫 Prevent reuse of old password
    if bcrypt.check_password_hash(user.Password, new_password):
        return jsonify({'message': '⚠️ You cannot reuse your previous password. Choose a different one.'}), 400

    # Update password
    hashed_pw = bcrypt.generate_password_hash(new_password).decode('utf-8')
    user.Password = hashed_pw
    db.session.commit()

    return jsonify({'message': '✅ Password reset successful! You can now log in.'}), 200

#Route for creating an apartment
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

#Route for viewing for viewing all apartments by logged in landlord 
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

#route for updating the details of an apartment 
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

#Viewing aparticular apartment
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

#Create a Unit Category 
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
    existing = UnitCategory.query.filter_by(CategoryName=category_name.strip()).first()
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

#Fetching the rental units
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


#route for creating a rental unit status
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
    existing_status = RentalUnitStatus.query.filter_by(StatusName=status_name.strip()).first()
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

#Fetching rental unit status 
@routes.route('/rental-unit-statuses', methods=['GET'])
@jwt_required()
def get_rental_unit_statuses():
    statuses = RentalUnitStatus.query.order_by(RentalUnitStatus.StatusName).all()

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

#Create a Rental Unit
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


#Update a Rental Unit 
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
