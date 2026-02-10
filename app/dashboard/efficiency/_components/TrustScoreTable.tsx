'use client';

import { Driver } from '@prisma/client';
import { BadgeCheck, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TrustScoreTableProps {
  drivers: Driver[];
}

export default function TrustScoreTable({ drivers }: TrustScoreTableProps) {
  // Sort drivers by trust score descending
  const sortedDrivers = [...drivers].sort((a, b) => b.trust_score - a.trust_score);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          Driver Trust
        </h3>
        <span className="text-xs text-zinc-500">Sorted by Score</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-zinc-950 text-zinc-400 font-medium">
            <tr>
              <th scope="col" className="px-6 py-3">Driver Name</th>
              <th scope="col" className="px-6 py-3 text-center">Score</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Sobriety Check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sortedDrivers.map((driver) => (
              <tr key={driver.id} className="bg-zinc-900 hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-zinc-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-300 font-bold">
                      {driver.name.charAt(0)}
                    </div>
                    {driver.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-bold text-lg">
                  <span className={
                    driver.trust_score > 90 ? 'text-emerald-500' :
                    driver.trust_score > 70 ? 'text-amber-500' :
                    'text-red-500'
                  }>
                    {driver.trust_score}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    driver.status === 'SUSPENDED' ? 'bg-red-900/50 text-red-300 border border-red-500/30' :
                    driver.status === 'ON_TRIP' ? 'bg-blue-900/50 text-blue-300 border border-blue-500/30' :
                    'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {driver.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    {driver.is_suspended ? (
                      <div className="bg-red-500/10 p-1.5 rounded-full border border-red-500/50 text-red-500">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="bg-emerald-500/10 p-1.5 rounded-full border border-emerald-500/50 text-emerald-500">
                        <BadgeCheck className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {sortedDrivers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 italic">
                  No drivers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
