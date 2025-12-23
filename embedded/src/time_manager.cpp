#include "time_manager.h"
#include <WiFi.h>
#include <time.h>

void initTime() {
    configTime(7 * 3600, 0, "pool.ntp.org");
}

bool isDayTime() {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) return true;

    int hour = timeinfo.tm_hour;
    return (hour >= 6 && hour < 18);
}
