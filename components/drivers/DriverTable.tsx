'use client'

import { Prisma } from '@prisma/client'
import { Edit, Trash2 } from 'lucide-react'
import { deleteDriver } from '@/app/actions/drivers'
import { DriverStatus } from '@/types/enums'

type DriverWithVehicle = Prisma.DriverGetPayload<{
  include: { currentVehicle: true }
}>

interface DriverTableProps {
  drivers: DriverWithVehicle[]
  onEdit: (driver: DriverWithVehicle) => void
}

export default function DriverTable({ drivers, onEdit }: DriverTableProps) {
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      await deleteDriver(id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case DriverStatus.AVAILABLE:
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case DriverStatus.ON_TRIP:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case DriverStatus.OFF_DUTY:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
      case DriverStatus.SUSPENDED:
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
      <table className="w-full text-left text-sm text-zinc-400">
        <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-6 py-3 font-medium">Profile</th>
            <th className="px-6 py-3 font-medium">Contact</th>
            <th className="px-6 py-3 font-medium">Languages</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium">Current Vehicle</th>
            <th className="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {drivers.map((driver) => (
            <tr key={driver.id} className="hover:bg-zinc-800/50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-medium">
                    {driver.name.charAt(0)}
                  </div>
                  <div className="font-medium text-zinc-200">{driver.name}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <a href={`tel:${driver.phone}`} className="text-zinc-300 hover:text-amber-500 transition-colors">
                  {driver.phone}
                </a>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {driver.languages.split(',').map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300 border border-zinc-700"
                    >
                      {lang.trim()}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${getStatusColor(
                    driver.status
                  )}`}
                >
                  {driver.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4">
                {driver.currentVehicle ? (
                  <span className="text-zinc-300 font-mono">
                    {driver.currentVehicle.licensePlate}
                  </span>
                ) : (
                  <span className="text-zinc-600 italic">None</span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(driver)}
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-amber-500 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(driver.id)}
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {drivers.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                No drivers found. Add one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
