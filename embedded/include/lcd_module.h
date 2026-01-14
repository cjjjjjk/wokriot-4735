#pragma once
#include <Arduino.h>

void lcd_init();
void lcd_show_ready();
void lcd_show_granted(String name);
void lcd_show_denied();
void lcd_show_denied_with_code(const char *errorCode);
void lcd_show_control(const char *line1, const char *line2);
void lcd_show_uid(String uid);
void lcd_show_device_disabled();
void lcd_show_rfid_disabled();
