-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "insurance_renewal_due" DATETIME;
ALTER TABLE "Vehicle" ADD COLUMN "subscription_starlink_due" DATETIME;

-- CreateTable
CREATE TABLE "MaintenanceLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "cost" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "invoice_url" TEXT NOT NULL,
    "ocr_raw_text" TEXT,
    "ai_analysis_json" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaintenanceLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceLog_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "license_expiry" DATETIME NOT NULL,
    "rfid_card_id" TEXT,
    "status" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "trust_score" INTEGER NOT NULL DEFAULT 100,
    "kpi_grade" TEXT NOT NULL DEFAULT 'A',
    "current_vehicle_id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Driver_current_vehicle_id_fkey" FOREIGN KEY ("current_vehicle_id") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Driver" ("createdAt", "current_vehicle_id", "id", "languages", "license_expiry", "license_number", "name", "phone", "rating", "rfid_card_id", "status", "updatedAt") SELECT "createdAt", "current_vehicle_id", "id", "languages", "license_expiry", "license_number", "name", "phone", "rating", "rfid_card_id", "status", "updatedAt" FROM "Driver";
DROP TABLE "Driver";
ALTER TABLE "new_Driver" RENAME TO "Driver";
CREATE UNIQUE INDEX "Driver_rfid_card_id_key" ON "Driver"("rfid_card_id");
CREATE UNIQUE INDEX "Driver_current_vehicle_id_key" ON "Driver"("current_vehicle_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
