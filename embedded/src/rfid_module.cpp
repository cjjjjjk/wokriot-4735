#include "rfid_module.h"
#include "mqtt_module.h"
#include "config.h"

#include <SPI.h>
#include <MFRC522.h>

MFRC522 rfid(RFID_SS_PIN, RFID_RST_PIN);

// chống quẹt liên tục
static unsigned long lastScanTime = 0;
#define SCAN_INTERVAL 2000   // 2 giây

// ===== INIT =====
void rfid_init() {
    SPI.begin(SPI_SCK, SPI_MISO, SPI_MOSI, RFID_SS_PIN);

    rfid.PCD_Init();
    delay(50);

    Serial.println("RFID RC522 initialized");
    //debug lỗi RFID
    byte version = rfid.PCD_ReadRegister(MFRC522::VersionReg);
    Serial.print("RC522 Version: 0x");
    Serial.println(version, HEX);
}

// ===== LOOP =====
void rfid_loop() {
    // Không có thẻ mới
    if (!rfid.PICC_IsNewCardPresent()) return;
    if (!rfid.PICC_ReadCardSerial())   return;

    // Chống spam
    if (millis() - lastScanTime < SCAN_INTERVAL) {
        rfid.PICC_HaltA();
        rfid.PCD_StopCrypto1();
        return;
    }
    lastScanTime = millis();

    // Đọc UID
    String uid = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
        if (rfid.uid.uidByte[i] < 0x10) uid += "0";
        uid += String(rfid.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();

    Serial.println("RFID UID: " + uid);

    // Gửi lên server qua MQTT
    mqtt_publish_attendance(uid);

    // Kết thúc phiên đọc
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
}
