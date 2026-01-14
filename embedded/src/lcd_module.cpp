#include "lcd_module.h"
#include <LiquidCrystal_I2C.h>

#define LCD_ADDR 0x27
#define LCD_COLS 16
#define LCD_ROWS 2

LiquidCrystal_I2C lcd(LCD_ADDR, LCD_COLS, LCD_ROWS);

void lcd_init() {
    lcd.init();
    lcd.backlight();
    lcd_show_ready();
}

void lcd_show_ready() {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Scan your card");
    lcd.setCursor(0, 1);
    lcd.print("Waiting...");
}

void lcd_show_granted(String name) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Access Granted");
    lcd.setCursor(0, 1);
    lcd.print(name.substring(0, 16));
}

void lcd_show_denied() {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Access Denied");
    lcd.setCursor(0, 1);
    lcd.print("Try again");
}
