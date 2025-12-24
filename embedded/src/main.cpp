#include <Arduino.h>
#include "rfid.h"
#include "lcd_ui.h"
#include "relay.h"
#include "led_buzzer.h"
#include "time_manager.h"
#include "offline_storage.h"
#include "wifi_manager.h"
#include "mqtt_client.h"

void setup() {
  Serial.begin(115200);

  initLED();
  initBuzzer();
  initRelay();
  initLCD();
  initRFID();
  initOfflineStorage();
  initWiFi();
  initMQTT();
  initTime();

  lcdShow("System Ready", "");
}

void loop() {
  mqttLoop();
  checkWiFi();

  String uid;
  if (readCard(uid)) {
    tm now = getNow();
    ActionType action = detectAction(now);

    if (!isWiFiConnected()) {
      saveOffline(uid, action, now);
      showOffline();
      return;
    }

    if (publishAttendance(uid, action, now)) {
      showSuccess(action);
      openDoor();
    } else {
      saveOffline(uid, action, now);
      showOffline();
    }
  }

  delay(200);
}
