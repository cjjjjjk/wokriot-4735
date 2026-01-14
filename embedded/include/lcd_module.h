#pragma once
#include <Arduino.h>

void lcd_init();
void lcd_show_ready();
void lcd_show_granted(String name);
void lcd_show_denied();
