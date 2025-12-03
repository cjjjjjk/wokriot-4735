from flask import request, jsonify
from app.extensions import db
from app.models import User
from . import api_bp 
from app.utils import paginate_query 

# API Tạo User mới (Test Ghi DB)
# URL: POST /api/users
@api_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()

    # 1. Validate dữ liệu đầu vào
    if not data or 'full_name' not in data or 'rfid_uid' not in data:
        return jsonify({'error': 'Thieu thong tin full_name hoac rfid_uid'}), 400

    # 2. Kiểm tra xem RFID đã tồn tại chưa (tránh lỗi Duplicate Entry)
    existing_user = User.query.filter_by(rfid_uid=data['rfid_uid']).first()
    if existing_user:
        return jsonify({'error': 'RFID nay da duoc su dung'}), 409

    # 3. Tạo đối tượng User mới
    new_user = User(
        full_name=data['full_name'],
        rfid_uid=data['rfid_uid']
    )

    try:
        # 4. Ghi vào Database
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'message': 'Tao user thanh cong',
            'user': {
                'id': new_user.id,
                'full_name': new_user.full_name,
                'rfid_uid': new_user.rfid_uid,
                'created_at': new_user.created_at
            }
        }), 201

    except Exception as e:
        db.session.rollback() # Hoàn tác nếu lỗi
        return jsonify({'error': str(e)}), 500

# API Lấy danh sách Users
# URL: GET /api/users?page=1&per_page=10
@api_bp.route('/users', methods=['GET'])
def get_users():
    query = User.query.order_by(User.created_at.desc())
    return jsonify(paginate_query(query, serialize_func=lambda u: u.to_dict())), 200

# API Lấy thông tin User theo ID
# URL: GET /api/users/<id>
@api_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User khong ton tai'}), 404
    
    return jsonify({
        'id': user.id,
        'full_name': user.full_name,
        'rfid_uid': user.rfid_uid,
        'created_at': user.created_at
    }), 200

# API Xóa User theo ID
# URL: DELETE /api/users/<id>
@api_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User khong ton tai'}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'Xoa user thanh cong'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# API Cập nhật RFID cho User theo ID
# URL: PUT /api/users/<id>
@api_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User khong ton tai'}), 404

    data = request.get_json()
    if not data or 'rfid_uid' not in data:
        return jsonify({'error': 'Thieu thong tin rfid_uid'}), 400

    new_rfid = data['rfid_uid']

    # Kiểm tra xem RFID mới có bị trùng với user khác không
    existing_user = User.query.filter_by(rfid_uid=new_rfid).first()
    if existing_user and existing_user.id != user.id:
        return jsonify({'error': 'RFID nay da duoc su dung boi user khac'}), 409

    try:
        user.rfid_uid = new_rfid
        db.session.commit()
        
        return jsonify({
            'message': 'Cap nhat user thanh cong',
            'user': {
                'id': user.id,
                'full_name': user.full_name,
                'rfid_uid': user.rfid_uid,
                'created_at': user.created_at
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500