import { prisma } from '@/lib/prisma'
import MaintenanceClient from './MaintenanceClient'

export const dynamic = 'force-dynamic'

export default async function MaintenancePage() {
  const vehicles = await prisma.vehicle.findMany({
    select: {
      id: true,
      licensePlate: true,
      make: true,
      model: true,
    }
  })

  const drivers = await prisma.driver.findMany({
    select: {
      id: true,
      name: true,
    }
  })

  const logsRaw = await prisma.maintenanceLog.findMany({
    orderBy: { date: 'desc' },
    take: 20,
    include: {
      vehicle: {
        select: { licensePlate: true, make: true, model: true }
      },
      driver: {
        select: { name: true, trust_score: true, kpi_grade: true }
      }
    }
  })

  // Serialize logs dates
  const logs = logsRaw.map(log => ({
    ...log,
    date: log.date.toISOString(),
  }))

  // Mock Subscriptions (or fetch real if data exists)
  const now = new Date()
  const nextMonth = new Date()
  nextMonth.setMonth(now.getMonth() + 1)

  const expiringSubscriptionsRaw = await prisma.vehicle.findMany({
    where: {
      subscription_starlink_due: {
        lte: nextMonth,
        gte: now
      }
    },
    select: {
      id: true,
      licensePlate: true,
      subscription_starlink_due: true
    }
  })

  const expiringSubscriptions = expiringSubscriptionsRaw.map(sub => ({
    ...sub,
    subscription_starlink_due: sub.subscription_starlink_due ? sub.subscription_starlink_due.toISOString() : null
  }))

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-white">Health & Maintenance</h1>
      </header>

      <main className="flex-1 overflow-hidden">
        <MaintenanceClient
          vehicles={vehicles}
          drivers={drivers}
          logs={logs}
          subscriptions={expiringSubscriptions}
        />
      </main>
    </div>
  )
}
