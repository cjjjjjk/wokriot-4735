from flask import Blueprint

# Tạo Blueprint tên là 'api'
api_bp = Blueprint('api', __name__)

# Import routes để Flask biết các đường dẫn tồn tại
from . import user_crud, auth, dev_admin, attendance_logs_crud, mqtt_handlers, work_day_handler