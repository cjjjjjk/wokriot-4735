//MQTT giao tiếp backend
#pragma once
#include <Arduino.h>
#include <time.h>
#include "types.h"

void initMQTT();
void mqttLoop();

bool publishAttendance(const String &uid, ActionType action, tm now);
