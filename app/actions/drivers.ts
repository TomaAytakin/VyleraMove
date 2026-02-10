'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { DriverStatus } from '@/types/enums'

export type ActionState = {
  success: boolean
  message?: string
  error?: string
  data?: any
}

export async function getDrivers() {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        currentVehicle: true,
      },
    })
    return { success: true, data: drivers }
  } catch (error) {
    console.error('Failed to fetch drivers:', error)
    return { success: false, error: 'Failed to fetch drivers' }
  }
}

export async function createDriver(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const license_number = formData.get('license_number') as string
    const licenseExpiryString = formData.get('license_expiry') as string
    const license_expiry = licenseExpiryString ? new Date(licenseExpiryString) : undefined
    const rfid_card_id = (formData.get('rfid_card_id') as string) || null
    const languages = formData.get('languages') as string
    const status = (formData.get('status') as string) || DriverStatus.AVAILABLE

    // Validate required fields
    if (!name || !phone || !license_number || !license_expiry || !languages) {
        return { success: false, error: 'Missing required fields' }
    }

    await prisma.driver.create({
      data: {
        name,
        phone,
        license_number,
        license_expiry,
        rfid_card_id,
        languages,
        status,
        rating: 5.0, // Default
      },
    })

    revalidatePath('/dashboard/drivers')
    return { success: true, message: 'Driver created successfully' }
  } catch (error) {
    console.error('Failed to create driver:', error)
    // Check for unique constraint violation
    if ((error as any).code === 'P2002') {
        return { success: false, error: 'Driver with this RFID or License Number already exists' }
    }
    return { success: false, error: 'Failed to create driver' }
  }
}

export async function updateDriver(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const license_number = formData.get('license_number') as string
    const licenseExpiryString = formData.get('license_expiry') as string
    const license_expiry = licenseExpiryString ? new Date(licenseExpiryString) : undefined
    const rfid_card_id = (formData.get('rfid_card_id') as string) || null
    const languages = formData.get('languages') as string
    const status = formData.get('status') as string

    // Optional: current_vehicle_id
    const current_vehicle_id = formData.get('current_vehicle_id') as string

    const data: any = {
      name,
      phone,
      license_number,
      rfid_card_id,
      languages,
      status,
    }

    if (license_expiry) {
        data.license_expiry = license_expiry
    }

    if (current_vehicle_id !== null && current_vehicle_id !== undefined) {
        if (current_vehicle_id === '') {
             data.current_vehicle_id = null
        } else {
             data.current_vehicle_id = current_vehicle_id
        }
    }

    await prisma.driver.update({
      where: { id },
      data: data,
    })

    revalidatePath('/dashboard/drivers')
    return { success: true, message: 'Driver updated successfully' }
  } catch (error) {
    console.error('Failed to update driver:', error)
    if ((error as any).code === 'P2002') {
        return { success: false, error: 'Driver with this RFID or License Number already exists' }
    }
    return { success: false, error: 'Failed to update driver' }
  }
}

export async function deleteDriver(id: string) {
  try {
    await prisma.driver.delete({
      where: { id },
    })
    revalidatePath('/dashboard/drivers')
    return { success: true, message: 'Driver deleted successfully' }
  } catch (error) {
    console.error('Failed to delete driver:', error)
    return { success: false, error: 'Failed to delete driver' }
  }
}
