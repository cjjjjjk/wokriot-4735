#include "servo_module.h"
#include <ESP32Servo.h>

#define SERVO_PIN 13
#define AUTO_CLOSE_MS 3000   // 3 giây

Servo doorServo;

bool isOpen = false;
unsigned long openTime = 0;

void servo_init() {
    doorServo.setPeriodHertz(50);
    doorServo.attach(SERVO_PIN);
    servo_close();
}

void servo_open() {
    doorServo.write(90);
    isOpen = true;
    openTime = millis();
    Serial.println("Servo: OPEN");
}

void servo_close() {
    doorServo.write(0);
    isOpen = false;
    Serial.println("Servo: CLOSE");
}

bool servo_is_open() {
    return isOpen;
}

void servo_loop() {
    if (isOpen && (millis() - openTime > AUTO_CLOSE_MS)) {
        servo_close();
    }
}
