#pragma once
#include <Arduino.h>

// Khởi tạo MQTT
void mqtt_init();

// Gọi trong loop()
void mqtt_loop();

// Gửi dữ liệu chấm công
void mqtt_publish_attendance(String rfid_uid);

// Callback xử lý message từ MQTT
void mqtt_callback(char* topic, byte* payload, unsigned int length);

bool mqtt_publish_raw(String line);
