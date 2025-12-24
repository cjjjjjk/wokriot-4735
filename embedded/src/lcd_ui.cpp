#include "lcd_ui.h"
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void initLCD() {
    lcd.init();
    lcd.backlight();
}

void lcdShow(const String &line1, const String &line2) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(line1);
    lcd.setCursor(0, 1);
    lcd.print(line2);
}

void lcdClear() {
    lcd.clear();
}

void showBoot() {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("ESP32 Booting");
}

void showOffline() {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("OFFLINE MODE");
    lcd.setCursor(0, 1);
    lcd.print("Saved to Flash");
}

void showSuccess() {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("ACCESS OK");
}

void showError(const char* msg) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("ERROR");
    lcd.setCursor(0, 1);
    lcd.print(msg);
}