-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "year" INTEGER NOT NULL DEFAULT 2024,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "type" TEXT NOT NULL,
    "currentMileage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Vehicle" ("capacity", "createdAt", "currentMileage", "id", "licensePlate", "make", "model", "status", "type", "updatedAt", "vin") SELECT "capacity", "createdAt", "currentMileage", "id", "licensePlate", "make", "model", "status", "type", "updatedAt", "vin" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
