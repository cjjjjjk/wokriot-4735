from .extensions import db

# model User:
# - id: int, primary key
# - full_name: str, not null
# - rfid_uid: str, unique, not null, index
# - created_at: datetime, default now
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    rfid_uid = db.Column(db.String(50), unique=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f'<User {self.full_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'rfid_uid': self.rfid_uid,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }