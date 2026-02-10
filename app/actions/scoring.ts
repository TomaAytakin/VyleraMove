'use server';

import { prisma } from '@/lib/prisma';
import { TripStatus, DriverStatus } from '@/types/enums';

// Function to simulate sending a push notification
async function sendPushNotification(managerId: string, message: string) {
  // In a real app, this would integrate with Firebase/OneSignal
  console.log(`[PUSH NOTIFICATION] To ${managerId}: ${message}`);
  return true;
}

export async function processSobrietyCheck(vehicleId: string, alcoholLevel: number) {
  try {
    // 1. Find the active trip for the vehicle (ASSIGNED or PENDING, about to start)
    // We assume the vehicle is assigned to a trip. If multiple, take the latest non-completed one.
    let trip = await prisma.trip.findFirst({
      where: {
        vehicleId: vehicleId,
        status: { in: [TripStatus.ASSIGNED, TripStatus.PENDING] },
      },
      orderBy: { createdAt: 'desc' },
      include: { driver: true, vehicle: true },
    });

    // AUTO-CREATE TRIP FOR SIMULATION if none exists
    if (!trip) {
      // Find an available driver or the vehicle's current driver
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: { currentDriver: true },
      });

      let driver = vehicle?.currentDriver;

      if (!driver) {
        // Fallback: Find first available driver
        const availableDriver = await prisma.driver.findFirst({
          where: { status: DriverStatus.AVAILABLE },
        });
        if (availableDriver) {
          driver = availableDriver;
        }
      }

      if (!driver) {
        return { success: false, message: 'No active trip and no available driver found for simulation.' };
      }

      // Create a dummy trip
      trip = await prisma.trip.create({
        data: {
          vehicleId: vehicleId,
          driverId: driver.id,
          status: TripStatus.PENDING,
          pickup_location: 'Simulation Start Point',
          dropoff_location: 'Simulation End Point',
          pickup_time: new Date(),
          guest_name: 'Simulation Guest',
        },
        include: { driver: true, vehicle: true },
      });
    }

    if (!trip || !trip.driver) {
      return { success: false, message: 'Failed to initialize trip context.' };
    }

    const driverId = trip.driver.id;

    // 2. Logic: If alcohol detected
    if (alcoholLevel > 0.0) {
      // Mark Trip as "FAILED_START"
      await prisma.trip.update({
        where: { id: trip.id },
        data: { status: TripStatus.FAILED_START },
      });

      // Set Driver.is_suspended = true, deduct 100 points
      const newTrustScore = Math.max(0, trip.driver.trust_score - 100);

      await prisma.driver.update({
        where: { id: driverId },
        data: {
          is_suspended: true,
          trust_score: newTrustScore,
          status: DriverStatus.SUSPENDED,
        },
      });

      // Create or Update TripTelemetry with failure
      await prisma.tripTelemetry.upsert({
        where: { tripId: trip.id },
        update: {
          alcohol_check_passed: false,
          alcohol_level: alcoholLevel,
        },
        create: {
          tripId: trip.id,
          alcohol_check_passed: false,
          alcohol_level: alcoholLevel,
          idle_time_minutes: 0, // Initial check
        },
      });

      // Send Push Notification
      await sendPushNotification('MANAGER_ROLE', `ALCOHOL DETECTED - VEHICLE ${trip.vehicle?.licensePlate || vehicleId}`);

      return {
        success: false,
        violation: true,
        message: 'CRITICAL VIOLATION: Alcohol detected. Driver suspended.',
      };
    } else {
      // Alcohol check passed
      // Create or Update TripTelemetry with success
      await prisma.tripTelemetry.upsert({
        where: { tripId: trip.id },
        update: {
          alcohol_check_passed: true,
          alcohol_level: 0.0,
        },
        create: {
          tripId: trip.id,
          alcohol_check_passed: true,
          alcohol_level: 0.0,
          idle_time_minutes: 0,
        },
      });

      // Optionally update trip status to EN_ROUTE if it was ASSIGNED?
      // The prompt implies "Engine Start is BLOCKED until...", so if 0.0, engine starts.
      // We might not change status here, just record telemetry.

      return { success: true, message: 'Sobriety check passed. Engine start allowed.' };
    }
  } catch (error) {
    console.error('Error in processSobrietyCheck:', error);
    return { success: false, message: 'Internal server error.' };
  }
}

export async function unlockDriver(driverId: string) {
  try {
    await prisma.driver.update({
      where: { id: driverId },
      data: {
        is_suspended: false,
        status: DriverStatus.AVAILABLE,
      },
    });
    return { success: true, message: 'Driver unlocked successfully.' };
  } catch (error) {
    console.error('Error in unlockDriver:', error);
    return { success: false, message: 'Failed to unlock driver.' };
  }
}

export async function analyzeTripEfficiency(tripId: string) {
  try {
    const telemetry = await prisma.tripTelemetry.findUnique({
      where: { tripId },
      include: { trip: { include: { driver: true, vehicle: true } } },
    });

    if (!telemetry || !telemetry.trip || !telemetry.trip.driver || !telemetry.trip.vehicle) {
      return { success: false, message: 'Telemetry or related data not found.' };
    }

    const { driver, vehicle } = telemetry.trip;
    let scoreDeduction = 0;
    const updates = [];

    // Logic: If idle_time_minutes > 30, deduct 20 points.
    if (telemetry.idle_time_minutes > 30) {
      scoreDeduction += 20;
      updates.push('Excessive Idle Time (-20)');
    }

    // Logic: If Fuel Consumption > Spec (Assuming 12.0 as spec), deduct 10 points.
    // Using vehicle.avg_fuel_consumption as the metric for this trip's impact
    const fuelSpec = 12.0;
    if (vehicle.avg_fuel_consumption > fuelSpec) {
      scoreDeduction += 10;
      updates.push('High Fuel Consumption (-10)');
    }

    if (scoreDeduction > 0) {
      const newTrustScore = Math.max(0, driver.trust_score - scoreDeduction);
      await prisma.driver.update({
        where: { id: driver.id },
        data: { trust_score: newTrustScore },
      });
      return {
        success: true,
        message: `Efficiency analyzed. Deducted ${scoreDeduction} points: ${updates.join(', ')}`,
        newScore: newTrustScore,
      };
    }

    return { success: true, message: 'Efficiency perfect. No deductions.' };

  } catch (error) {
    console.error('Error in analyzeTripEfficiency:', error);
    return { success: false, message: 'Internal server error.' };
  }
}
