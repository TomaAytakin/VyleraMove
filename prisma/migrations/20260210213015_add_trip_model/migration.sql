/*
  Warnings:

  - You are about to drop the column `dropoffLocation` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `flightNumber` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `guestName` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `guestNotes` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLocation` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `pickupTime` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `roomNumber` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `dropoff_location` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guest_name` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickup_location` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickup_time` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guest_name" TEXT NOT NULL,
    "guest_phone" TEXT,
    "pickup_location" TEXT NOT NULL,
    "dropoff_location" TEXT NOT NULL,
    "pickup_time" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("createdAt", "driverId", "id", "status", "updatedAt", "vehicleId") SELECT "createdAt", "driverId", "id", "status", "updatedAt", "vehicleId" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
