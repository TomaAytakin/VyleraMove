'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import DriverTable from './DriverTable'
import DriverModal from './DriverModal'
import DriverForm from './DriverForm'
import { Prisma } from '@prisma/client'

type DriverWithVehicle = Prisma.DriverGetPayload<{
  include: { currentVehicle: true }
}>

interface DriverListProps {
  drivers: DriverWithVehicle[]
}

export default function DriverList({ drivers }: DriverListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<DriverWithVehicle | null>(null)

  const handleAdd = () => {
    setEditingDriver(null)
    setIsModalOpen(true)
  }

  const handleEdit = (driver: DriverWithVehicle) => {
    setEditingDriver(driver)
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingDriver(null)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Driver Roster</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400 transition-colors"
        >
          <Plus size={16} />
          Add Driver
        </button>
      </div>

      <DriverTable drivers={drivers} onEdit={handleEdit} />

      <DriverModal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingDriver ? 'Edit Driver' : 'Add New Driver'}
      >
        <DriverForm driver={editingDriver} onClose={handleClose} />
      </DriverModal>
    </>
  )
}
