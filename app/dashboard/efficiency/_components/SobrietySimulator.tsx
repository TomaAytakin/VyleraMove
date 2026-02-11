'use client';

import { useState } from 'react';
import { processSobrietyCheck } from '@/app/actions/scoring';
import { Vehicle } from '@prisma/client';
import { FlaskConical, Play, RefreshCw, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SobrietySimulatorProps {
  vehicles: Vehicle[];
}

export default function SobrietySimulator({ vehicles }: SobrietySimulatorProps) {
  const router = useRouter();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [alcoholLevel, setAlcoholLevel] = useState<number>(0.0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; violation?: boolean } | null>(null);

  const handleTest = async () => {
    if (!selectedVehicleId) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await processSobrietyCheck(selectedVehicleId, alcoholLevel);
      setResult(res);
      if (res.violation) {
        // Force refresh to update dashboard state immediately
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setResult({ success: false, message: 'Simulation failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
        <div className="bg-blue-900/20 p-2 rounded-lg text-blue-500">
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100">Sobriety Check Simulator</h3>
          <p className="text-xs text-zinc-500">Test driver compliance manually</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">Select Vehicle</label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.licensePlate} - {v.make} {v.model}
              </option>
            ))}
            {vehicles.length === 0 && <option disabled>No vehicles available</option>}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide flex justify-between">
            Alcohol Level (BAC)
            <span className={alcoholLevel > 0 ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>
              {alcoholLevel.toFixed(3)}%
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="0.2"
            step="0.001"
            value={alcoholLevel}
            onChange={(e) => setAlcoholLevel(parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 focus:accent-blue-600"
          />
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>0.00 (Pass)</span>
            <span className="text-red-500/50">0.08 (Legal Limit)</span>
            <span className="text-red-600">0.20 (Critical)</span>
          </div>
        </div>

        <button
          onClick={handleTest}
          disabled={loading || !selectedVehicleId}
          className={`w-full py-2.5 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all ${
            alcoholLevel > 0
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Run Breathalyzer Test
            </>
          )}
        </button>

        {result && (
          <div className={`mt-4 p-3 rounded text-sm flex items-start gap-2 ${
            result.violation
              ? 'bg-red-950/40 text-red-200 border border-red-500/30'
              : result.success
                ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-300'
          }`}>
            {result.violation ? <TriangleAlert className="w-5 h-5 shrink-0 text-red-500" /> : null}
            <p>{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
