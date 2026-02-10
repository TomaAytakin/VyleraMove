import { getVehicles } from '@/app/actions/vehicles'
import VehicleList from '@/components/vehicles/VehicleList'

export default async function VehiclesPage() {
  const { data: vehicles, error } = await getVehicles()

  if (error || !vehicles) {
    return <div className="text-red-500">Error loading vehicles: {error}</div>
  }

  return <VehicleList vehicles={vehicles} />
}
