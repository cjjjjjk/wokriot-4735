#include <Arduino.h>

#include "buzzer_module.h"
#include "config.h"
#include "lcd_module.h"
#include "mqtt_module.h"
#include "rfid_module.h"
#include "servo_module.h"
#include "wifi_module.h"


// helper function để cập nhật lcd theo device state
extern bool rfidEnabled;
extern bool deviceActive;

void displayStatus() {
  if (!deviceActive) {
    lcd_show_device_disabled();
  } else if (!rfidEnabled) {
    lcd_show_rfid_disabled();
  } else {
    lcd_show_ready();
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("ESP32 IoT Attendance System");
  Serial.println("Booting system...");

  // init led pin
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // init modules
  wifi_init();
  mqtt_init();
  rfid_init();
  servo_init();
  buzzer_init();
  lcd_init();

  // display ready status
  displayStatus();

  Serial.println("ESP32 IoT Attendance System Ready");
  Serial.println("Device Control Enabled");
}

void loop() {
  mqtt_loop();
  rfid_loop();
  servo_loop();
}
