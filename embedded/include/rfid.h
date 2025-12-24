//Đọc thẻ RFID
#pragma once
#include <Arduino.h>

void initRFID();
bool readCard(String &uid);
