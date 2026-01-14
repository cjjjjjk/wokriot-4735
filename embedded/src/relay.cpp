#include "relay.h"
#include "pins.h"

void initRelay() {
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, LOW);
}

void openDoor(int durationMs) {
    digitalWrite(RELAY_PIN, HIGH);
    delay(durationMs);
    digitalWrite(RELAY_PIN, LOW);
}
