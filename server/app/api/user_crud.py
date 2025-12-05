from flask import request
from app.extensions import db
from app.models import User
from . import api_bp 
from app.utils import paginate_query
from app.utils.responses import success_response, error_response
from app.utils.auth_decorators import require_auth, require_admin

# API Tạo User mới (Admin only)
# URL: POST /api/users
@api_bp.route('/users', methods=['POST'])
@require_admin
def create_user():
    data = request.get_json()

    if not data or 'email' not in data or 'rfid_uid' not in data:
        return error_response('thieu thong tin email hoac rfid_uid', 'MISSING_FIELDS', 400)

    existing_email = User.query.filter_by(email=data['email']).first()
    if existing_email:
        return error_response('email nay da duoc su dung', 'EMAIL_EXISTS', 409)

    existing_rfid = User.query.filter_by(rfid_uid=data['rfid_uid']).first()
    if existing_rfid:
        return error_response('rfid nay da duoc su dung', 'RFID_EXISTS', 409)

    new_user = User(
        full_name=data.get('full_name', ''),
        email=data['email'],
        rfid_uid=data['rfid_uid'],
        is_admin=data.get('is_admin', False),
        is_active=data.get('is_active', True)
    )

    password = data.get('password', '1')
    new_user.set_password(password)

    try:
        db.session.add(new_user)
        db.session.commit()

        return success_response(
            data=new_user.to_dict(),
            message='tao user thanh cong',
            status_code=201
        )

    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'DATABASE_ERROR', 500)


# API Lấy danh sách Users (Admin only)
# URL: GET /api/users?page=1&per_page=10
@api_bp.route('/users', methods=['GET'])
@require_admin
def get_users():
    query = User.query.order_by(User.created_at.desc())
    result = paginate_query(query, serialize_func=lambda u: u.to_dict(), data_key_name='users')
    return success_response(data=result, message='lay danh sach user thanh cong')


# API Lấy thông tin User theo ID (Admin only)
# URL: GET /api/users/<id>
@api_bp.route('/users/<int:user_id>', methods=['GET'])
@require_admin
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response('user khong ton tai', 'USER_NOT_FOUND', 404)
    
    return success_response(
        data=user.to_dict(),
        message='lay thong tin user thanh cong'
    )


# API Lấy thông tin User theo RFID UID (Admin only)
# URL: GET /api/users/rfid/<rfid_uid>
@api_bp.route('/users/rfid/<string:rfid_uid>', methods=['GET'])
# @require_admin
def get_user_by_rfid(rfid_uid):
    try:
        user = User.query.filter_by(rfid_uid=rfid_uid).first()
        if not user:
            return error_response('user khong ton tai', 'USER_NOT_FOUND', 404)
        
        return success_response(
            data=user.to_dict(),
            message='lay thong tin user thanh cong'
        )
    
    except Exception as e:
        return error_response(str(e), 'DATABASE_ERROR', 500)


# API Lấy thông tin User hiện tại (Get Me)
# URL: GET /api/users/me
@api_bp.route('/users/me', methods=['GET'])
@require_auth
def get_me():
    return success_response(
        data=request.current_user.to_dict(),
        message='lay thong tin user thanh cong'
    )


# API Cập nhật thông tin User hiện tại (Update Me)
# URL: PUT /api/users/me
@api_bp.route('/users/me', methods=['PUT'])
@require_auth
def update_me():
    user = request.current_user
    data = request.get_json()
    
    if not data:
        return error_response('du lieu khong hop le', 'INVALID_DATA', 400)

    new_email = data.get('email')
    new_rfid = data.get('rfid_uid')
    new_full_name = data.get('full_name')

    if new_email:
        existing_email = User.query.filter_by(email=new_email).first()
        if existing_email and existing_email.id != user.id:
            return error_response('email nay da duoc su dung boi user khac', 'EMAIL_EXISTS', 409)
        user.email = new_email

    if new_rfid:
        existing_rfid = User.query.filter_by(rfid_uid=new_rfid).first()
        if existing_rfid and existing_rfid.id != user.id:
            return error_response('rfid nay da duoc su dung boi user khac', 'RFID_EXISTS', 409)
        user.rfid_uid = new_rfid

    if new_full_name:
        user.full_name = new_full_name

    try:
        db.session.commit()
        return success_response(
            data=user.to_dict(),
            message='cap nhat user thanh cong'
        )

    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'DATABASE_ERROR', 500)


# API Xóa User theo ID (Admin only)
# URL: DELETE /api/users/<id>
@api_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response('user khong ton tai', 'USER_NOT_FOUND', 404)

    try:
        db.session.delete(user)
        db.session.commit()
        return success_response(message='xoa user thanh cong')
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'DATABASE_ERROR', 500)


# API Cập nhật User theo ID (Admin only)
# URL: PUT /api/users/<id>
@api_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_admin
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response('user khong ton tai', 'USER_NOT_FOUND', 404)

    data = request.get_json()
    if not data:
        return error_response('du lieu khong hop le', 'INVALID_DATA', 400)

    new_email = data.get('email')
    new_rfid = data.get('rfid_uid')
    new_full_name = data.get('full_name')
    new_is_active = data.get('is_active')
    new_is_admin = data.get('is_admin')

    if new_email:
        existing_email = User.query.filter_by(email=new_email).first()
        if existing_email and existing_email.id != user.id:
            return error_response('email nay da duoc su dung boi user khac', 'EMAIL_EXISTS', 409)
        user.email = new_email

    if new_rfid:
        existing_rfid = User.query.filter_by(rfid_uid=new_rfid).first()
        if existing_rfid and existing_rfid.id != user.id:
            return error_response('rfid nay da duoc su dung boi user khac', 'RFID_EXISTS', 409)
        user.rfid_uid = new_rfid

    if new_full_name:
        user.full_name = new_full_name
    
    if new_is_active is not None:
        user.is_active = new_is_active
    
    if new_is_admin is not None:
        user.is_admin = new_is_admin

    try:
        db.session.commit()
        return success_response(
            data=user.to_dict(),
            message='cap nhat user thanh cong'
        )

    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'DATABASE_ERROR', 500)
