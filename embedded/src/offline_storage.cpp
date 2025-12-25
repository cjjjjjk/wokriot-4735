#include "offline_storage.h"
#include <Preferences.h>

Preferences prefs;

void initOfflineStorage() {
    prefs.begin("offline", false);
}

void saveOfflineUID(const String &uid) {
    String key = String(millis());
    prefs.putString(key.c_str(), uid);
}
