#pragma once

// ================= WIFI =================
#define WIFI_SSID     "VuVan"
#define WIFI_PASSWORD "123456789"

// ================= MQTT =================
#define MQTT_BROKER   "broker.emqx.io"
#define MQTT_PORT     1883

#define DEVICE_ID     "esp32_01"

// MQTT Topics
#define TOPIC_ATTENDANCE        "esp32/" DEVICE_ID "/attendance"
#define TOPIC_RESPONSE          "esp32/" DEVICE_ID "/response"
#define TOPIC_CONTROL           "esp32/" DEVICE_ID "/control"
#define TOPIC_CONTROL_RESPONSE  "esp32/" DEVICE_ID "/control_response"

// ================= PIN MAP =================
// RFID RC522
#define RFID_SS_PIN   5
#define RFID_RST_PIN  22
// ===== SPI =====
#define SPI_SCK   18
#define SPI_MOSI  23
#define SPI_MISO  19

// LCD I2C
#define LCD_I2C_ADDR  0x27
#define LCD_COLS      16
#define LCD_ROWS      2

// Servo + Buzzer
#define SERVO_PIN     13
#define BUZZER_PIN    27
