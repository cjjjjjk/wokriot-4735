//Điều khiển khóa cửa
#pragma once
#include <Arduino.h>

void initRelay();
void openDoor(int durationMs = 3000);
