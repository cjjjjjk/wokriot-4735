#include "rfid.h"
#include "pins.h"

#include <SPI.h>
#include <MFRC522.h>

MFRC522 rfid(RFID_SS, RFID_RST);

void initRFID() {
    SPI.begin();
    rfid.PCD_Init();
}

bool readRFID(String &uid) {
    if (!rfid.PICC_IsNewCardPresent()) return false;
    if (!rfid.PICC_ReadCardSerial()) return false;

    uid = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
        uid += String(rfid.uid.uidByte[i], HEX);
    }

    uid.toUpperCase();

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();

    return true;
}
