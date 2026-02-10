'use client';

import { useState } from 'react';
import { Car, User, MapPin, Clock, Plus, CheckCircle2, AlertCircle, Phone, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateTripData {
  guest_name: string;
  guest_phone?: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_time: Date;
  notes?: string;
}

interface Trip {
  id: string;
  guest_name: string;
  guest_phone?: string | null;
  pickup_location: string;
  dropoff_location: string;
  pickup_time: Date;
  status: string;
  notes?: string | null;
  vehicle?: { id: string; make: string; model: string; licensePlate: string } | null;
  driver?: { id: string; name: string } | null;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  capacity: number;
}

interface Driver {
  id: string;
  name: string;
  status: string;
}

interface DispatchBoardProps {
  pendingTrips: Trip[];
  activeTrips: Trip[];
  availableVehicles: Vehicle[];
  availableDrivers: Driver[];
  createTrip: (data: CreateTripData) => Promise<{ success: boolean; error?: string }>;
  assignTrip: (tripId: string, vehicleId: string, driverId: string) => Promise<{ success: boolean; error?: string }>;
  completeTrip: (tripId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function DispatchBoard({
  pendingTrips,
  activeTrips,
  availableVehicles,
  availableDrivers,
  createTrip,
  assignTrip,
  completeTrip,
}: DispatchBoardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  const handleCreateTrip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      guest_name: formData.get('guest_name') as string,
      guest_phone: formData.get('guest_phone') as string,
      pickup_location: formData.get('pickup_location') as string,
      dropoff_location: formData.get('dropoff_location') as string,
      pickup_time: new Date(formData.get('pickup_time') as string),
      notes: formData.get('notes') as string,
    };

    const result = await createTrip(data);
    if (result.success) {
      setIsCreateModalOpen(false);
      router.refresh();
    } else {
      alert('Failed to create trip');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden">
      {/* Left Column: Pending Requests */}
      <div className="flex flex-col bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden h-full">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Requests
            <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full ml-2">
              {pendingTrips.length}
            </span>
          </h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-zinc-900 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {pendingTrips.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p>No pending trips.</p>
            </div>
          ) : (
            pendingTrips.map((trip) => (
              <PendingTripCard
                key={trip.id}
                trip={trip}
                vehicles={availableVehicles}
                drivers={availableDrivers}
                onAssign={assignTrip}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Column: Active Operations */}
      <div className="flex flex-col bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden h-full">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Active Operations
            <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full ml-2">
              {activeTrips.length}
            </span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {activeTrips.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p>No active operations.</p>
            </div>
          ) : (
            activeTrips.map((trip) => (
              <ActiveTripCard
                key={trip.id}
                trip={trip}
                onComplete={completeTrip}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Trip Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="text-lg font-semibold text-zinc-100">Create New Trip</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTrip} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Guest Name</label>
                <input
                  type="text"
                  name="guest_name"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Mr. Bond"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Guest Phone (Optional)</label>
                <input
                  type="tel"
                  name="guest_phone"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Pickup Location</label>
                  <input
                    type="text"
                    name="pickup_location"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Casino Lobby"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Dropoff Location</label>
                  <input
                    type="text"
                    name="dropoff_location"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Airport"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Pickup Time</label>
                <input
                  type="datetime-local"
                  name="pickup_time"
                  required
                  defaultValue={new Date().toISOString().slice(0, 16)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Notes (Optional)</label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. VIP, requires red carpet"
                />
              </div>
              <div className="flex justify-end pt-4 gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-900 rounded-lg text-sm font-medium transition-colors"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PendingTripCard({ trip, vehicles, drivers, onAssign }: {
  trip: Trip;
  vehicles: Vehicle[];
  drivers: Driver[];
  onAssign: (tripId: string, vehicleId: string, driverId: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const router = useRouter();

  const handleAssign = async () => {
    if (!selectedVehicle || !selectedDriver) return;
    setIsAssigning(true);
    const result = await onAssign(trip.id, selectedVehicle, selectedDriver);
    if (result.success) {
      router.refresh();
    } else {
      alert('Failed to assign trip');
    }
    setIsAssigning(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-zinc-100 text-lg">{trip.guest_name}</h3>
          {trip.guest_phone && (
            <div className="flex items-center text-zinc-400 text-sm mt-1">
              <Phone className="w-3 h-3 mr-1" />
              {trip.guest_phone}
            </div>
          )}
        </div>
        <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded border border-amber-500/20 uppercase tracking-wider font-medium">
          {trip.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-zinc-500 text-xs block mb-1">Pickup</span>
          <div className="flex items-start text-zinc-300">
            <MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-zinc-500" />
            <span>{trip.pickup_location}</span>
          </div>
        </div>
        <div>
          <span className="text-zinc-500 text-xs block mb-1">Dropoff</span>
          <div className="flex items-start text-zinc-300">
            <MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-zinc-500" />
            <span>{trip.dropoff_location}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center text-zinc-400 text-sm mb-4">
        <Clock className="w-3.5 h-3.5 mr-1.5" />
        {new Date(trip.pickup_time).toLocaleString()}
      </div>

      {trip.notes && (
        <div className="bg-zinc-800/50 p-2 rounded text-zinc-300 text-sm mb-4 flex items-start gap-2">
          <FileText className="w-4 h-4 text-zinc-500 mt-0.5" />
          <p>{trip.notes}</p>
        </div>
      )}

      <div className="space-y-3 pt-3 border-t border-zinc-800">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Assign Vehicle</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.make} {v.model} ({v.licensePlate})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Assign Driver</label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select Driver</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAssign}
          disabled={!selectedVehicle || !selectedDriver || isAssigning}
          className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${
            selectedVehicle && selectedDriver
              ? 'bg-amber-500 hover:bg-amber-600 text-zinc-900'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          {isAssigning ? 'Assigning...' : 'Assign & Dispatch'}
        </button>
      </div>
    </div>
  );
}

function ActiveTripCard({ trip, onComplete }: {
  trip: Trip;
  onComplete: (tripId: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    if (!confirm('Are you sure you want to complete this trip?')) return;
    setIsCompleting(true);
    const result = await onComplete(trip.id);
    if (result.success) {
      router.refresh();
    } else {
      alert('Failed to complete trip');
    }
    setIsCompleting(false);
  };

  const isEnRoute = trip.status === 'EN_ROUTE';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-zinc-100 text-lg">{trip.guest_name}</h3>
          <div className="flex items-center gap-3 text-sm mt-1">
             <div className="flex items-center text-zinc-400">
                <User className="w-3.5 h-3.5 mr-1" />
                {trip.driver?.name}
             </div>
             <div className="flex items-center text-zinc-400">
                <Car className="w-3.5 h-3.5 mr-1" />
                {trip.vehicle?.licensePlate}
             </div>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded border uppercase tracking-wider font-medium ${
          isEnRoute
            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        }`}>
          {trip.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-zinc-500 text-xs block mb-1">Pickup</span>
          <div className="flex items-start text-zinc-300">
            <MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-zinc-500" />
            <span>{trip.pickup_location}</span>
          </div>
        </div>
        <div>
          <span className="text-zinc-500 text-xs block mb-1">Dropoff</span>
          <div className="flex items-start text-zinc-300">
            <MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-zinc-500" />
            <span>{trip.dropoff_location}</span>
          </div>
        </div>
      </div>

      {trip.notes && (
        <div className="bg-zinc-800/50 p-2 rounded text-zinc-300 text-sm mb-4">
          <p className="flex items-center gap-2">
             <AlertCircle className="w-4 h-4 text-amber-500" />
             {trip.notes}
          </p>
        </div>
      )}

      <div className="flex justify-end pt-2 border-t border-zinc-800">
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded text-sm font-medium transition-colors border border-zinc-700 hover:border-zinc-600"
        >
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          {isCompleting ? 'Completing...' : 'Mark Complete'}
        </button>
      </div>
    </div>
  );
}
