'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { SobrietyResult, DriverStatus, TripStatus } from '@/types/enums'

export type ActionState = {
  success: boolean
  message?: string
  error?: string
}

async function sendManagerAlert(message: string) {
  // In a real application, this would send an SMS, Email, or Push Notification.
  console.log(`[MANAGER ALERT]: ${message}`)
}

export async function processBreathData(routerIp: string, rawString: string) {
  try {
    console.log(`Processing breath data from ${routerIp}: ${rawString}`)

    // 1. Find the vehicle
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        ip_address_starlink: routerIp,
      },
      include: {
        currentDriver: true,
      },
    })

    if (!vehicle) {
      console.error(`No vehicle found for IP: ${routerIp}`)
      return { success: false, error: 'Vehicle not found' }
    }

    // 2. Identify the driver
    // Priority 1: Vehicle's currentDriver relation
    let driver = vehicle.currentDriver

    // Priority 2: Active Trip
    if (!driver) {
      const activeTrip = await prisma.trip.findFirst({
        where: {
          vehicleId: vehicle.id,
          status: {
            in: [TripStatus.ASSIGNED, TripStatus.EN_ROUTE],
          },
        },
        include: {
          driver: true,
        },
      })
      if (activeTrip && activeTrip.driver) {
        driver = activeTrip.driver
      }
    }

    // Priority 3: Check Driver table for current_vehicle_id (should be covered by relation but just in case)
    if (!driver) {
       const assignedDriver = await prisma.driver.findUnique({
         where: {
           current_vehicle_id: vehicle.id
         }
       })
       if (assignedDriver) {
         driver = assignedDriver
       }
    }

    if (!driver) {
      console.error(`No driver associated with vehicle ${vehicle.licensePlate} (${vehicle.id})`)
      // We can't create a record without a driverId as per schema
      return { success: false, error: 'Driver not identified' }
    }

    // 3. Parse the data string
    // Expected format: "STX,DATE,TIME,STATUS,BAC_VALUE,ETX" or "DATE,TIME,STATUS,BAC_VALUE"
    // Example: "2026-02-12,08:00,F,0.05"

    // Clean up STX/ETX if present (assuming they are non-printable or specific chars, but here just comma split)
    const parts = rawString.split(',').map(s => s.trim())

    // We expect at least 4 parts: Date, Time, Status, BAC
    // If STX/ETX are present, we might have more.
    // Let's look for the status flag P/F/T.

    let statusIndex = -1
    for (let i = 0; i < parts.length; i++) {
      if (['P', 'F', 'T'].includes(parts[i])) {
        statusIndex = i
        break
      }
    }

    if (statusIndex === -1) {
       return { success: false, error: 'Invalid data format: Status not found' }
    }

    const statusChar = parts[statusIndex]
    const bacValueStr = parts[statusIndex + 1]
    const dateStr = parts[statusIndex - 2] // Assuming Date is 2 positions before Status
    const timeStr = parts[statusIndex - 1] // Assuming Time is 1 position before Status

    // If we can't find date/time relative to status, fallback to current time or try fixed indices
    // For the example "2026-02-12,08:00,F,0.05", status is index 2. Date index 0, Time index 1.
    // Correct.

    let timestamp = new Date()
    if (dateStr && timeStr) {
        // Construct ISO string or parse manually
        const dateTimeString = `${dateStr}T${timeStr}:00`
        const parsedDate = new Date(dateTimeString)
        if (!isNaN(parsedDate.getTime())) {
            timestamp = parsedDate
        }
    }

    const bacLevel = parseFloat(bacValueStr) || 0.0

    let result: SobrietyResult
    switch (statusChar) {
      case 'P':
        result = SobrietyResult.PASS
        break
      case 'F':
        result = SobrietyResult.FAIL
        break
      case 'T':
        result = SobrietyResult.TAMPER
        break
      default:
        // Should not happen due to check above
        result = SobrietyResult.FAIL
    }

    // 4. Create SobrietyTest Record
    await prisma.sobrietyTest.create({
      data: {
        timestamp,
        vehicleId: vehicle.id,
        driverId: driver.id,
        result,
        bac_level: bacLevel,
        is_override: false,
      },
    })

    // 5. Handle Logic based on Result
    if (result === SobrietyResult.FAIL || result === SobrietyResult.TAMPER) {
      // Lock Vehicle
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { immobilizer_active: true },
      })

      // Suspend Driver
      await prisma.driver.update({
        where: { id: driver.id },
        data: {
          status: DriverStatus.SUSPENDED,
          is_suspended: true,
        },
      })

      const alertMsg = result === SobrietyResult.FAIL
        ? `CRITICAL: ALCOHOL DETECTED (${bacLevel}%) - Driver ${driver.name} - Vehicle ${vehicle.licensePlate}`
        : `CRITICAL: TAMPER ATTEMPT - Driver ${driver.name} - Vehicle ${vehicle.licensePlate}`

      await sendManagerAlert(alertMsg)

    } else if (result === SobrietyResult.PASS) {
      // Unlock Vehicle
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { immobilizer_active: false },
      })
    }

    revalidatePath('/dashboard/safety')
    return { success: true }

  } catch (error) {
    console.error('Error processing breath data:', error)
    return { success: false, error: 'Internal Server Error' }
  }
}

export async function getSobrietyTests() {
  try {
    const tests = await prisma.sobrietyTest.findMany({
      take: 50,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        driver: {
          select: { name: true },
        },
        vehicle: {
          select: { licensePlate: true },
        },
      },
    })
    return tests
  } catch (error) {
    console.error('Error fetching sobriety tests:', error)
    return []
  }
}

export async function getTamperLogs() {
  try {
    const tests = await prisma.sobrietyTest.findMany({
      where: {
        result: SobrietyResult.TAMPER,
      },
      take: 50,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        driver: {
            select: { name: true },
        },
        vehicle: {
            select: { licensePlate: true },
        },
      },
    })
    return tests
  } catch (error) {
    console.error('Error fetching tamper logs:', error)
    return []
  }
}
