from flask import request, current_app
from flasgger import swag_from
from app.extensions import db
from app.models import User
from . import api_bp
from app.utils.responses import success_response, error_response
import jwt
from datetime import datetime, timedelta

def generate_token(user):
    payload = {
        'id': user.id,
        'email': user.email,
        'full_name': user.full_name,
        'rfid_uid': user.rfid_uid,
        'exp': datetime.utcnow() + timedelta(hours=current_app.config['JWT_EXPIRATION_HOURS']),
        'iat': datetime.utcnow()
    }
    token = jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    return token

# login api
# URL: POST /api/login
@api_bp.route('/login', methods=['POST'])
def login():
    """
    user login endpoint
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: "admin@gmail.com"
            password:
              type: string
              example: "1"
    responses:
      200:
        description: login successful
        schema:
          type: object
          properties:
            is_success:
              type: boolean
              example: true
            message:
              type: string
              example: "dang nhap thanh cong"
            data:
              type: object
              properties:
                token:
                  type: string
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                user:
                  type: object
                  properties:
                    id:
                      type: integer
                      example: 1
                    email:
                      type: string
                      example: "admin@gmail.com"
                    full_name:
                      type: string
                      example: "Administrator"
                    rfid_uid:
                      type: string
                      example: "ADMIN001"
                    is_admin:
                      type: boolean
                      example: true
                    is_active:
                      type: boolean
                      example: true
      400:
        description: missing required fields
      401:
        description: invalid credentials
    """
    data = request.get_json()

    if not data or 'email' not in data or 'password' not in data:
        return error_response('thieu thong tin email hoac password', 'MISSING_FIELDS', 400)

    user = User.query.filter_by(email=data['email']).first()

    if not user or not user.check_password(data['password']):
        return error_response('email hoac password khong dung', 'INVALID_CREDENTIALS', 401)

    token = generate_token(user)

    return success_response(
        data={
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'rfid_uid': user.rfid_uid,
                'is_admin': user.is_admin,
                'is_active': user.is_active
            }
        },
        message='dang nhap thanh cong',
        status_code=200
    )
