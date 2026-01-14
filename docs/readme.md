# **WOKRIOT-4735** | Hệ thống Chấm công IoT

## 1. Tổng quan

Hệ thống chấm công sử dụng thẻ RFID kết hợp ESP32, cho phép quản lý thời gian làm việc của nhân viên thông qua giao thức MQTT realtime.

### Thành phần hệ thống:
- **ESP32 DevKit V1:** Vi xử lý trung tâm, gateway kết nối MQTT
- **RFID RC522:** Đọc thẻ nhân viên
- **LCD 1602 I2C:** Hiển thị thông tin người dùng, trạng thái
- **Servo Motor:** Điều khiển cửa (mở/đóng)
- **Buzzer:** Phát âm thanh thông báo

## 2. kiến trúc hệ thống

```
┌─────────────┐         ┌─────────────────────┐         ┌─────────────┐         ┌─────────────┐
│   ESP32     │ ◄─────► │   MQTT Broker       │ ◄─────► │   Flask     │ ◄─────► │   MySQL     │
│  (device)   │  MQTT   │  (mosquitto local)  │  MQTT   │  (server)   │         │ (database)  |  
└─────────────┘         └─────────────────────┘         └─────────────┘         └─────────────┘
                                 │                             │
                              docker                        REST API
                                                ┌──────────────────────┼  
                                                │                      │  
                                         ┌──────▼──────┐        ┌──────▼──────┐  
                                         │   web app   │        │ mobile app  │  
                                         │   (react)   │        │  (flutter)  │  
                                         └─────────────┘        └─────────────┘  
```

### mqtt broker:
- **local broker:** eclipse mosquitto 2.0 (chạy trong docker)
- **port:** 1883 (mqtt), 9001 (websocket)
- **network:** docker internal network `iot-network`
- **access:** anonymous enabled (không cần authentication)

### MQTT Topics:
| Topic | Hướng | Mô tả |
|-------|-------|-------|
| `esp32/{device_id}/attendance` | ESP32 → Server | Gửi dữ liệu quẹt thẻ |
| `esp32/{device_id}/response` | Server → ESP32 | Phản hồi kết quả xác thực |
| `esp32/{device_id}/control` | Server → ESP32 | Gửi lệnh điều khiển |
| `esp32/{device_id}/control_response` | ESP32 → Server | Phản hồi lệnh điều khiển |

## 3. Chức năng

### A. ESP32 - Thiết bị chấm công
- Quẹt thẻ RFID để ghi nhận chấm công
- Hiển thị thông tin trên LCD (tên, trạng thái)
- Điều khiển servo mở/đóng cửa
- Hỗ trợ nhận lệnh điều khiển từ xa qua MQTT:
  - `DOOR_OPEN` / `DOOR_CLOSE` - Mở/đóng cửa
  - `RFID_ENABLE` / `RFID_DISABLE` - Bật/tắt quẹt thẻ
  - `DEVICE_ACTIVATE` / `DEVICE_DEACTIVATE` - Kích hoạt/vô hiệu hóa thiết bị

### B. Backend (Flask)
- **Xác thực:** JWT authentication
- **REST API:** Quản lý users, attendance logs, devices
- **MQTT Handler:** Xử lý message từ ESP32, gửi lệnh điều khiển
- **Database:** MySQL với Flask-SQLAlchemy, Flask-Migrate

#### API Endpoints chính:
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/login` | Đăng nhập |
| GET | `/api/users` | Danh sách users (admin) |
| GET | `/api/attendance-logs` | Danh sách logs (admin) |
| GET | `/api/attendance-logs/me` | Logs của user hiện tại |
| GET | `/api/attendance-logs/filter` | Lọc logs theo điều kiện |
| GET | `/api/devices` | Danh sách devices |
| POST | `/api/devices/{id}/door` | Điều khiển cửa |
| POST | `/api/devices/{id}/rfid` | Bật/tắt RFID |
| POST | `/api/devices/{id}/activate` | Kích hoạt device |
| GET | `/api/worked-day/day` | Thông tin làm việc theo ngày |
| GET | `/api/worked-day/month` | Thông tin làm việc theo tháng |

### C. Web Frontend (React + Vite)
- **Login:** Đăng nhập với email/password
- **General Tab:** 
  - Biểu đồ giờ làm việc trong tuần
  - Lịch tháng với thông tin chấm công
  - Chi tiết logs của user
- **Profile Tab:** Xem và chỉnh sửa thông tin cá nhân
- **Manager Tab (Admin):**
  - Quản lý users (CRUD)
  - Copy RFID UID
  - Xem logs của từng user trong modal edit
- **Devices Tab (Admin):**
  - Danh sách thiết bị ESP32
  - Toggle điều khiển: Door, RFID, Activate
  - Xem attendance logs theo device
  - Xóa device

### D. Mobile App (Flutter)
- Login với email/password
- Xem trạng thái chấm công hôm nay
- Xem lịch sử chấm công (theo ngày/tháng)
- Biểu đồ thống kê tuần
- Thông tin profile

## 4. Cấu trúc thư mục

```
workiniot-4735/
├── docs/                   
├── embedded/               
│   └── arduino/             # ESP32
├── server/                  # Backend Flask
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   ├── models.py        # Database models
│   │   ├── utils/           # Helpers, decorators
│   │   └── extensions.py    # Flask extensions
│   ├── docker-compose.yaml
│   ├── Dockerfile
│   └── requirements.txt
├── web-frontend/            # React + Vite
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── pages/
│       └── services/
└── mobile/                  # Flutter app
    └── lib/
        ├── screens/
        ├── providers/
        └── services/
```

## 5. Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| Firmware | Arduino IDE, ESP32, MFRC522, PubSubClient, ArduinoJson |
| Backend | Python, Flask, Flask-SQLAlchemy, Flask-MQTT, JWT |
| Database | MySQL 8.0 |
| MQTT Broker | Eclipse Mosquitto 2.0 (Docker) |
| Web Frontend | React, TypeScript, Vite, Tailwind CSS, Axios |
| Mobile | Flutter, Dart, Provider |
| Protocol | MQTT, REST API |
| Deploy | Docker, Docker Compose |

## 6. hướng dẫn chạy

### backend (server + mqtt broker)

```bash
cd server

# khởi động tất cả services (mysql + flask + mosquitto)
docker compose up -d --build

# kiểm tra trạng thái
docker compose ps

```

**services chạy:**
- `mysql_iot_container` - port 3306
- `flask_iot_container` - port 5000
- `mosquitto_iot_container` - port 1883, 9001

### mqtt broker configuration

#### 1️⃣ flask server
file `.env.docker` đã cấu hình sẵn:
```bash
MQTT_BROKER_URL=mqtt        # tên docker service
MQTT_BROKER_PORT=1883
```

#### 2️⃣ esp32
cần sử dụng **ip address của máy host**.

**lấy ip address:**
```powershell
# windows
ipconfig

# linux/mac
ifconfig
```

ip wifi/ethernet, ví dụ: `192.168.1.10`
**cập nhật `embedded/include/config.h`:**
```cpp
#define MQTT_BROKER   "192.168.1.10" 
#define MQTT_PORT     1883
``` 

## 7. Database Models

### User
- `id`, `rfid_uid`, `email`, `password_hash`
- `full_name`, `is_active`, `is_admin`
- `created_at`

### Attendance_logs
- `id`, `rfid_uid`, `timestamp`
- `device_id`, `code`, `error_code`
- `created_at`

### Device
- `id`, `device_id`, `name`
- `is_active`, `door_state`, `rfid_enabled`
- `last_seen`, `created_at`

## 8. Phân chia công việc

| Thành viên | Nhiệm vụ |
|------------|----------|
| Hardware | Đấu nối mạch ESP32, code firmware Arduino, xử lý RFID/LCD/Servo |
| Backend | Dựng Flask API, MQTT handlers, database, Docker deploy |
| Web | Dashboard React, quản lý users, devices, logs, charts |
| Mobile | App Flutter cho nhân viên xem chấm công, biểu đồ, profile |
