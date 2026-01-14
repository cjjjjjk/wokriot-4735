from flask import Blueprint

# Tạo Blueprint tên là 'api'
api_bp = Blueprint('api', __name__)

# Import routes 
from . import user_crud, auth, dev_admin, attendance_logs_crud, mqtt_handlers, mqtt_info, work_day_handler, device_control