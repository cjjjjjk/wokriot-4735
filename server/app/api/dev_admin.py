from flask import jsonify
from app.extensions import db
from app.models import User
from . import api_bp
from app.utils.responses import success_response, error_response

# dev api: create default admin user
# URL: GET /api/dev/create-admin
@api_bp.route('/dev/create-admin', methods=['GET'])
def create_admin():
    admin_email = "admin"
    
    existing_admin = User.query.filter_by(email=admin_email).first()
    if existing_admin:
        return error_response('admin account da ton tai', 'ADMIN_EXISTS', 409)
    
    admin_user = User(
        full_name='Administrator',
        email=admin_email,
        rfid_uid='admin_rfid',
        is_admin=True,
        is_active=True
    )
    admin_user.set_password('1')
    
    try:
        db.session.add(admin_user)
        db.session.commit()
        
        return success_response(
            data={
                'id': admin_user.id,
                'email': admin_user.email,
                'full_name': admin_user.full_name,
                'is_admin': admin_user.is_admin,
                'is_active': admin_user.is_active,
                'password': '1'
            },
            message='tao admin account thanh cong',
            status_code=201
        )
    
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'DATABASE_ERROR', 500)
