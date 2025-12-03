from flask import request
from app.extensions import db
from app.models import User
from . import api_bp 
from app.utils import paginate_query
from app.utils.responses import success_response, error_response

# API Tạo User mới
# URL: POST /api/users
@api_bp.route('/users', methods=['POST'])
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
        rfid_uid=data['rfid_uid']
    )

    password = data.get('password', '1')
    new_user.set_password(password)

    try:
        db.session.add(new_user)
        db.session.commit()

        return success_response(
            data={
                'id': new_user.id,
                'full_name': new_user.full_name,
                'email': new_user.email,
                'rfid_uid': new_user.rfid_uid,
                'created_at': new_user.created_at.isoformat() if new_user.created_at else None
            },
            message='tao user thanh cong',
            status_code=201
        )

    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'DATABASE_ERROR', 500)


# API Lấy danh sách Users
# URL: GET /api/users?page=1&per_page=10
@api_bp.route('/users', methods=['GET'])
def get_users():
    query = User.query.order_by(User.created_at.desc())
    result = paginate_query(query, serialize_func=lambda u: u.to_dict(), data_key_name='users')
    return success_response(data=result, message='lay danh sach user thanh cong')


# API Lấy thông tin User theo ID
# URL: GET /api/users/<id>
@api_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response('user khong ton tai', 'USER_NOT_FOUND', 404)
    
    return success_response(
        data={
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'rfid_uid': user.rfid_uid,
            'created_at': user.created_at.isoformat() if user.created_at else None
        },
        message='lay thong tin user thanh cong'
    )


# API Xóa User theo ID
# URL: DELETE /api/users/<id>
@api_bp.route('/users/<int:user_id>', methods=['DELETE'])
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


# API Cập nhật User
# URL: PUT /api/users/<id>
@api_bp.route('/users/<int:user_id>', methods=['PUT'])
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
            data={
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email,
                'rfid_uid': user.rfid_uid,
                'created_at': user.created_at.isoformat() if user.created_at else None
            },
            message='cap nhat user thanh cong'
        )

    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'DATABASE_ERROR', 500)
