import { getDrivers } from '@/app/actions/drivers'
import DriverList from '@/components/drivers/DriverList'

export default async function DriversPage() {
  const { data: drivers, error } = await getDrivers()

  if (error || !drivers) {
    return <div className="text-red-500">Error loading drivers: {error}</div>
  }

  return <DriverList drivers={drivers} />
}
