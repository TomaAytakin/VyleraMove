'use client'

import { Vehicle } from '@prisma/client'
import { Edit, Trash2 } from 'lucide-react'
import { deleteVehicle } from '@/app/actions/vehicles'
import { VehicleStatus, VehicleType } from '@/types/enums'

interface VehicleTableProps {
  vehicles: Vehicle[]
  onEdit: (vehicle: Vehicle) => void
}

export default function VehicleTable({ vehicles, onEdit }: VehicleTableProps) {
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      await deleteVehicle(id)
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900">
      <table className="w-full text-left text-sm text-zinc-400">
        <thead className="bg-zinc-950 text-xs uppercase text-zinc-400">
          <tr>
            <th className="px-6 py-3">Vehicle Info</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Capacity</th>
            <th className="px-6 py-3">Mileage</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id} className="hover:bg-zinc-800/50">
              <td className="px-6 py-4">
                <div className="font-medium text-zinc-100">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </div>
                <div className="text-xs text-zinc-500">{vehicle.licensePlate}</div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    vehicle.status === VehicleStatus.AVAILABLE
                      ? 'bg-green-500/10 text-green-500'
                      : vehicle.status === VehicleStatus.ON_TRIP
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {vehicle.status}
                </span>
              </td>
              <td className="px-6 py-4">
                 <span className={vehicle.type === VehicleType.VIP_LIMO ? 'text-amber-500 font-bold' : ''}>
                    {vehicle.type.replace('_', ' ')}
                 </span>
              </td>
              <td className="px-6 py-4">{vehicle.capacity} pax</td>
              <td className="px-6 py-4">{vehicle.currentMileage.toLocaleString()} mi</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(vehicle)}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
