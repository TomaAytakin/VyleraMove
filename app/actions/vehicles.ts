'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { VehicleStatus } from '@/types/enums'

export type ActionState = {
  success: boolean
  message?: string
  error?: string
}

export async function getVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { success: true, data: vehicles }
  } catch (error) {
    console.error('Failed to fetch vehicles:', error)
    return { success: false, error: 'Failed to fetch vehicles' }
  }
}

export async function createVehicle(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const make = formData.get('make') as string
    const model = formData.get('model') as string
    const year = parseInt(formData.get('year') as string)
    const licensePlate = formData.get('licensePlate') as string
    const vin = formData.get('vin') as string
    const capacity = parseInt(formData.get('capacity') as string)
    const type = formData.get('type') as string
    const status = (formData.get('status') as string) || VehicleStatus.AVAILABLE

    if (!make || !model || !year || !licensePlate || !vin || !capacity || !type) {
      return { success: false, error: 'Missing required fields' }
    }

    await prisma.vehicle.create({
      data: {
        make,
        model,
        year,
        licensePlate,
        vin,
        capacity,
        type,
        status,
        currentMileage: 0,
      },
    })

    revalidatePath('/dashboard/vehicles')
    return { success: true, message: 'Vehicle created successfully' }
  } catch (error) {
    console.error('Failed to create vehicle:', error)
    return { success: false, error: 'Failed to create vehicle' }
  }
}

export async function updateVehicle(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const make = formData.get('make') as string
    const model = formData.get('model') as string
    const year = parseInt(formData.get('year') as string)
    const licensePlate = formData.get('licensePlate') as string
    const vin = formData.get('vin') as string
    const capacity = parseInt(formData.get('capacity') as string)
    const type = formData.get('type') as string
    const status = formData.get('status') as string
    const currentMileage = parseInt(formData.get('currentMileage') as string)

    await prisma.vehicle.update({
      where: { id },
      data: {
        make,
        model,
        year,
        licensePlate,
        vin,
        capacity,
        type,
        status,
        currentMileage,
      },
    })

    revalidatePath('/dashboard/vehicles')
    return { success: true, message: 'Vehicle updated successfully' }
  } catch (error) {
    console.error('Failed to update vehicle:', error)
    return { success: false, error: 'Failed to update vehicle' }
  }
}

export async function deleteVehicle(id: string) {
  try {
    await prisma.vehicle.delete({
      where: { id },
    })
    revalidatePath('/dashboard/vehicles')
    return { success: true, message: 'Vehicle deleted successfully' }
  } catch (error) {
    console.error('Failed to delete vehicle:', error)
    return { success: false, error: 'Failed to delete vehicle' }
  }
}
