# WOKRIOT-4735 | Hệ thống Chấm công Thông minh "Một chạm" & Kiểm soát Ra vào

### 1. Tổng quan
Mô hình hướng tới trải nghiệm người dùng tối giản (User-centric): Nhân viên đến chỉ cần quẹt thẻ, hệ thống tự tính toán chiều vào/ra.

* **ESP32 (Core):** Gateway trung tâm.
* **RFID RC522:** Đọc thẻ nhân viên.
* **Bàn phím 4x4 (Keypad):** Chỉ dùng cho các trường hợp đặc biệt (Xin OT, Reset), không bắt buộc dùng hàng ngày.
* **LED RGB:** Trạng thái cửa
    * *Xanh lá:* Hợp lệ / Mở cửa.
    * *Đỏ:* Lỗi / Từ chối truy cập / Đi sai ca.
    * *Vàng:* Mất kết nối mạng (Chế độ Offline).
* **Còi (Buzzer):** Phát âm thanh bíp ngắn (OK) hoặc bíp dài (Cảnh báo/Lỗi).
* **LCD (I2C):** Hiển thị tên, giờ, trạng thái (Đi muộn/Về sớm).

### 2. Các chức năng nghiệp vụ (Logic cải tiến)

#### A. Chấm công "Một chạm" (Smart Auto-Detection)
* **Thay đổi:** Loại bỏ việc phải bấm nút chọn IN/OUT thủ công.
* **Logic thông minh (Time-window Logic):**
    * **Khung giờ sáng (06:00 - 11:30):** Mặc định hiểu là **Check-in**.
    * **Khung giờ chiều (16:00 - 20:00):** Mặc định hiểu là **Check-out**.
    * **Giữa giờ:** Nếu nhân viên quẹt thẻ, LCD sẽ hiện menu hỏi xác nhận (Ví dụ: "Bạn ra ngoài công tác?").
* **Lợi ích:** Giảm tắc nghẽn tại cổng, công nhân không cần thao tác phức tạp.

#### B. Chế độ Hoạt động Offline (Offline First)
* Giữ nguyên tính năng lưu trữ vào Flash/SD Card khi mất WiFi và tự động đồng bộ (Sync) khi có mạng để đảm bảo dữ liệu luôn chính xác.

#### C. Quy trình xin OT & Nghỉ phép (Kết hợp App-Hardware)
* **Quy trình:**
    1.  Nhân viên tạo yêu cầu OT trên **Mobile App**.
    2.  Quản lý duyệt trên **Web Admin**.
    3.  Lệnh được đẩy xuống **ESP32**.
    4.  Khi nhân viên quẹt thẻ về muộn, ESP32 kiểm tra lệnh -> Xác nhận hợp lệ -> Mở cửa & Tính công OT.

### 3. Mô tả chi tiết Ứng dụng & Website

#### A. Mobile App (Dành cho Nhân viên)
* **Trang chủ:** Hiển thị QR Code (thay thế thẻ cứng nếu quên), Trạng thái chấm công hôm nay (Đã Check-in lúc 7:55).
* **Lịch sử:** Xem bảng công theo dạng Lịch (Calendar View). Ngày đi muộn hiển thị màu đỏ, đúng giờ màu xanh.
* **Đơn từ:** Form gửi đơn xin nghỉ phép, xin đi muộn, xin làm thêm giờ (OT).
* **Thông báo (Push Notification):**
    * "checked in successfully."
    * "[!!] you did not check out on [date]."

#### B. Web Portal (Dành cho HR/Quản lý & Bảo vệ)
* **Dashboard (Realtime):** Biểu đồ tròn hiển thị % nhân viên đang có mặt. Danh sách cuộn (Log) các lượt quẹt thẻ mới nhất.
* **Quản lý Nhân sự:** Thêm/Sửa/Xóa nhân viên, gán mã thẻ RFID cho nhân viên.
* **Quản lý Ca làm việc:** Cấu hình khung giờ (Shift) để thuật toán Smart Auto-detect hoạt động đúng.
* **Báo cáo:** Xuất file Excel bảng công chi tiết (Giờ vào, Giờ ra, Số phút đi muộn, Tổng công) để tính lương.
* **Điều khiển thiết bị:** Xem trạng thái ESP32 (Online/Offline), Mở cửa từ xa (trong trường hợp khẩn cấp).

### 4. Kiến trúc & Công nghệ (Framework)

* **Firmware (ESP32):**
    * Framework: **Arduino IDE** hoặc **PlatformIO**.
    * Libraries: `MFRC522` (RFID), `PubSubClient` (MQTT), `ArduinoJson`.
* **Backend:**
    * Language: **Node.js** (NestJS/Express) hoặc **Python** (FastAPI).
    * Protocol: **MQTT** (Mosquitto Broker) cho giao tiếp thiết bị + **REST API** cho App/Web.
    * Database: **MySQL** (Lưu user/ca làm) 
* **Frontend:**
    * Web Admin: 
    * Mobile App: **Flutter** 

### 5. Danh sách thiết bị cần mua (Bill of Materials)

| STT | Tên linh kiện | Số lượng | Đơn giá (Ước tính) | Ghi chú |
| :-- | :--- | :--- | :--- | :--- |
| 1 | ESP32 DevKit V1 | 1 | ~90k | Vi xử lý trung tâm |
| 2 | Module RFID RC522 | 1 | ~25k | Kèm thẻ trắng & móc khóa |
| 3 | Màn hình LCD 1602 + I2C | 1 | ~35k | Hiển thị thông tin |
| 4 | Bàn phím Ma trận 4x4 | 1 | ~15k | Nhập liệu khi cần |
| 5 | Module Relay 5V (1 kênh) | 1 | ~15k | Đóng ngắt khóa cửa |
| 6 | Khóa chốt điện từ (Solenoid) | 1 | ~80k - 100k | Demo khóa cửa (hoặc dùng Servo cho rẻ) |
| 7 | Còi chip (Active Buzzer) | 1 | ~2k | Báo âm thanh |
| 8 | Breadboard + Dây cắm | 1 bộ | ~50k | Đấu nối mạch |
| 9 | Nguồn Adapter 5V | 1 | ~30k | Cấp nguồn cho ESP32 |

### 6. Phân chia công việc 

#### **1: Hardware**
* **Nhiệm vụ:**
    * Đấu nối mạch hoàn chỉnh, đóng hộp mô hình.
    * Code ESP32: Đọc thẻ, điều khiển LCD/Relay.
    * **Quan trọng:** Xử lý logic **"Offline Mode"** (Lưu vào Flash) và logic **"Smart Detect"** (Tự nhận diện sáng/chiều dựa trên giờ hệ thống - NTP Client).

#### **2: Backend & System Architect**
* **Nhiệm vụ:**
    * Dựng MQTT Broker, Database.
    * Viết API xử lý logic chấm công: Ghép cặp (Pairing) giờ vào/ra, tính toán phút đi muộn.
    * Viết script giả lập 1000 user để test tải (Load Testing).
    * APIs chức năng

#### **3: Web**
* **Nhiệm vụ:**
    * Dashboard quản lý: (thẻ - nhân viên, thông báo, logs, cấu hình time checkout/checkin, chia ca, cấu hình ca (default, ot, hybrid))
    * Thống kê, chỉnh sửa và xuất báo cáo Excel (Export).
    * Từng nhân viên (tài khoản đăng nhập), nhiều nhân viên (manager).

#### **4: Mobile App**
* **Nhiệm vụ:**
    * Viết App cho nhân viên (Flutter).
    * Login, xem lịch sử, Push Notification.
    * Tạo QR Code định danh cá nhân trên App. (optional)

### Demo
1.  **Cảnh 1 (Sáng đi làm - Chuẩn):**
    * NV A đến lúc 7-8:00 (Giờ hệ thống).
    * **Thao tác:** Chỉ cần quẹt thẻ.
    * **Hệ thống:** Tự hiểu là CHECK-IN. Còi kêu 1 bíp. Cửa mở.
    * **Web Dashboard:** Hiện ngay lập tức dòng log: *"Nguyễn Văn A - Check IN - 07:00:05"*.

2.  **Cảnh 2 (Chiều về - Chuẩn):**
    * NV A về sau 15:30.
    * **Thao tác:** Quẹt thẻ.
    * **Hệ thống:** Tự hiểu là CHECK-OUT.
    * **App:** Báo thông báo: *"check out successfully."*.

3.  **Cảnh 3 (Đi muộn/Sự cố):**
    * NV B đến lúc 9:00 (Quá giờ).
    * **Thao tác:** Quẹt thẻ.
    * **Hệ thống:** Còi kêu 2 bíp (Cảnh báo). LCD báo "check in/out late". LED xanh
    * **Hệ thống:** Còi kêu 2 bíp (Cảnh báo). LCD báo "err: err_code". LED đỏ
    * **Hệ thống:** Còi kêu 2 bíp (Cảnh báo). LCD báo "card forbidden". LED đỏ
    * **Backend:** Ghi nhận lỗi đi muộn vào Database.

4.  **Cảnh 4 (Check tải):**
    * Thành viên Backend chạy script.
    * Màn hình Web Dashboard nhảy số liên tục (Số lượng nhân viên Check-in tăng vọt từ 10 -> 2000 trong vài giây). Chứng minh hệ thống chịu tải tốt.  

5. 
