//NTP + Smart detect#pragma once
#include <time.h>
#include "types.h"

void initTime();
tm getNow();
ActionType detectAction(tm now);

