from datetime import datetime, timedelta
from app.models import Attendance_logs
from app.extensions import db


def calculate_work_day_data(date, rfid_uid):
    """
    tính toán thông tin làm việc trong ngày cho 1 nhân viên
    
    args:
        date: datetime.date hoặc datetime object - ngày cần tính toán
        rfid_uid: str - rfid uid của nhân viên
    
    returns:
        dict với các field:
        - times: list of tuples (time_stamp "HH:MM", code)
        - total_times: float - tổng số giờ làm việc
        - type: int - 0/0.5/1 (0.5 nếu <6.5h, 1 nếu >=6.5h, 0 còn lại)
        - ot_times: list of tuples - các entry sau 18:00
    """
    try:
        # chuyển date thành datetime nếu cần
        if isinstance(date, datetime):
            target_date = date.date()
        else:
            target_date = date
        
        # tạo datetime range cho ngày
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())
        
        # query tất cả attendance logs của user trong ngày
        logs = Attendance_logs.query.filter(
            Attendance_logs.rfid_uid == rfid_uid,
            Attendance_logs.timestamp >= start_datetime,
            Attendance_logs.timestamp <= end_datetime
        ).order_by(Attendance_logs.timestamp.asc()).all()
        
        # nếu không có log, trả về dữ liệu rỗng
        if not logs:
            print('Empty logs')
            return {
                'times': [],
                'total_times': 0.0,
                'type': 0,
                'ot_times': []
            }
        
        # tạo times list
        times = []
        for log in logs:
            time_str = log.timestamp.strftime('%H:%M')
            # nếu có error_code thì dùng error_code, ngược lại dùng "SUCCESS"
            code = log.error_code if log.error_code else 'SUCCESS'
            times.append((time_str, code))
        
        # tính total_times theo pattern in->out->in->out
        # chỉ tính các cặp có code = "SUCCESS"
        total_times = 0.0
        success_logs = [log for log in logs if not log.error_code]
        
        # xử lý theo cặp: index 0,1 là in-out, 2,3 là in-out, ...
        for i in range(0, len(success_logs) - 1, 2):
            in_time = success_logs[i].timestamp
            out_time = success_logs[i + 1].timestamp
            
            # tính số giờ làm việc (difference in hours)
            time_diff = out_time - in_time
            hours = time_diff.total_seconds() / 3600.0
            total_times += hours
        
        # xác định type
        if total_times >= 6.5:
            work_type = 1
        elif total_times > 0 and total_times < 6.5:
            work_type = 0.5
        else:
            work_type = 0
        
        # tính ot_times - chỉ lấy các entry sau 18:00
        ot_times = []
        for log in logs:
            if log.timestamp.hour >= 18:
                time_str = log.timestamp.strftime('%H:%M')
                code = log.error_code if log.error_code else 'SUCCESS'
                ot_times.append((time_str, code))
        
        return {
            'times': times,
            'total_times': round(total_times, 2),
            'type': work_type,
            'ot_times': ot_times
        }
    
    except Exception as e:
        # nếu có lỗi, trả về dữ liệu mặc định
        print(f'error calculating work day data: {e}')
        return {
            'times': [],
            'total_times': 0.0,
            'type': 0,
            'ot_times': []
        }
