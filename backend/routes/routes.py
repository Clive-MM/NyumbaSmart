from flask import current_app
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import jwt
from flask_mail import Message
from flask_mail import Mail
from datetime import datetime, timedelta
from utils.sms_helper import send_sms
import time
# from utils import send_sms  # Placeholder for SMS function
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from models.models import db, User ,  Apartment ,  UnitCategory,  RentalUnitStatus, RentalUnit, Tenant, VacateLog,TransferLog, VacateNotice, SMSUsageLog, TenantBill
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

#Create a Rental Unit Category 
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

#Fetching the rental units categories 
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

#Fetch rental units for a specific apartment
@routes.route('/apartments/<int:apartment_id>/units', methods=['GET'])
@jwt_required()
def get_units_by_apartment(apartment_id):
    user_id = get_jwt_identity()
    # Confirm landlord owns the apartment
    apartment = Apartment.query.filter_by(ApartmentID=apartment_id, UserID=user_id).first()

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

#Route for assigning tenants to rental units
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
    existing_tenant = Tenant.query.filter_by(Phone=phone, IDNumber=id_number).first()
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

#route for vacating tenant
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



#Transfering a tenant from apartment to another apartment
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



#Route for allocating a tenant to a different rental unit in the same apartment
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
    status_filter = request.args.get('status')  # 'Active', 'Inactive', or None for all
    sort_by = request.args.get('sort', 'Apartment')

    # Step 1: Get apartments owned by this landlord
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apartment_ids = [apt.ApartmentID for apt in apartments]

    # Step 2: Get rental units in those apartments (optionally filter by apartment_id)
    units_query = RentalUnit.query.filter(RentalUnit.ApartmentID.in_(apartment_ids))
    if apartment_filter:
        units_query = units_query.filter_by(ApartmentID=int(apartment_filter))
    units = units_query.all()
    unit_dict = {unit.UnitID: unit for unit in units}

    # Step 3: Get all tenants in those units (optionally filter by status)
    tenants_query = Tenant.query.filter(Tenant.RentalUnitID.in_(unit_dict.keys()))
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


#Route for creating and sending a vacation notice to a tenant 
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
        vacate_date = datetime.strptime(expected_vacate_date, '%Y-%m-%d').date()
        inspection = datetime.strptime(inspection_date, '%Y-%m-%d').date() if inspection_date else None
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

#View All Transfers for a Landlord
@routes.route('/transfer-logs', methods=['GET'])
@jwt_required()
def view_transfer_logs():
    user_id = get_jwt_identity()

    # Step 1: Get all apartments owned by this landlord
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apartment_ids = [apt.ApartmentID for apt in apartments]

    # Step 2: Get all units in those apartments
    units = RentalUnit.query.filter(RentalUnit.ApartmentID.in_(apartment_ids)).all()
    unit_ids = [unit.UnitID for unit in units]
    unit_dict = {unit.UnitID: unit for unit in units}

    # Step 3: Fetch relevant transfer logs where the tenant moved to or from a unit in the landlord’s apartments
    transfer_logs = TransferLog.query.filter(
        (TransferLog.OldUnitID.in_(unit_ids)) | (TransferLog.NewUnitID.in_(unit_ids))
    ).order_by(TransferLog.TransferDate.desc()).all()

    result = []
    for log in transfer_logs:
        tenant = Tenant.query.get(log.TenantID)
        old_unit = unit_dict.get(log.OldUnitID)
        new_unit = unit_dict.get(log.NewUnitID)

        old_apartment = Apartment.query.get(old_unit.ApartmentID) if old_unit else None
        new_apartment = Apartment.query.get(new_unit.ApartmentID) if new_unit else None

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

#View Tenant Vacating History for Landlord
@routes.route('/vacate-logs', methods=['GET'])
@jwt_required()
def view_vacate_logs():
    user_id = get_jwt_identity()

    # Step 1: Get landlord's apartments
    apartments = Apartment.query.filter_by(UserID=user_id).all()
    apartment_ids = [a.ApartmentID for a in apartments]

    # Step 2: Get units in those apartments
    units = RentalUnit.query.filter(RentalUnit.ApartmentID.in_(apartment_ids)).all()
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

#Route for sendign a tenant bill notification sms
@routes.route('/send-bill-notification/<int:bill_id>', methods=['POST'])
@jwt_required()
def send_bill_notification(bill_id):
    user_id = get_jwt_identity()
    landlord = User.query.get(user_id)

    if not landlord or not landlord.IsAdmin:
        return jsonify({"message": "Unauthorized. Only landlords can send notifications."}), 403

    bill = TenantBill.query.get(bill_id)
    if not bill:
        return jsonify({"message": "Bill not found"}), 404

    tenant = Tenant.query.get(bill.TenantID)
    if not tenant or not tenant.Phone:
        return jsonify({"message": "Tenant or phone number not found"}), 404

    # Format the SMS content
    sms_message = (
        f"Dear {tenant.FullName}, your {bill.BillingMonth} bill is KES {bill.TotalAmountDue:.2f}. "
        f"Due by {bill.DueDate.strftime('%d-%b-%Y')}. "
        f"Rent: {bill.RentAmount}, Water: {bill.WaterBill}, "
        f"Electricity: {bill.ElectricityBill}, Internet: {bill.Internet}."
    )

    sms_result = send_sms(tenant.Phone, sms_message)

    if sms_result['success']:
        # Log the SMS sent
        sms_log = SMSUsageLog(
            LandlordID=landlord.UserID,
            TenantID=tenant.TenantID,
            BillID=bill.BillID,
            PhoneNumber=tenant.Phone,
            Message=sms_message,
            CostPerSMS=1.0  # Assume KES 1.0 for now, adjust as needed
        )
        db.session.add(sms_log)
        db.session.commit()

        return jsonify({
            "message": "✅ Bill notification sent successfully.",
            "log": sms_result['response']
        }), 200
    else:
        return jsonify({
            "message": "❌ Failed to send SMS.",
            "error": sms_result['error']
        }), 500
