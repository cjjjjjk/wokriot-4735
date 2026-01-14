#include "mqtt_module.h"
#include "config.h"
#include "servo_module.h"
#include "buzzer_module.h"
#include "lcd_module.h"

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ===== MQTT CLIENT =====
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ===== INIT =====
void mqtt_init() {
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
    mqttClient.setCallback(mqtt_callback);
}

// ===== LOOP =====
void mqtt_loop() {
    if (!mqttClient.connected()) {
        Serial.println("MQTT reconnecting...");
        while (!mqttClient.connected()) {
            if (mqttClient.connect(DEVICE_ID)) {
                Serial.println("MQTT connected");

                mqttClient.subscribe(TOPIC_CONTROL);
                mqttClient.subscribe(TOPIC_RESPONSE);

                Serial.println("Subscribed control & response");
            } else {
                Serial.print("MQTT failed, rc=");
                Serial.println(mqttClient.state());
                delay(2000);
            }
        }
    }
    mqttClient.loop();
}

// ===== PUBLISH ATTENDANCE =====
void mqtt_publish_attendance(String rfid_uid) {
    StaticJsonDocument<200> doc;

    doc["device_id"] = DEVICE_ID;
    doc["rfid_uid"]  = rfid_uid;
    doc["timestamp"] = millis();  

    char buffer[256];
    serializeJson(doc, buffer);

    mqttClient.publish(TOPIC_ATTENDANCE, buffer);

    Serial.println("Publish attendance:");
    Serial.println(buffer);
}

// ===== CALLBACK =====
void mqtt_callback(char* topic, byte* payload, unsigned int length) {
    String message;
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }

    Serial.print("MQTT [");
    Serial.print(topic);
    Serial.print("]: ");
    Serial.println(message);

    StaticJsonDocument<256> doc;
    if (deserializeJson(doc, message)) {
        Serial.println("JSON parse failed");
        return;
    }

    // ===== RESPONSE (Server → ESP32) =====
    if (String(topic) == TOPIC_RESPONSE) {

        String status = doc["status"] | "";
        String full_name = doc["full_name"] | "";
        String action = doc["action"] | "";

        if (status == "OK") {
            Serial.println("Access GRANTED");
            Serial.println("Name: " + full_name);

            lcd_show_granted(full_name);
            buzzer_beep_short();

            if (action == "DOOR_OPEN") {
                servo_open();
            }

        } else {
            Serial.println("Access DENIED");

            lcd_show_denied();
            buzzer_beep_long();
        }
    }

    // ===== CONTROL (Server → ESP32) =====
    else if (String(topic) == TOPIC_CONTROL) {

        String command = doc["command"] | "";

        Serial.println("Control command: " + command);

        if (command == "DOOR_OPEN") {
            servo_open();
            buzzer_beep_short();
            lcd_show_granted("Door Open");

        }
        else if (command == "DOOR_CLOSE") {
            servo_close();
            buzzer_beep_long();
            lcd_show_ready();
        }
        else if (command == "RFID_ENABLE") {
            Serial.println("=> RFID enabled");
        }
        else if (command == "RFID_DISABLE") {
            Serial.println("=> RFID disabled");
        }
        else if (command == "DEVICE_ACTIVATE") {
            Serial.println("=> Device activated");
        }
        else if (command == "DEVICE_DEACTIVATE") {
            Serial.println("=> Device deactivated");
        }
    }
}
