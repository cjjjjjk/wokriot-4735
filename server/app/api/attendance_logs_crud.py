from flask import request
from app.extensions import db
from app.models import Attendance_logs
from . import api_bp
from app.utils import paginate_query
from app.utils.responses import success_response, error_response
from app.utils.auth_decorators import require_auth, require_admin
from datetime import datetime

# create new attendance log
# URL: POST /api/attendance-logs
@api_bp.route('/attendance-logs', methods=['POST'])
@require_auth
def create_attendance_log():
    try:
        data = request.get_json()

        if not data or 'rfid_uid' not in data or 'timestamp' not in data:
            return error_response('thieu thong tin rfid_uid hoac timestamp', 'MISSING_FIELDS', 400)

        timestamp_str = data['timestamp']
        try:
            timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        except ValueError:
            return error_response('dinh dang timestamp khong hop le', 'INVALID_TIMESTAMP', 400)

        new_log = Attendance_logs(
            rfid_uid=data['rfid_uid'],
            timestamp=timestamp,
            device_id=data.get('device_id'),
            code=data.get('code')
        )

        db.session.add(new_log)
        db.session.commit()

        return success_response(
            data=new_log.to_dict(),
            message='tao attendance log thanh cong',
            status_code=201
        )

    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'DATABASE_ERROR', 500)


# get list of attendance logs with pagination
# URL: GET /api/attendance-logs?page=1&per_page=10&rfid_uid=xxx
@api_bp.route('/attendance-logs', methods=['GET'])
@require_admin
def get_attendance_logs():
    query = Attendance_logs.query.order_by(Attendance_logs.timestamp.desc())
    
    rfid_uid = request.args.get('rfid_uid')
    if rfid_uid:
        query = query.filter_by(rfid_uid=rfid_uid)
    
    device_id = request.args.get('device_id')
    if device_id:
        query = query.filter_by(device_id=device_id)
    
    result = paginate_query(query, serialize_func=lambda log: log.to_dict(), data_key_name='attendance_logs')
    return success_response(data=result, message='lay danh sach attendance logs thanh cong')


# get attendance log by ID
# URL: GET /api/attendance-logs/<id>
@api_bp.route('/attendance-logs/<int:log_id>', methods=['GET'])
@require_admin
def get_attendance_log(log_id):
    log = Attendance_logs.query.get(log_id)
    if not log:
        return error_response('attendance log khong ton tai', 'LOG_NOT_FOUND', 404)
    
    return success_response(
        data=log.to_dict(),
        message='lay thong tin attendance log thanh cong'
    )


# update attendance log by ID
# URL: PUT /api/attendance-logs/<id>
@api_bp.route('/attendance-logs/<int:log_id>', methods=['PUT'])
@require_admin
def update_attendance_log(log_id):
    try:
        log = Attendance_logs.query.get(log_id)
        if not log:
            return error_response('attendance log khong ton tai', 'LOG_NOT_FOUND', 404)

        data = request.get_json()
        if not data:
            return error_response('du lieu khong hop le', 'INVALID_DATA', 400)

        if 'rfid_uid' in data:
            log.rfid_uid = data['rfid_uid']
        
        if 'timestamp' in data:
            try:
                log.timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            except ValueError:
                return error_response('dinh dang timestamp khong hop le', 'INVALID_TIMESTAMP', 400)
        
        if 'device_id' in data:
            log.device_id = data['device_id']
        
        if 'code' in data:
            log.code = data['code']

        db.session.commit()
        return success_response(
            data=log.to_dict(),
            message='cap nhat attendance log thanh cong'
        )

    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'DATABASE_ERROR', 500)


# delete attendance log by ID
# URL: DELETE /api/attendance-logs/<id>
@api_bp.route('/attendance-logs/<int:log_id>', methods=['DELETE'])
@require_admin
def delete_attendance_log(log_id):
    try:
        log = Attendance_logs.query.get(log_id)
        if not log:
            return error_response('attendance log khong ton tai', 'LOG_NOT_FOUND', 404)

        db.session.delete(log)
        db.session.commit()
        return success_response(message='xoa attendance log thanh cong')
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 'DATABASE_ERROR', 500)


# get my attendance logs (current user)
# URL: GET /api/attendance-logs/me?day=2025-12-04&month=2025-12&page=1&per_page=10
@api_bp.route('/attendance-logs/me', methods=['GET'])
@require_auth
def get_my_attendance_logs():
    try:
        current_user = request.current_user
        query = Attendance_logs.query.filter_by(rfid_uid=current_user.rfid_uid)
        
        # filter by day (format: YYYY-MM-DD)
        day = request.args.get('day')
        if day:
            try:
                day_date = datetime.strptime(day, '%Y-%m-%d').date()
                query = query.filter(
                    db.func.date(Attendance_logs.timestamp) == day_date
                )
            except ValueError:
                return error_response('dinh dang ngay khong hop le, su dung YYYY-MM-DD', 'INVALID_DAY_FORMAT', 400)
        
        # filter by month (format: YYYY-MM)
        month = request.args.get('month')
        if month:
            try:
                month_date = datetime.strptime(month, '%Y-%m')
                year = month_date.year
                month_num = month_date.month
                query = query.filter(
                    db.extract('year', Attendance_logs.timestamp) == year,
                    db.extract('month', Attendance_logs.timestamp) == month_num
                )
            except ValueError:
                return error_response('dinh dang thang khong hop le, su dung YYYY-MM', 'INVALID_MONTH_FORMAT', 400)
        
        query = query.order_by(Attendance_logs.timestamp.desc())
        
        result = paginate_query(query, serialize_func=lambda log: log.to_dict(), data_key_name='attendance_logs')
        return success_response(data=result, message='lay danh sach attendance logs cua ban thanh cong')
    
    except Exception as e:
        return error_response(str(e), 'QUERY_ERROR', 500)


# get filtered attendance logs
# URL: GET /api/attendance-logs/filter?day=2025-12-04&month=2025-12&rfid_uid=xxx&device_id=xxx&page=1&per_page=10
@api_bp.route('/attendance-logs/filter', methods=['GET'])
@require_admin
def get_filtered_attendance_logs():
    try:
        query = Attendance_logs.query
        
        # filter by day (format: YYYY-MM-DD)
        day = request.args.get('day')
        if day:
            try:
                day_date = datetime.strptime(day, '%Y-%m-%d').date()
                # filter for records on this specific day
                query = query.filter(
                    db.func.date(Attendance_logs.timestamp) == day_date
                )
            except ValueError:
                return error_response('dinh dang ngay khong hop le, su dung YYYY-MM-DD', 'INVALID_DAY_FORMAT', 400)
        
        # filter by month (format: YYYY-MM)
        month = request.args.get('month')
        if month:
            try:
                month_date = datetime.strptime(month, '%Y-%m')
                year = month_date.year
                month_num = month_date.month
                # filter for records in this specific month
                query = query.filter(
                    db.extract('year', Attendance_logs.timestamp) == year,
                    db.extract('month', Attendance_logs.timestamp) == month_num
                )
            except ValueError:
                return error_response('dinh dang thang khong hop le, su dung YYYY-MM', 'INVALID_MONTH_FORMAT', 400)
        
        # filter by rfid_uid
        rfid_uid = request.args.get('rfid_uid')
        if rfid_uid:
            query = query.filter_by(rfid_uid=rfid_uid)
        
        # filter by device_id
        device_id = request.args.get('device_id')
        if device_id:
            query = query.filter_by(device_id=device_id)
        
        # order by timestamp descending
        query = query.order_by(Attendance_logs.timestamp.desc())
        
        result = paginate_query(query, serialize_func=lambda log: log.to_dict(), data_key_name='attendance_logs')
        return success_response(data=result, message='lay danh sach attendance logs thanh cong')
    
    except Exception as e:
        return error_response(str(e), 'FILTER_ERROR', 500)
