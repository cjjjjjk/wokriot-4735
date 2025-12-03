from functools import wraps
from flask import request
from app.models import User
from app.utils.responses import error_response
from flask import current_app
import jwt

def get_token_from_header():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return None
    
    return parts[1]

def decode_token(token):
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_header()
        if not token:
            return error_response('token khong ton tai', 'MISSING_TOKEN', 401)
        
        payload = decode_token(token)
        if not payload:
            return error_response('token khong hop le hoac da het han', 'INVALID_TOKEN', 401)
        
        user = User.query.get(payload.get('id'))
        if not user:
            return error_response('user khong ton tai', 'USER_NOT_FOUND', 401)
        
        if not user.is_active:
            return error_response('tai khoan da bi vo hieu hoa', 'ACCOUNT_INACTIVE', 403)
        
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_header()
        if not token:
            return error_response('token khong ton tai', 'MISSING_TOKEN', 401)
        
        payload = decode_token(token)
        if not payload:
            return error_response('token khong hop le hoac da het han', 'INVALID_TOKEN', 401)
        
        user = User.query.get(payload.get('id'))
        if not user:
            return error_response('user khong ton tai', 'USER_NOT_FOUND', 401)
        
        if not user.is_active:
            return error_response('tai khoan da bi vo hieu hoa', 'ACCOUNT_INACTIVE', 403)
        
        if not user.is_admin:
            return error_response('ban khong co quyen truy cap', 'FORBIDDEN', 403)
        
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function
