'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { MaintenanceCategory, KPIGrade } from '@/types/enums'
import fs from 'fs/promises'
import path from 'path'

export async function uploadInvoice(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) {
    return { success: false, error: 'No file uploaded' }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
  const publicPath = path.join(process.cwd(), 'public', 'uploads')

  try {
    await fs.mkdir(publicPath, { recursive: true })
    await fs.writeFile(path.join(publicPath, filename), buffer)

    // In production, this would be an S3 URL or similar.
    // For local dev, we serve from public/uploads
    const url = `/uploads/${filename}`

    return { success: true, url }
  } catch (error) {
    console.error('Error uploading file:', error)
    return { success: false, error: 'Failed to upload file' }
  }
}

export async function processInvoiceAI(imageUrl: string) {
  // TODO: Call Gemini API here to extract Cost, Date, and classify Category.
  console.log('Processing invoice:', imageUrl)

  // Mock Logic for now
  // Simulating AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  return {
    success: true,
    data: {
      cost: 150.00,
      category: MaintenanceCategory.ACCIDENT, // Hardcoded as per prompt requirement ("classify it as an 'Accident'")
      date: new Date().toISOString(),
      ocr_raw_text: "INVOICE #1234\nREPAIR BUMPER\nTOTAL: $150.00",
      ai_analysis: {
        opinion: "Price seems reasonable for bumper repair.",
        confidence: 0.95
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateDriverScore(driverId: string, category: string, _cost: number) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId }
  })

  if (!driver) {
    throw new Error('Driver not found')
  }

  let deduction = 0
  if (category === MaintenanceCategory.ACCIDENT) {
    deduction = 10
  } else if (category === MaintenanceCategory.NON_WEAR_DAMAGE) {
    deduction = 5
  }
  // WEAR_AND_TEAR: no deduction

  let newScore = driver.trust_score - deduction
  if (newScore < 0) newScore = 0
  if (newScore > 100) newScore = 100 // Should not happen with deduction but good safety

  let newGrade = driver.kpi_grade
  if (newScore >= 97) newGrade = KPIGrade.A_PLUS
  else if (newScore >= 90) newGrade = KPIGrade.A
  else if (newScore >= 80) newGrade = KPIGrade.B
  else if (newScore >= 70) newGrade = KPIGrade.C
  else if (newScore >= 60) newGrade = KPIGrade.D
  else newGrade = KPIGrade.F

  await prisma.driver.update({
    where: { id: driverId },
    data: {
      trust_score: newScore,
      kpi_grade: newGrade
    }
  })

  return { newScore, newGrade }
}

export async function createMaintenanceLog(data: {
  vehicleId: string
  driverId: string
  cost: number
  category: string
  invoice_url: string
  ocr_raw_text?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ai_analysis_json?: any
  date: Date
}) {
  try {
    // 1. Create Maintenance Log
    const log = await prisma.maintenanceLog.create({
      data: {
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        cost: data.cost,
        category: data.category,
        invoice_url: data.invoice_url,
        ocr_raw_text: data.ocr_raw_text,
        ai_analysis_json: data.ai_analysis_json ? JSON.stringify(data.ai_analysis_json) : null,
        date: data.date
      }
    })

    // 2. Update Driver Score
    await updateDriverScore(data.driverId, data.category, data.cost)

    revalidatePath('/dashboard/maintenance')
    revalidatePath('/dashboard/drivers') // Assuming drivers page exists or will exist

    return { success: true, log }
  } catch (error) {
    console.error('Error creating maintenance log:', error)
    return { success: false, error: 'Failed to create maintenance log' }
  }
}

export async function getMaintenanceLogs() {
  return await prisma.maintenanceLog.findMany({
    orderBy: { date: 'desc' },
    include: {
      vehicle: true,
      driver: true
    }
  })
}

export async function getExpiringSubscriptions() {
  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(now.getDate() + 30)

  return await prisma.vehicle.findMany({
    where: {
      subscription_starlink_due: {
        lte: thirtyDaysFromNow,
        gte: now
      }
    }
  })
}
