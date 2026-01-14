#include "mqtt_module.h"
#include "buzzer_module.h"
#include "config.h"
#include "lcd_module.h"
#include "servo_module.h"


#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <WiFi.h>


// mqtt client
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// device state variables
bool rfidEnabled = true;
bool deviceActive = true;

// led blinking
void blinkLed(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(150);
    digitalWrite(LED_PIN, LOW);
    delay(150);
  }
}

// gửi phản hồi lệnh điều khiển về server
void sendControlResponse(const char *command, bool success,
                         const char *message) {
  StaticJsonDocument<256> doc;
  doc["command"] = command;
  doc["status"] = success ? "SUCCESS" : "FAILED";
  doc["message"] = message;

  char payload[256];
  serializeJson(doc, payload);
  mqttClient.publish(TOPIC_CONTROL_RESPONSE, payload);

  Serial.print("Control Response TX: ");
  Serial.println(payload);
}

// xử lý lệnh điều khiển từ server
void handleControlCommand(const char *command) {
  Serial.print("Processing command: ");
  Serial.println(command);

  buzzer_beep_control();

  if (strcmp(command, "DOOR_OPEN") == 0) {
    // mở cửa
    servo_open();
    lcd_show_control("REMOTE CONTROL", "DOOR OPENED");
    sendControlResponse(command, true, "door opened by admin");
    blinkLed(2);

  } else if (strcmp(command, "DOOR_CLOSE") == 0) {
    // đóng cửa
    servo_close();
    lcd_show_control("REMOTE CONTROL", "DOOR CLOSED");
    sendControlResponse(command, true, "door closed by admin");
    blinkLed(2);

  } else if (strcmp(command, "RFID_ENABLE") == 0) {
    // bật chức năng quẹt thẻ
    rfidEnabled = true;
    lcd_show_control("RFID ENABLED", "CARD READY ..");
    sendControlResponse(command, true, "rfid scanning enabled");
    blinkLed(2);

  } else if (strcmp(command, "RFID_DISABLE") == 0) {
    // tắt chức năng quẹt thẻ
    rfidEnabled = false;
    lcd_show_rfid_disabled();
    sendControlResponse(command, true, "rfid scanning disabled");
    blinkLed(3);

  } else if (strcmp(command, "DEVICE_ACTIVATE") == 0) {
    // kích hoạt thiết bị
    deviceActive = true;
    rfidEnabled = true;
    lcd_show_control("DEVICE ACTIVATED", "READY");
    sendControlResponse(command, true, "device activated");
    blinkLed(2);

  } else if (strcmp(command, "DEVICE_DEACTIVATE") == 0) {
    // vô hiệu hoá thiết bị
    deviceActive = false;
    rfidEnabled = false;
    servo_close();
    lcd_show_device_disabled();
    sendControlResponse(command, true, "device deactivated");
    buzzer_beep_fail();

  } else {
    // lệnh không hợp lệ
    lcd_show_control("UNKNOWN CMD", "");
    sendControlResponse(command, false, "unknown command");
  }
}

// mqtt callback
void mqtt_callback(char *topic, byte *payload, unsigned int length) {
  payload[length] = '\0';
  String message = String((char *)payload);

  Serial.print("MQTT RX [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  StaticJsonDocument<256> doc;
  if (deserializeJson(doc, message)) {
    Serial.println("JSON parse failed");
    return;
  }

  // kiểm tra xem message đến từ topic nào
  String topicStr = String(topic);

  if (topicStr == TOPIC_CONTROL) {
    // xử lý lệnh điều khiển từ admin
    const char *command = doc["command"];
    if (command) {
      handleControlCommand(command);
    }
    return;
  }

  if (topicStr == TOPIC_RESPONSE) {
    // xử lý phản hồi attendance từ server
    bool isSuccess = doc["is_success"];
    const char *userName = doc["user_name"];
    const char *errorCode = doc["error_code"];

    if (isSuccess) {
      buzzer_beep_success();
      lcd_show_granted(userName ? userName : "Welcome");

      blinkLed(1);
      servo_open();
      delay(3500);
      lcd_show_ready();

    } else {
      buzzer_beep_fail();

      // hiển thị lỗi cụ thể
      if (errorCode) {
        if (strcmp(errorCode, "RFID_DISABLED") == 0) {
          lcd_show_denied_with_code("RFID DISABLED");
        } else {
          lcd_show_denied_with_code(errorCode);
        }
      } else {
        lcd_show_denied();
      }

      blinkLed(3);
    }
  }
}

// init mqtt
void mqtt_init() {
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqtt_callback);
}

// mqtt loop
void mqtt_loop() {
  if (!mqttClient.connected()) {
    Serial.println("MQTT reconnecting...");
    while (!mqttClient.connected()) {
      if (mqttClient.connect(DEVICE_ID)) {
        Serial.println("MQTT connected");

        mqttClient.subscribe(TOPIC_RESPONSE);
        Serial.print("Subscribed to: ");
        Serial.println(TOPIC_RESPONSE);

        mqttClient.subscribe(TOPIC_CONTROL);
        Serial.print("Subscribed to: ");
        Serial.println(TOPIC_CONTROL);
      } else {
        Serial.print("MQTT failed, rc=");
        Serial.println(mqttClient.state());
        delay(500);
      }
    }
  }
  mqttClient.loop();
}

// publish attendance với timestamp và code
void mqtt_publish_attendance(String rfid_uid, String timestamp) {
  StaticJsonDocument<200> doc;
  doc["rfid_uid"] = rfid_uid;
  doc["timestamp"] = timestamp;
  doc["code"] = "REALTIME";

  char buffer[256];
  serializeJson(doc, buffer);

  mqttClient.publish(TOPIC_ATTENDANCE, buffer);

  Serial.print("Attendance TX: ");
  Serial.println(buffer);
}
