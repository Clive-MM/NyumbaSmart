from flask import Blueprint, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
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
