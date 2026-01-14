#pragma once
#include <Arduino.h>

// khởi tạo mqtt
void mqtt_init();

// gọi trong loop()
void mqtt_loop();

// gửi dữ liệu chấm công với timestamp và code
void mqtt_publish_attendance(String rfid_uid, String timestamp);

// callback xử lý message từ mqtt
void mqtt_callback(char *topic, byte *payload, unsigned int length);

// device state variables (extern)
extern bool rfidEnabled;
extern bool deviceActive;
