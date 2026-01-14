#pragma once

// ================= WIFI =================
#define WIFI_SSID "Hai laptop"
#define WIFI_PASSWORD "haihv123"

// ================= MQTT =================
#define MQTT_BROKER "broker.emqx.io"
#define MQTT_PORT 1883

#define DEVICE_ID "esp-01"

// mqtt topics
#define TOPIC_ATTENDANCE "esp32/" DEVICE_ID "/attendance"
#define TOPIC_RESPONSE "esp32/" DEVICE_ID "/response"
#define TOPIC_CONTROL "esp32/" DEVICE_ID "/control"
#define TOPIC_CONTROL_RESPONSE "esp32/" DEVICE_ID "/control_response"

// ================= PIN MAP =================
// rfid rc522
#define RFID_SS_PIN 5
#define RFID_RST_PIN 27
// spi
#define SPI_SCK 18
#define SPI_MOSI 23
#define SPI_MISO 19

// lcd i2c
#define LCD_I2C_ADDR 0x27
#define LCD_COLS 16
#define LCD_ROWS 2
#define I2C_SDA 21
#define I2C_SCL 22

// servo + buzzer + led
#define SERVO_PIN 26
#define BUZZER_PIN 25
#define LED_PIN 2
