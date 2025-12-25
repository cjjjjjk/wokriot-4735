## flask | mysql
*Note: dev-mode show env file*

### quick start với docker (khuyên dùng)
```bash
cd server
docker compose up --build
```
sau khi chạy xong:
- **api documentation (swagger ui)**: http://localhost:5000/apidocs
- **api base url**: http://localhost:5000/api
- **mysql**: localhost:3306

### setup thủ công (development)
1. install dependencies:
   - tạo sandbox: `python -m venv venv`
   - active sandbox: `venv\Scripts\activate`
   - cài đặt dependencies: `pip install -r requirements.txt`
2. setup docker mysql db
   `docker-compose up -d`
3. setup db:
   - áp dụng db migrated: `flask db upgrade` 
   - các thao tác migration:
      - tạo migration: `flask db migrate -m "migration mesage"`
      - áp dụng migration cho db: `flask db upgrade`

4. run server:
   `python app.py`

### api documentation
server tích hợp **swagger ui** để hiển thị và test các api endpoints:
- **url**: http://localhost:5000/apidocs hoặc http://localhost:5000/
- **features**:
  - xem tất cả api endpoints
  - test api trực tiếp trên browser
  - xem request/response schema
  - hỗ trợ jwt authentication (click "Authorize" button và nhập: `Bearer <token>`)

### mô tả hệ thống:

#### database models:
1. **users table**:
   - `id`: int, primary key
   - `full_name`: str, not null
   - `email`: str, unique, not null
   - `rfid_uid`: str, unique, not null, indexed
   - `password_hash`: str, nullable
   - `is_active`: bool, default true
   - `is_admin`: bool, default false
   - `created_at`: datetime, server default now

2. **attendance_logs table**:
   - `id`: int, primary key
   - `rfid_uid`: varchar, indexed
   - `timestamp`: datetime, thời gian quẹt thẻ, indexed
   - `device_id`: varchar, ID của ESP32
   - `code`: varchar(30), mã trạng thái ('REALTIME', 'OFFLINE_SYNC')
   - `error_code`: varchar(30), nullable ('USER_NOT_FOUND', 'USER_NOT_ACTIVE', 'UNKNOWN_ERROR')
   - `created_at`: datetime, server time

#### authentication & authorization:
- sử dụng JWT (json web token) để xác thực
- JWT expiration: cấu hình trong JWT_EXPIRATION_HOURS
- 2 loại role: admin và user
- phân quyền:
  - admin: có thể quản lý users, truy cập tất cả attendance logs
  - user: chỉ có thể xem thông tin cá nhân và attendance logs của mình

#### mqtt integration:
- subscribe topic: `esp32/+/attendance` (wildcard '+' cho dynamic device ID)
- publish topic: `esp32/<device_id>/response`
- tự động lưu attendance logs khi nhận message từ ESP32
- kiểm tra user tồn tại và active status
- publish response về ESP32 với thông tin user hoặc error code

### apis triển khai:

#### 1. authentication
- **`POST`** `/api/login`: đăng nhập
   - body: `{ "email": "_", "password": "_" }`
   - response: jwt token và thông tin user

#### 2. development helpers
- **`GET`** `/api/dev/create-admin`: tạo nhanh tài khoản admin mặc định
   - email: "admin", password: "1"

#### 3. user management (crud)
- **`POST`** `/api/users`: tạo user mới (admin only, password mặc định: "1")
   - body: `{ "rfid_uid": "_", "email": "_", "full_name": "_", "is_admin": false, "is_active": true }`
   
- **`GET`** `/api/users?page=1&per_page=10`: lấy danh sách users với pagination (admin only)
   
- **`GET`** `/api/users/<id>`: lấy thông tin user theo id (admin only)
   
- **`GET`** `/api/users/rfid/<rfid_uid>`: lấy thông tin user theo rfid uid (public)
   
- **`GET`** `/api/users/me`: lấy thông tin user hiện tại (authenticated)
   
- **`PUT`** `/api/users/me`: cập nhật thông tin user hiện tại (authenticated)
   - body: `{ "full_name": "_", "email": "_", "rfid_uid": "_" }`
   
- **`PUT`** `/api/users/<id>`: cập nhật user theo id (admin only)
   - body: `{ "full_name": "_", "email": "_", "rfid_uid": "_", "is_active": true, "is_admin": false }`
   
- **`DELETE`** `/api/users/<id>`: xóa user theo id (admin only)

#### 4. attendance logs management (crud)
- **`POST`** `/api/attendance-logs`: tạo attendance log mới (admin only)
   - body: `{ "rfid_uid": "_", "timestamp": "2025-12-04T10:30:00", "device_id": "_", "code": "REALTIME" }`
   
- **`GET`** `/api/attendance-logs?page=1&per_page=10&rfid_uid=xxx`: lấy danh sách logs với pagination (admin only)
   
- **`GET`** `/api/attendance-logs/<id>`: lấy log theo id (admin only)
   
- **`GET`** `/api/attendance-logs/me?day=2025-12-04&month=2025-12&page=1&per_page=10`: lấy logs của user hiện tại (authenticated)
   - query params: `day` (YYYY-MM-DD), `month` (YYYY-MM), `page`, `per_page`
   
- **`GET`** `/api/attendance-logs/filter?day=2025-12-04&month=2025-12&rfid_uid=xxx&device_id=xxx`: lọc logs theo nhiều tiêu chí (admin only)
   - query params: `day`, `month`, `rfid_uid`, `device_id`, `page`, `per_page`
   
- **`PUT`** `/api/attendance-logs/<id>`: cập nhật log theo id (admin only)
   - body: `{ "rfid_uid": "_", "timestamp": "_", "device_id": "_", "code": "_", "error_code": "_" }`
   
- **`DELETE`** `/api/attendance-logs/<id>`: xóa log theo id (admin only)

#### 5. mqtt handlers (real-time)
- **topic subscribe**: `esp32/+/attendance`
  - nhận data từ các ESP32 devices
  - format: `{ "rfid_uid": "_", "timestamp": "_", "code": "REALTIME" }`
  
- **topic publish**: `esp32/<device_id>/response`
  - gửi phản hồi về ESP32 sau khi xử lý
  - format: `{ "is_success": true, "user_id": 1, "user_name": "_", "rfid_uid": "_", "error_code": null, "time_stamp": "10:30" }`
  - error_codes: "USER_NOT_FOUND", "USER_NOT_ACTIVE"
  
- **xử lý tự động**:
  - kiểm tra user tồn tại
  - kiểm tra user active status
  - lưu attendance log vào database
  - publish response về ESP32 với kết quả

#### 6. worked day calculation
- **`GET`** `/api/worked-day/month?month=YYYY-MM`: lấy thông tin làm việc theo tháng (authenticated)
   - query params: `month` (YYYY-MM, optional - mặc định tháng hiện tại)
   - nếu là tháng hiện tại: trả về từ đầu tháng đến ngày hiện tại
   - nếu là tháng khác: trả về từ đầu tháng đến cuối tháng
   - response: 
     ```json
     {
       "month": "2025-12",
       "worked_days": [
         {
           "date": "2025-12-01",
           "times": [["08:00", "SUCCESS"], ["12:00", "SUCCESS"], ["13:00", "SUCCESS"], ["17:30", "SUCCESS"]],
           "total_times": 8.5,
           "type": 1,
           "ot_times": [["18:30", "SUCCESS"], ["20:00", "SUCCESS"]]
         }
       ]
     }
     ```
   
- **`GET`** `/api/worked-day/day?date=YYYY-MM-DD`: lấy thông tin làm việc của 1 ngày (authenticated)
   - query params: `date` (YYYY-MM-DD, optional - mặc định ngày hiện tại)
   - response:
     ```json
     {
       "date": "2025-12-04",
       "times": [["08:00", "SUCCESS"], ["12:00", "SUCCESS"], ["13:00", "SUCCESS"], ["17:30", "SUCCESS"]],
       "total_times": 8.5,
       "type": 1,
       "ot_times": [["18:30", "SUCCESS"], ["20:00", "SUCCESS"]]
     }
     ```

**work data fields:**
- `times`: list tất cả các timestamp và code trong ngày `[["HH:MM", "SUCCESS"|"ERROR_CODE"], ...]`
- `total_times`: float - tổng số giờ làm việc (tính theo pattern in->out->in->out, chỉ tính các entry SUCCESS)
- `type`: int - loại ngày làm việc
  - `1`: làm đủ (>= 6.5 giờ)
  - `0.5`: làm nửa (< 6.5 giờ)
  - `0`: nghỉ
- `ot_times`: list các entry sau 18:00 (overtime) `[["HH:MM", "SUCCESS"|"ERROR_CODE"], ...]`

