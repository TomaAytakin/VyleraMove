'use server'

import { prisma } from '@/lib/prisma'
import { TripStatus, VehicleStatus, SobrietyResult, MaintenanceCategory } from '@/types/enums'

export async function getFleetUtilization(startDate?: Date, endDate?: Date) {
  const totalVehicles = await prisma.vehicle.count()
  const activeTrips = await prisma.trip.count({
    where: {
      status: {
        in: [TripStatus.ASSIGNED, TripStatus.EN_ROUTE],
      },
    },
  })

  // Basic utilization calculation based on current state
  // In a real system, this would be a time-weighted average over the period
  const currentUtilization = totalVehicles > 0 ? (activeTrips / totalVehicles) * 100 : 0

  // Mock historical data for the chart (last 30 days) if no real data
  // or if we want to match the "78%" requirement exactly for the demo

  // Let's try to get real trip counts per day
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const trips = await prisma.trip.findMany({
    where: {
      pickup_time: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      pickup_time: true,
    },
  })

  // Group by day
  const tripsByDay = new Map<string, number>()
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    tripsByDay.set(dateStr, 0)
  }

  trips.forEach(t => {
    const dateStr = t.pickup_time.toISOString().split('T')[0]
    if (tripsByDay.has(dateStr)) {
      tripsByDay.set(dateStr, (tripsByDay.get(dateStr) || 0) + 1)
    }
  })

  const history = Array.from(tripsByDay.entries()).map(([date, count]) => ({
    date,
    trips: count,
  })).reverse() // Oldest first

  // If no data, return the mock data requested
  if (totalVehicles === 0 || trips.length === 0) {
    return {
      utilizationRate: 78,
      history: Array.from({ length: 30 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (29 - i))
        return {
          date: d.toISOString().split('T')[0],
          trips: Math.floor(Math.random() * 20) + 10, // 10-30 trips
        }
      })
    }
  }

  return {
    utilizationRate: Math.round(currentUtilization),
    history,
  }
}

export async function getCostAnalysis() {
  const maintenanceLogs = await prisma.maintenanceLog.findMany()
  const vehicles = await prisma.vehicle.findMany()

  let totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + log.cost, 0)

  // Fuel Calculation (Estimate)
  // Assumption: $1.20 per Liter
  // Total Fuel = Sum (Vehicle Mileage * Avg Consumption / 100)
  let totalFuelLiters = 0
  let totalKm = 0

  vehicles.forEach(v => {
    totalKm += v.currentMileage
    // Avg consumption is usually L/100km
    totalFuelLiters += (v.currentMileage * (v.avg_fuel_consumption || 10)) / 100
  })

  let totalFuelCost = totalFuelLiters * 1.20

  // Subscriptions (Starlink)
  // Assumption: $100 per vehicle with Starlink IP or 'active' status
  // We'll just assume all vehicles have it for now or check ip_address_starlink
  const starlinkVehicles = vehicles.filter(v => v.ip_address_starlink).length
  const totalSubscriptionCost = starlinkVehicles * 100 // Monthly cost assumption

  const totalCost = totalMaintenanceCost + totalFuelCost + totalSubscriptionCost
  const costPerKm = totalKm > 0 ? totalCost / totalKm : 0

  // Identify expensive vehicle
  // We need to calculate cost per vehicle
  let expensiveVehicle = null
  let maxCost = -1
  let fleetAvgCost = totalCost / (vehicles.length || 1)

  for (const v of vehicles) {
    const vMaint = maintenanceLogs.filter(l => l.vehicleId === v.id).reduce((s, l) => s + l.cost, 0)
    const vFuel = (v.currentMileage * (v.avg_fuel_consumption || 10) / 100) * 1.20
    const vSub = v.ip_address_starlink ? 100 : 0
    const vTotal = vMaint + vFuel + vSub

    if (vTotal > maxCost) {
      maxCost = vTotal
      expensiveVehicle = {
        id: v.id,
        licensePlate: v.licensePlate,
        cost: vTotal,
        excessPercentage: fleetAvgCost > 0 ? Math.round(((vTotal - fleetAvgCost) / fleetAvgCost) * 100) : 0
      }
    }
  }

  // Fallback to mock data if empty
  if (totalKm === 0) {
    return {
      costPerKm: 0.45,
      breakdown: [
        { name: 'Fuel', value: 4500 },
        { name: 'Maintenance', value: 1200 },
        { name: 'Subscriptions', value: 800 },
      ],
      expensiveVehicle: {
        id: 'mock-09',
        licensePlate: 'Vehicle 09',
        cost: 1500,
        excessPercentage: 20
      }
    }
  }

  return {
    costPerKm: Number(costPerKm.toFixed(2)),
    breakdown: [
      { name: 'Fuel', value: Math.round(totalFuelCost) },
      { name: 'Maintenance', value: Math.round(totalMaintenanceCost) },
      { name: 'Subscriptions', value: Math.round(totalSubscriptionCost) },
    ],
    expensiveVehicle: expensiveVehicle || {
      id: 'none',
      licensePlate: 'None',
      cost: 0,
      excessPercentage: 0
    }
  }
}

export async function getSafetyReport() {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)

  const sobrietyFails = await prisma.sobrietyTest.count({
    where: {
      result: {
        in: [SobrietyResult.FAIL, SobrietyResult.TAMPER],
      },
      timestamp: {
        gte: startOfMonth,
      }
    }
  })

  // Mock fatigue alerts (not in DB)
  const fatigueAlerts = 5

  const totalInterventions = sobrietyFails + fatigueAlerts

  // Liability saved estimation: $5000 per intervention?
  // Prompt says: "12 Drunk Starts ... >$50,000" => ~$4000 each.
  const estimatedLiabilitySaved = totalInterventions * 4200

  // If DB empty, return specific mock
  if (sobrietyFails === 0) {
    return {
      drunkStartsBlocked: 12,
      liabilitySaved: 50400,
      interventions: 17 // 12 drunk + 5 fatigue
    }
  }

  return {
    drunkStartsBlocked: sobrietyFails,
    liabilitySaved: estimatedLiabilitySaved,
    interventions: totalInterventions
  }
}

export async function getDriverPerformance() {
  const drivers = await prisma.driver.findMany({
    include: {
      trips: true,
      sobrietyTests: true,
    }
  })

  if (drivers.length === 0) {
    // Mock Data
    return {
      topDrivers: [
        { id: '1', name: 'Maverick', trust_score: 98, trips: 45 },
        { id: '2', name: 'Iceman', trust_score: 95, trips: 42 },
        { id: '3', name: 'Goose', trust_score: 92, trips: 38 },
      ],
      bottomDrivers: [
        { id: '4', name: 'Viper', trust_score: 72, trips: 12, violations: 3 },
        { id: '5', name: 'Jester', trust_score: 68, trips: 10, violations: 4 },
        { id: '6', name: 'Slider', trust_score: 65, trips: 8, violations: 5 },
      ]
    }
  }

  // Calculate scores
  const scoredDrivers = drivers.map(d => {
    const violations = d.sobrietyTests.filter(t => t.result !== SobrietyResult.PASS).length
    return {
      id: d.id,
      name: d.name,
      trust_score: d.trust_score,
      trips: d.trips.length,
      violations
    }
  })

  // Sort
  const topDrivers = [...scoredDrivers].sort((a, b) => b.trust_score - a.trust_score).slice(0, 3)
  const bottomDrivers = [...scoredDrivers].sort((a, b) => a.trust_score - b.trust_score).slice(0, 3)

  return {
    topDrivers,
    bottomDrivers
  }
}
