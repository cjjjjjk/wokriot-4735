#include <Arduino.h>

#include "wifi_module.h"
#include "mqtt_module.h"
#include "rfid_module.h"
#include "servo_module.h"
#include "buzzer_module.h"
#include "lcd_module.h"


void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("Booting system...");

    // ===== INIT MODULES =====
    wifi_init();
    mqtt_init();
    rfid_init();

    servo_init();
    buzzer_init();
    lcd_init();

    // ===== LCD READY =====
    lcd_show_ready();

    Serial.println("System ready");
}

void loop() {
    mqtt_loop();
    rfid_loop();
    servo_loop();
}
