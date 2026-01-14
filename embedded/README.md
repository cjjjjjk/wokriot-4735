# esp32 iot attendance system - platformio

### các tính năng chính

1. **rfid card reader** - đọc thẻ rfid và gửi dữ liệu attendance lên mqtt
2. **mqtt communication** - giao tiếp 2 chiều với server
   - gửi: attendance data (rfid_uid, timestamp, code)
   - nhận: response (access granted/denied)
   - nhận: control commands từ admin
   - gửi: control response
3. **servo motor** - điều khiển cửa (auto-close sau 3.5s)
4. **lcd display 16x2** - hiển thị trạng thái và thông báo
5. **buzzer** - phát các âm thanh thông báo khác nhau
6. **led indicator** - led báo trạng thái
7. **device control** - điều khiển từ xa qua mqtt

### control commands

esp32 hỗ trợ các lệnh điều khiển từ server:

- `DOOR_OPEN` - mở cửa từ xa
- `DOOR_CLOSE` - đóng cửa từ xa
- `RFID_ENABLE` - bật chức năng quẹt thẻ
- `RFID_DISABLE` - tắt chức năng quẹt thẻ
- `DEVICE_ACTIVATE` - kích hoạt thiết bị
- `DEVICE_DEACTIVATE` - vô hiệu hoá thiết bị

### mqtt topics

- `esp32/esp-01/attendance` - gửi dữ liệu chấm công
- `esp32/esp-01/response` - nhận phản hồi từ server
- `esp32/esp-01/control` - nhận lệnh điều khiển
- `esp32/esp-01/control_response` - gửi phản hồi lệnh điều khiển

### pin mapping

```
rfid rc522:
- ss: gpio 5
- rst: gpio 27
- sck: gpio 18
- mosi: gpio 23
- miso: gpio 19

lcd i2c:
- sda: gpio 21
- scl: gpio 22
- address: 0x27

servo motor: gpio 26
buzzer: gpio 25
led: gpio 2
```
