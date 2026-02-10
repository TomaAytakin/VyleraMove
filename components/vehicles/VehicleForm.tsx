'use client'

import { Vehicle } from '@prisma/client'
import { createVehicle, updateVehicle, ActionState } from '@/app/actions/vehicles'
import { VehicleStatus, VehicleType } from '@/types/enums'
import { useActionState, useEffect } from 'react'

interface VehicleFormProps {
  vehicle?: Vehicle | null
  onClose: () => void
}

const initialState: ActionState = {
  success: false,
  message: '',
  error: ''
}

export default function VehicleForm({ vehicle, onClose }: VehicleFormProps) {
  const [state, formAction, isPending] = useActionState(
    vehicle ? updateVehicle.bind(null, vehicle.id) : createVehicle,
    initialState
  )

  useEffect(() => {
    if (state.success) {
      onClose()
    }
  }, [state.success, onClose])

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-zinc-400">Make</label>
            <input name="make" defaultValue={vehicle?.make} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none" />
        </div>
        <div>
            <label className="block text-sm font-medium text-zinc-400">Model</label>
            <input name="model" defaultValue={vehicle?.model} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none" />
        </div>
      </div>
       <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-zinc-400">Year</label>
            <input name="year" type="number" defaultValue={vehicle?.year || new Date().getFullYear()} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none" />
        </div>
         <div>
            <label className="block text-sm font-medium text-zinc-400">License Plate</label>
            <input name="licensePlate" defaultValue={vehicle?.licensePlate} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-zinc-400">VIN</label>
            <input name="vin" defaultValue={vehicle?.vin} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none" />
        </div>
        <div>
            <label className="block text-sm font-medium text-zinc-400">Capacity</label>
            <input name="capacity" type="number" defaultValue={vehicle?.capacity} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none" />
        </div>
      </div>

       <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-zinc-400">Type</label>
            <select name="type" defaultValue={vehicle?.type || ''} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none">
                <option value="" disabled>Select Type</option>
                {Object.values(VehicleType).map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
            </select>
        </div>
         <div>
            <label className="block text-sm font-medium text-zinc-400">Status</label>
            <select name="status" defaultValue={vehicle?.status || VehicleStatus.AVAILABLE} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none">
                 {Object.values(VehicleStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
        </div>
      </div>

      {vehicle && (
         <div>
            <label className="block text-sm font-medium text-zinc-400">Current Mileage</label>
            <input name="currentMileage" type="number" defaultValue={vehicle.currentMileage} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none" />
        </div>
      )}

      {state.error && <p className="text-red-500 text-sm">{state.error}</p>}

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
        <button type="submit" disabled={isPending} className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-50">
            {isPending ? 'Saving...' : (vehicle ? 'Update Vehicle' : 'Add Vehicle')}
        </button>
      </div>
    </form>
  )
}
