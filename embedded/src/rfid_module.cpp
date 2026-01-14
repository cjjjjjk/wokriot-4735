#include "rfid_module.h"
#include "buzzer_module.h"
#include "config.h"
#include "lcd_module.h"
#include "mqtt_module.h"


#include <MFRC522.h>
#include <SPI.h>
#include <time.h>


MFRC522 mfrc522(RFID_SS_PIN, RFID_RST_PIN);

// chống quẹt liên tục
static unsigned long lastScanTime = 0;
#define SCAN_INTERVAL 1000

// device state - controlled externally from mqtt_module
extern bool rfidEnabled;
extern bool deviceActive;

// hàm lấy timestamp iso format
String getISOTime() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "";
  }
  char buf[40];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S+07:00", &timeinfo);
  return String(buf);
}

void rfid_init() {
  SPI.begin(SPI_SCK, SPI_MISO, SPI_MOSI, RFID_SS_PIN);
  mfrc522.PCD_Init();
  mfrc522.PCD_SetAntennaGain(mfrc522.RxGain_max);
  delay(50);

  Serial.println("RFID RC522 initialized");

  // debug lỗi rfid
  byte version = mfrc522.PCD_ReadRegister(MFRC522::VersionReg);
  Serial.print("RC522 Version: 0x");
  Serial.println(version, HEX);
}

void rfid_loop() {
  // kiểm tra thiết bị có active không
  if (!deviceActive) {
    return;
  }

  // kiểm tra rfid có được bật không
  if (!rfidEnabled) {
    return;
  }

  // không có thẻ mới
  if (!mfrc522.PICC_IsNewCardPresent())
    return;
  if (!mfrc522.PICC_ReadCardSerial())
    return;

  // chống spam
  if (millis() - lastScanTime < SCAN_INTERVAL) {
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
    return;
  }
  lastScanTime = millis();

  // đọc uid
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10)
      uid += "0";
    uid += String(mfrc522.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();

  Serial.println("RFID UID: " + uid);

  // hiển thị uid trên lcd
  lcd_show_uid(uid);

  // beep short
  buzzer_beep_short();

  // lấy timestamp
  String timestamp = getISOTime();

  // gửi lên server qua mqtt với code field
  mqtt_publish_attendance(uid, timestamp);

  // kết thúc phiên đọc
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}
