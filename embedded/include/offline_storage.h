// Lưu OFFLINE (SPIFFS)
#pragma once
#include <Arduino.h>
#include <time.h>
#include "types.h"

void initOfflineStorage();
void saveOffline(const String &uid, ActionType action, tm now);
