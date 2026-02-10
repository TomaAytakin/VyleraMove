'use client'

import { Vehicle } from '@prisma/client'
import { useState } from 'react'
import VehicleTable from './VehicleTable'
import VehicleModal from './VehicleModal'
import VehicleForm from './VehicleForm'
import { Plus } from 'lucide-react'

interface VehicleListProps {
  vehicles: Vehicle[]
}

export default function VehicleList({ vehicles }: VehicleListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  const handleAdd = () => {
    setEditingVehicle(null)
    setIsModalOpen(true)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingVehicle(null)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Vehicle Inventory</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400 transition-colors"
        >
          <Plus size={16} />
          Add Vehicle
        </button>
      </div>

      <VehicleTable vehicles={vehicles} onEdit={handleEdit} />

      <VehicleModal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      >
        <VehicleForm vehicle={editingVehicle} onClose={handleClose} />
      </VehicleModal>
    </>
  )
}
