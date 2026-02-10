'use client'

import { Prisma } from '@prisma/client'
import { createDriver, updateDriver, ActionState } from '@/app/actions/drivers'
import { DriverStatus } from '@/types/enums'
import { useActionState, useEffect } from 'react'

type DriverWithVehicle = Prisma.DriverGetPayload<{
  include: { currentVehicle: true }
}>

interface DriverFormProps {
  driver?: DriverWithVehicle | null
  onClose: () => void
}

const initialState: ActionState = {
  success: false,
  message: '',
  error: ''
}

export default function DriverForm({ driver, onClose }: DriverFormProps) {
    const action = driver ? updateDriver.bind(null, driver.id) : createDriver

    const [state, formAction, isPending] = useActionState(action, initialState)

    useEffect(() => {
        if (state.success) {
            onClose()
        }
    }, [state.success, onClose])

    return (
        <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-400">Full Name</label>
                    <input name="name" defaultValue={driver?.name} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none" placeholder="e.g. Sokha" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-400">Phone Number</label>
                    <input name="phone" defaultValue={driver?.phone} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none" placeholder="+855 12 345 678" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-400">License Number</label>
                    <input name="license_number" defaultValue={driver?.license_number} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-400">License Expiry</label>
                    <input
                        name="license_expiry"
                        type="date"
                        defaultValue={driver?.license_expiry ? new Date(driver.license_expiry).toISOString().split('T')[0] : ''}
                        required
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-400">Languages Spoken</label>
                <input name="languages" defaultValue={driver?.languages} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none" placeholder="e.g. English, Chinese, Khmer" />
                <p className="text-xs text-zinc-500 mt-1">Comma-separated list of languages.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-zinc-400">Status</label>
                    <select name="status" defaultValue={driver?.status || DriverStatus.AVAILABLE} required className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none">
                        {Object.values(DriverStatus).map(status => (
                            <option key={status} value={status}>{status.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-400">RFID Tag ID</label>
                    <input name="rfid_card_id" defaultValue={driver?.rfid_card_id || ''} className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none" placeholder="Scan Card ID" />
                </div>
            </div>

            {driver && (
                 <div>
                    <label className="block text-sm font-medium text-zinc-400">Current Vehicle ID</label>
                    <input
                        name="current_vehicle_id"
                        defaultValue={driver.current_vehicle_id || ''}
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
                        placeholder="Leave empty to unassign"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Enter Vehicle ID to assign. Warning: Ensure vehicle is not already assigned.</p>
                </div>
            )}

            {state.error && <p className="text-red-500 text-sm">{state.error}</p>}

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={isPending} className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400 disabled:opacity-50">
                    {isPending ? 'Saving...' : (driver ? 'Update Driver' : 'Add Driver')}
                </button>
            </div>
        </form>
    )
}
