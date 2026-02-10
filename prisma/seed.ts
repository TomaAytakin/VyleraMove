import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Note: We use local enums here to avoid ESM/CJS interop issues with ts-node when running the seed script.
// These values MUST match the ones in types/enums.ts.

// User Roles
const UserRole = {
  ADMIN: 'ADMIN',
  DISPATCHER: 'DISPATCHER',
  DRIVER: 'DRIVER',
}

// Vehicle Status
const VehicleStatus = {
  AVAILABLE: 'AVAILABLE',
  ON_TRIP: 'ON_TRIP',
  MAINTENANCE: 'MAINTENANCE',
}

// Vehicle Type
const VehicleType = {
  VIP_LIMO: 'VIP_LIMO',
  SUV: 'SUV',
  SHUTTLE_VAN: 'SHUTTLE_VAN',
}

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password123', 10)

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vyleramove.com' },
    update: {},
    create: {
      email: 'admin@vyleramove.com',
      name: 'Admin User',
      password,
      role: UserRole.ADMIN,
    },
  })

  // Create Driver
  const driver = await prisma.user.upsert({
    where: { email: 'driver@vyleramove.com' },
    update: {},
    create: {
      email: 'driver@vyleramove.com',
      name: 'John Driver',
      password,
      role: UserRole.DRIVER,
    },
  })

  // Create Vehicles
  const mercedes = await prisma.vehicle.upsert({
    where: { licensePlate: 'VIP-001' },
    update: {},
    create: {
      make: 'Mercedes-Benz',
      model: 'S-Class',
      licensePlate: 'VIP-001',
      vin: 'ABC123456789',
      capacity: 3,
      status: VehicleStatus.AVAILABLE,
      type: VehicleType.VIP_LIMO,
      currentMileage: 5000,
    },
  })

  const alphard = await prisma.vehicle.upsert({
    where: { licensePlate: 'VIP-002' },
    update: {},
    create: {
      make: 'Toyota',
      model: 'Alphard',
      licensePlate: 'VIP-002',
      vin: 'DEF987654321',
      capacity: 6,
      status: VehicleStatus.AVAILABLE,
      type: VehicleType.SHUTTLE_VAN,
      currentMileage: 12000,
    },
  })

  console.log({ admin, driver, mercedes, alphard })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
