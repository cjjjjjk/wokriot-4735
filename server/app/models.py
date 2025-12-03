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
            'created_at': self.created_at.isoformat() if self.created_at else None
        }