# app/models.py
from .extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

# model User:
# - id: int, primary key
# - full_name: str, not null
# - email: str, unique, not null
# - rfid_uid: str, unique, not null, index
# - created_at: datetime, default now
# - password_hash: str, nullable=True
# - is_active: bool, default True
# - is_admin: bool, default False

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    rfid_uid = db.Column(db.String(50), unique=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    email = db.Column(db.String(100), unique=True, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    # 1. hash password
    password_hash = db.Column(db.String(255), nullable=True) 

    def __repr__(self):
        return f'<User {self.full_name}>'

    # 2. set password (Input: "123456" -> Lưu: "pbkdf2:sha256:...")
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    # 3. check password (Input: "123456" -> Trả về: True/False)
    def check_password(self, password):
        if not self.password_hash:
            return False 
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'rfid_uid': self.rfid_uid,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active,
            'is_admin': self.is_admin
        }


# model Attendance_logs:
# - id: int, primary key
# - rfid_uid: varchar, ID của thẻ RFID
# - timestamp: datetime, thời gian quẹt thẻ
# - device_id: varchar, ID của ESP32 gửi lên
# - code: varchar, mã trạng thái
# - error_code: varchar, mã lỗi
# - created_at: datetime, server time

# model Device:
# - id: int, primary key
# - device_id: varchar, unique, ID của ESP32
# - name: varchar, tên hiển thị của thiết bị
# - is_active: bool, trạng thái hoạt động của thiết bị
# - door_state: varchar, trạng thái cửa (OPEN/CLOSED)
# - rfid_enabled: bool, cho phép quẹt thẻ RFID hay không
# - last_seen: datetime, lần cuối thiết bị gửi data
# - created_at: datetime, thời gian tạo

class Device(db.Model):
    __tablename__ = 'devices'
    
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    # trạng thái cửa: 'OPEN' hoặc 'CLOSED'
    door_state = db.Column(db.String(20), default='CLOSED')
    # cho phép quẹt thẻ rfid hay không
    rfid_enabled = db.Column(db.Boolean, default=True)
    last_seen = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    def __repr__(self):
        return f'<Device {self.device_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'device_id': self.device_id,
            'name': self.name,
            'is_active': self.is_active,
            'door_state': self.door_state,
            'rfid_enabled': self.rfid_enabled,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Attendance_logs(db.Model):
    __tablename__ = 'attendance_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    rfid_uid = db.Column(db.String(50), nullable=False, index=True)  
    timestamp = db.Column(db.DateTime, nullable=False, index=True)
    device_id = db.Column(db.String(100))
    code = db.Column(db.String(30))
    error_code = db.Column(db.String(30), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'rfid_uid': self.rfid_uid,
            'timestamp': self.timestamp.isoformat(),
            'device_id': self.device_id,
            'code': self.code, # 'REALTIME', 'OFFLINE_SYNC'
            'error_code': self.error_code, # 'USER_NOT_FOUND', 'USER_FORBIDDEN', 'UNKNOWN_ERROR'
            'created_at': self.created_at.isoformat()
        }
