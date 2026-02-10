'use client';

import { useState } from 'react';
import { unlockDriver } from '@/app/actions/scoring';
import { Driver } from '@prisma/client';
import { AlertCircle, CheckCircle, Unlock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ActiveSuspensionsProps {
  suspendedDrivers: Driver[];
}

export default function ActiveSuspensions({ suspendedDrivers }: ActiveSuspensionsProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUnlock = async (driverId: string) => {
    setLoadingId(driverId);
    try {
      const result = await unlockDriver(driverId);
      if (result.success) {
        // Refresh the page to update the list
        router.refresh();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to unlock driver.');
    } finally {
      setLoadingId(null);
    }
  };

  if (suspendedDrivers.length === 0) {
    return (
      <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-4 flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-emerald-500" />
        <div>
          <h3 className="font-semibold text-emerald-100">All Clear</h3>
          <p className="text-sm text-emerald-400">No active driver suspensions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-950/30 border border-red-500/50 rounded-lg overflow-hidden animate-pulse-subtle">
      <div className="bg-red-900/40 p-3 border-b border-red-500/30 flex justify-between items-center">
        <div className="flex items-center gap-2 text-red-100 font-bold">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span>Active Suspensions ({suspendedDrivers.length})</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {suspendedDrivers.map((driver) => (
          <div key={driver.id} className="flex items-center justify-between bg-zinc-900/50 p-3 rounded border border-red-900/50">
            <div>
              <p className="font-medium text-zinc-100">{driver.name}</p>
              <p className="text-xs text-red-400">Suspended due to Violation</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                <span>Trust Score: {driver.trust_score}</span>
              </div>
            </div>
            <button
              onClick={() => handleUnlock(driver.id)}
              disabled={loadingId === driver.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded transition-colors disabled:opacity-50"
            >
              {loadingId === driver.id ? (
                'Unlocking...'
              ) : (
                <>
                  <Unlock className="w-3 h-3" />
                  Override & Unlock
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
