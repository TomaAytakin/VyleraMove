import { getPendingTrips, getActiveTrips, getAvailableVehicles, getAvailableDrivers, createTrip, assignTrip, completeTrip } from '@/app/actions/trips';
import DispatchBoard from './DispatchBoard';

export default async function DispatchPage() {
  const pendingTrips = await getPendingTrips();
  const activeTrips = await getActiveTrips();
  const availableVehicles = await getAvailableVehicles();
  const availableDrivers = await getAvailableDrivers();

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Dispatch Board</h1>
      </header>

      <div className="flex-1 overflow-hidden">
        <DispatchBoard
          pendingTrips={pendingTrips}
          activeTrips={activeTrips}
          availableVehicles={availableVehicles}
          availableDrivers={availableDrivers}
          createTrip={createTrip}
          assignTrip={assignTrip}
          completeTrip={completeTrip}
        />
      </div>
    </div>
  );
}
