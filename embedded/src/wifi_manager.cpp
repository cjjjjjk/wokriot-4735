#include "wifi_manager.h"
#include "config.h"
#include <WiFi.h>

void initWiFi() {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void checkWiFi() {
    if (WiFi.status() != WL_CONNECTED) {
        WiFi.reconnect();
    }
}

bool isWiFiConnected() {
    return WiFi.status() == WL_CONNECTED;
}
