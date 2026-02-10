-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "license_expiry" DATETIME NOT NULL,
    "rfid_card_id" TEXT,
    "status" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "current_vehicle_id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Driver_current_vehicle_id_fkey" FOREIGN KEY ("current_vehicle_id") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_rfid_card_id_key" ON "Driver"("rfid_card_id");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_current_vehicle_id_key" ON "Driver"("current_vehicle_id");
