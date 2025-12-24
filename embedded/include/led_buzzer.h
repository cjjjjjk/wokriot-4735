//LED và còi 
#pragma once
#include <Arduino.h>

enum LedColor {
    LED_OFF = 0,
    LED_RED,
    LED_GREEN,
    LED_BLUE,
    LED_YELLOW,
    LED_WHITE
};

void initLED();
void setLED(LedColor color);

void initBuzzer();
void beepOK();
void beepError();

