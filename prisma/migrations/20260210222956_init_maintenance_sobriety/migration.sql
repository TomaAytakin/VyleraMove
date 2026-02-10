-- CreateTable
CREATE TABLE "TripTelemetry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "idle_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "alcohol_check_passed" BOOLEAN NOT NULL DEFAULT true,
    "alcohol_level" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TripTelemetry_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "is_suspended" BOOLEAN NOT NULL DEFAULT false,
    "current_vehicle_id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Driver_current_vehicle_id_fkey" FOREIGN KEY ("current_vehicle_id") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Driver" ("createdAt", "current_vehicle_id", "id", "kpi_grade", "languages", "license_expiry", "license_number", "name", "phone", "rating", "rfid_card_id", "status", "trust_score", "updatedAt") SELECT "createdAt", "current_vehicle_id", "id", "kpi_grade", "languages", "license_expiry", "license_number", "name", "phone", "rating", "rfid_card_id", "status", "trust_score", "updatedAt" FROM "Driver";
DROP TABLE "Driver";
ALTER TABLE "new_Driver" RENAME TO "Driver";
CREATE UNIQUE INDEX "Driver_rfid_card_id_key" ON "Driver"("rfid_card_id");
CREATE UNIQUE INDEX "Driver_current_vehicle_id_key" ON "Driver"("current_vehicle_id");
CREATE TABLE "new_Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 2024,
    "capacity" INTEGER NOT NULL,
    "imei_tracker" TEXT,
    "serial_dsm_cam" TEXT,
    "serial_road_cam" TEXT,
    "tablet_id" TEXT,
    "ip_address_starlink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "type" TEXT NOT NULL,
    "currentMileage" INTEGER NOT NULL DEFAULT 0,
    "avg_fuel_consumption" REAL NOT NULL DEFAULT 0.0,
    "subscription_starlink_due" DATETIME,
    "insurance_renewal_due" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Vehicle" ("capacity", "createdAt", "currentMileage", "id", "imei_tracker", "insurance_renewal_due", "ip_address_starlink", "licensePlate", "make", "model", "serial_dsm_cam", "serial_road_cam", "status", "subscription_starlink_due", "tablet_id", "type", "updatedAt", "vin", "year") SELECT "capacity", "createdAt", "currentMileage", "id", "imei_tracker", "insurance_renewal_due", "ip_address_starlink", "licensePlate", "make", "model", "serial_dsm_cam", "serial_road_cam", "status", "subscription_starlink_due", "tablet_id", "type", "updatedAt", "vin", "year" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TripTelemetry_tripId_key" ON "TripTelemetry"("tripId");
