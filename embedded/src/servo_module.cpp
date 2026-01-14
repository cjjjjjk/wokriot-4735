#include "servo_module.h"
#include "config.h"
#include <ESP32Servo.h>

#define SERVO_OPEN_ANGLE 90
#define SERVO_CLOSE_ANGLE 0
#define AUTO_CLOSE_MS 3500

Servo doorServo;

bool doorOpen = false;
unsigned long openTime = 0;

void servo_init() {
  doorServo.setPeriodHertz(50);
  doorServo.attach(SERVO_PIN);
  servo_close();
}

void servo_open() {
  doorServo.write(SERVO_OPEN_ANGLE);
  doorOpen = true;
  openTime = millis();
  Serial.println("Servo: OPEN");
}

void servo_close() {
  doorServo.write(SERVO_CLOSE_ANGLE);
  doorOpen = false;
  Serial.println("Servo: CLOSE");
}

bool servo_is_open() { return doorOpen; }

void servo_loop() {
  if (doorOpen && (millis() - openTime > AUTO_CLOSE_MS)) {
    servo_close();
  }
}
