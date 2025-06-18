from flask import Blueprint, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from models.models import db, User  # ✅ note: models.models

routes = Blueprint('routes', __name__)
CORS(routes)

bcrypt = Bcrypt()

@routes.route('/register', methods=['POST'])
def register_landlord():
    data = request.get_json()
    full_name = data.get('full_name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')

    if not all([full_name, email, password]):
        return jsonify({'message': 'Full name, email, and password are required'}), 400

    if User.query.filter_by(Email=email).first():
        return jsonify({'message': 'Email is already registered'}), 409

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

    return jsonify({'message': 'Landlord account created successfully!'}), 201
