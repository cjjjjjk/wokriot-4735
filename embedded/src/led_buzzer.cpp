#include "led_buzzer.h"
#include "pins.h"

void initLED() {
    pinMode(LED_R, OUTPUT);
    pinMode(LED_G, OUTPUT);
    pinMode(LED_B, OUTPUT);

    setLED(LED_OFF);
}

void setLED(LedColor color) {
    // Tắt hết
    digitalWrite(LED_R, LOW);
    digitalWrite(LED_G, LOW);
    digitalWrite(LED_B, LOW);

    switch (color) {
        case LED_RED:
            digitalWrite(LED_R, HIGH);
            break;
        case LED_GREEN:
            digitalWrite(LED_G, HIGH);
            break;
        case LED_BLUE:
            digitalWrite(LED_B, HIGH);
            break;
        case LED_YELLOW:
            digitalWrite(LED_R, HIGH);
            digitalWrite(LED_G, HIGH);
            break;
        case LED_WHITE:
            digitalWrite(LED_R, HIGH);
            digitalWrite(LED_G, HIGH);
            digitalWrite(LED_B, HIGH);
            break;
        default:
            break;
    }
}

void initBuzzer() {
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);
}

void beepOK() {
    setLED(LED_GREEN);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(120);
    digitalWrite(BUZZER_PIN, LOW);
    setLED(LED_OFF);
}

void beepError() {
    setLED(LED_RED);
    for (int i = 0; i < 2; i++) {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(120);
        digitalWrite(BUZZER_PIN, LOW);
        delay(80);
    }
    setLED(LED_OFF);
}
