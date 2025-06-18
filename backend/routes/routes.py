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
from models.models import db, User  
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