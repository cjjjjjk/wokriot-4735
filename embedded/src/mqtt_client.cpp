#include "mqtt_client.h"
#include "config.h"
#include <WiFi.h>
#include <PubSubClient.h>

WiFiClient espClient;
PubSubClient mqtt(espClient);

void initMQTT() {
    mqtt.setServer(MQTT_SERVER, MQTT_PORT);
}

void mqttLoop() {
    if (!mqtt.connected()) {
        mqtt.connect("ESP32_CLIENT");
    }
    mqtt.loop();
}

void publishAccess(const String &uid) {
    mqtt.publish(MQTT_TOPIC, uid.c_str());
}
