'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { TripStatus, VehicleStatus, DriverStatus } from '@/types/enums'

export async function createTrip(data: {
  guest_name: string
  guest_phone?: string
  pickup_location: string
  dropoff_location: string
  pickup_time: Date
  notes?: string
}) {
  try {
    await prisma.trip.create({
      data: {
        guest_name: data.guest_name,
        guest_phone: data.guest_phone,
        pickup_location: data.pickup_location,
        dropoff_location: data.dropoff_location,
        pickup_time: data.pickup_time,
        notes: data.notes,
        status: TripStatus.PENDING,
      },
    })
    revalidatePath('/dashboard/dispatch')
    return { success: true }
  } catch (error) {
    console.error('Error creating trip:', error)
    return { success: false, error: 'Failed to create trip' }
  }
}

export async function assignTrip(tripId: string, vehicleId: string, driverId: string) {
  try {
    // Transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Update Trip
      await tx.trip.update({
        where: { id: tripId },
        data: {
          status: TripStatus.ASSIGNED,
          vehicleId,
          driverId,
        },
      })

      // Update Vehicle
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: VehicleStatus.ON_TRIP },
      })

      // Update Driver
      await tx.driver.update({
        where: { id: driverId },
        data: { status: DriverStatus.ON_TRIP },
      })
    })

    revalidatePath('/dashboard/dispatch')
    return { success: true }
  } catch (error) {
    console.error('Error assigning trip:', error)
    return { success: false, error: 'Failed to assign trip' }
  }
}

export async function completeTrip(tripId: string) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    })

    if (!trip) throw new Error('Trip not found')

    await prisma.$transaction(async (tx) => {
      await tx.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.COMPLETED },
      })

      if (trip.vehicleId) {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VehicleStatus.AVAILABLE },
        })
      }

      if (trip.driverId) {
        await tx.driver.update({
          where: { id: trip.driverId },
          data: { status: DriverStatus.AVAILABLE },
        })
      }
    })

    revalidatePath('/dashboard/dispatch')
    return { success: true }
  } catch (error) {
    console.error('Error completing trip:', error)
    return { success: false, error: 'Failed to complete trip' }
  }
}

export async function getPendingTrips() {
  return await prisma.trip.findMany({
    where: { status: TripStatus.PENDING },
    orderBy: { pickup_time: 'asc' },
  })
}

export async function getActiveTrips() {
  return await prisma.trip.findMany({
    where: {
      status: {
        in: [TripStatus.ASSIGNED, TripStatus.EN_ROUTE],
      },
    },
    include: {
      vehicle: true,
      driver: true,
    },
    orderBy: { pickup_time: 'asc' },
  })
}

export async function getAvailableVehicles() {
  return await prisma.vehicle.findMany({
    where: {
      status: VehicleStatus.AVAILABLE,
    },
  })
}

export async function getAvailableDrivers() {
  return await prisma.driver.findMany({
    where: {
      status: DriverStatus.AVAILABLE,
    },
  })
}
