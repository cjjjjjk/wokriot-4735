#include "lcd_module.h"
#include "config.h"
#include <LiquidCrystal_I2C.h>
#include <Wire.h>

LiquidCrystal_I2C lcd(LCD_I2C_ADDR, LCD_COLS, LCD_ROWS);

void lcd_init() {
  Wire.begin(I2C_SDA, I2C_SCL);
  lcd.init();
  lcd.backlight();
  lcd_show_ready();
}

void lcd_show_ready() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("HELLO !");
  lcd.setCursor(0, 1);
  lcd.print("CARD READY ..");
}

void lcd_show_granted(String name) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("ACCESS GRANTED");
  lcd.setCursor(0, 1);
  lcd.print(name.substring(0, 16));
}

void lcd_show_denied() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("ACCESS DENIED");
  lcd.setCursor(0, 1);
  lcd.print("ERROR");
}

void lcd_show_denied_with_code(const char *errorCode) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("ACCESS DENIED");
  lcd.setCursor(0, 1);

  if (errorCode) {
    lcd.print(errorCode);
  } else {
    lcd.print("ERROR");
  }
}

void lcd_show_control(const char *line1, const char *line2) {
  lcd.clear();
  lcd.setCursor(0, 0);
  if (line1)
    lcd.print(line1);
  lcd.setCursor(0, 1);
  if (line2)
    lcd.print(line2);
}

void lcd_show_uid(String uid) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("UID:");
  lcd.setCursor(0, 1);
  lcd.print(uid.substring(0, 16));
}

void lcd_show_device_disabled() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("DEVICE DISABLED");
  lcd.setCursor(0, 1);
  lcd.print("CONTACT ADMIN");
}

void lcd_show_rfid_disabled() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("RFID DISABLED");
  lcd.setCursor(0, 1);
  lcd.print("BY ADMIN");
}
