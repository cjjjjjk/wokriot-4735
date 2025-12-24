from flask import request
from datetime import datetime, date
from calendar import monthrange
from app.extensions import db
from . import api_bp
from app.utils.responses import success_response, error_response
from app.utils.auth_decorators import require_auth
from app.utils.work_day_calculator import calculate_work_day_data


# get worked days by month for current user
# URL: GET /api/worked-day/month?month=YYYY-MM
@api_bp.route('/worked-day/month', methods=['GET'])
@require_auth
def get_worked_days_by_month():
    """
    get worked days by month for current user
    ---
    tags:
      - Work Day Calculation
    security:
      - Bearer: []
    parameters:
      - in: query
        name: month
        type: string
        description: "month to query (YYYY-MM), defaults to current month"
        example: "2025-12"
    responses:
      200:
        description: work day data retrieved successfully
        schema:
          type: object
          properties:
            is_success:
              type: boolean
              example: true
            message:
              type: string
            data:
              type: object
              properties:
                month:
                  type: string
                  example: "2025-12"
                worked_days:
                  type: array
                  items:
                    type: object
                    properties:
                      date:
                        type: string
                        example: "2025-12-01"
                      times:
                        type: array
                        description: "list of check-in/out times with status"
                        items:
                          type: array
                          example: ["08:00", "SUCCESS"]
                      total_times:
                        type: number
                        example: 8.5
                        description: "total work hours"
                      type:
                        type: number
                        example: 1
                        description: "1: full day (>=6.5h), 0.5: half day (<6.5h), 0: absent"
                      ot_times:
                        type: array
                        description: "overtime entries after 18:00"
                        items:
                          type: array
                          example: ["18:30", "SUCCESS"]
      400:
        description: invalid month format
      401:
        description: unauthorized
    """
    # lấy danh sách thông tin làm việc theo tháng cho user hiện tại
    # nếu không có month param, dùng tháng hiện tại
    # nếu là tháng hiện tại: trả về từ ngày 1 đến ngày hiện tại
    # nếu là tháng khác: trả về từ ngày 1 đến ngày cuối tháng
    try:
        # lấy current user từ request
        current_user = request.current_user
        rfid_uid = current_user.rfid_uid
        
        # lấy month parameter hoặc dùng tháng hiện tại
        month_str = request.args.get('month')
        
        if month_str:
            # parse month string (YYYY-MM)
            try:
                target_date = datetime.strptime(month_str, '%Y-%m')
                target_year = target_date.year
                target_month = target_date.month
            except ValueError:
                return error_response('dinh dang month khong hop le, su dung YYYY-MM', 'INVALID_FORMAT', 400)
        else:
            # dùng tháng hiện tại
            now = datetime.now()
            target_year = now.year
            target_month = now.month
        
        # xác định ngày bắt đầu và kết thúc
        start_day = 1
        
        # kiểm tra xem có phải tháng hiện tại không
        now = datetime.now()
        is_current_month = (target_year == now.year and target_month == now.month)
        
        if is_current_month:
            # nếu là tháng hiện tại, chỉ lấy đến ngày hiện tại
            end_day = now.day
        else:
            # nếu là tháng khác, lấy đến ngày cuối tháng
            _, end_day = monthrange(target_year, target_month)
        
        # tính toán work data cho mỗi ngày
        worked_days = []
        for day in range(start_day, end_day + 1):
            current_date = date(target_year, target_month, day)
            work_data = calculate_work_day_data(current_date, rfid_uid)
            
            # thêm field date vào kết quả
            work_data['date'] = current_date.strftime('%Y-%m-%d')
            worked_days.append(work_data)
        
        return success_response(
            data={
                'month': f'{target_year}-{target_month:02d}',
                'worked_days': worked_days
            },
            message=f'lay thong tin lam viec theo {target_month:02d}-{target_year} thanh cong'
        )
    
    except Exception as e:
        return error_response(str(e), 'SERVER_ERROR', 500)


# get worked day for a single day
# URL: GET /api/worked-day/day?date=YYYY-MM-DD
@api_bp.route('/worked-day/day', methods=['GET'])
@require_auth
def get_worked_day_single():
    """
    get work day information for a single day
    ---
    tags:
      - Work Day Calculation
    security:
      - Bearer: []
    parameters:
      - in: query
        name: date
        type: string
        description: "date to query (YYYY-MM-DD), defaults to current date"
        example: "2025-12-24"
    responses:
      200:
        description: work day data retrieved successfully
        schema:
          type: object
          properties:
            is_success:
              type: boolean
              example: true
            message:
              type: string
            data:
              type: object
              properties:
                date:
                  type: string
                  example: "2025-12-24"
                times:
                  type: array
                  description: "list of all check-in/out times with status"
                  items:
                    type: array
                    example: ["08:00", "SUCCESS"]
                total_times:
                  type: number
                  example: 8.5
                  description: "total work hours calculated from in-out pairs"
                type:
                  type: number
                  example: 1
                  description: "1: full day (>=6.5h), 0.5: half day (<6.5h), 0: absent"
                ot_times:
                  type: array
                  description: "overtime entries after 18:00"
                  items:
                    type: array
                    example: ["18:30", "SUCCESS"]
      400:
        description: invalid date format
      401:
        description: unauthorized
    """
    # lấy thông tin làm việc của 1 ngày cho user hiện tại
    # nếu không có date param, dùng ngày hiện tại
    try:
        # lấy current user từ request
        current_user = request.current_user
        rfid_uid = current_user.rfid_uid
        
        # lấy date parameter hoặc dùng ngày hiện tại
        date_str = request.args.get('date')
        
        if date_str:
            # parse date string (YYYY-MM-DD)
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return error_response('dinh dang date khong hop le, su dung YYYY-MM-DD', 'INVALID_FORMAT', 400)
        else:
            # dùng ngày hiện tại
            target_date = datetime.now().date()
        
        # tính toán work data cho ngày
        work_data = calculate_work_day_data(target_date, rfid_uid)
        
        # thêm field date vào kết quả
        work_data['date'] = target_date.strftime('%Y-%m-%d')
        
        return success_response(
            data=work_data,
            message='lay thong tin lam viec thanh cong'
        )
    
    except Exception as e:
        return error_response(str(e), 'SERVER_ERROR', 500)
