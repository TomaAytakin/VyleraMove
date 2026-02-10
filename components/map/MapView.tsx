'use client';

import { useFleetData } from '@/lib/hooks/useFleetData';
import MapWrapper from '@/components/map/MapWrapper';
import { Activity, AlertTriangle, Car, WifiOff } from 'lucide-react';

export default function MapView() {
  const { vehicles, alerts } = useFleetData();

  // Stats
  const totalActive = vehicles.filter(v => v.status === 'MOVING' || v.status === 'IDLE').length;
  const totalOffline = vehicles.filter(v => v.status === 'OFFLINE').length;
  const totalWarnings = alerts.length;

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-100px)] overflow-hidden bg-zinc-950 rounded-xl border border-zinc-800">
       {/* Map Layer */}
       <div className="absolute inset-0 z-0">
          <MapWrapper vehicles={vehicles} />
       </div>

       {/* Fleet Summary Widget (Top Right) */}
       <div className="absolute top-4 right-4 z-10 bg-zinc-950/90 border border-zinc-800 p-4 rounded-xl shadow-2xl backdrop-blur-md w-64 pointer-events-none">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Fleet Status</h2>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-zinc-900/50 p-3 rounded-lg flex flex-col items-center border border-zinc-800">
                <Car className="h-5 w-5 text-green-500 mb-1" />
                <span className="text-2xl font-bold text-white">{totalActive}</span>
                <span className="text-[10px] text-zinc-500 uppercase">Online</span>
             </div>
             <div className="bg-zinc-900/50 p-3 rounded-lg flex flex-col items-center border border-zinc-800">
                <WifiOff className="h-5 w-5 text-red-500 mb-1" />
                <span className="text-2xl font-bold text-white">{totalOffline}</span>
                <span className="text-[10px] text-zinc-500 uppercase">Offline</span>
             </div>
          </div>

          {totalWarnings > 0 && (
             <div className="mt-4 bg-red-900/20 border border-red-900/50 p-3 rounded-lg flex items-center gap-3 animate-pulse">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                   <p className="text-red-500 font-bold text-sm">{totalWarnings} Critical Alerts</p>
                   <p className="text-red-400 text-xs">Action Required</p>
                </div>
             </div>
          )}
       </div>

       {/* Live Ticker (Bottom) */}
       <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 shadow-2xl backdrop-blur-md flex items-center gap-4 overflow-hidden">
             <div className="bg-amber-500 text-zinc-950 text-xs font-bold px-2 py-1 rounded uppercase flex-shrink-0">
                Live Feed
             </div>
             <div className="flex-1 overflow-hidden relative h-6">
                <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
                   {alerts.length > 0 ? alerts.map(alert => (
                      <span key={alert.id} className="text-red-500 font-bold flex items-center gap-2">
                         <AlertTriangle className="h-4 w-4" /> {alert.message}
                      </span>
                   )) : (
                      <span className="text-zinc-500 text-sm flex items-center gap-2">
                         <Activity className="h-4 w-4" /> System Nominal. Monitoring {vehicles.length} vehicles.
                      </span>
                   )}
                </div>
             </div>
          </div>
       </div>

       {/* Alert Toast (Centered) */}
       {alerts.length > 0 && (
         <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            {alerts.slice(0, 1).map(alert => (
               <div key={alert.id} className="bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-lg animate-bounce flex items-center gap-3 border-4 border-red-800">
                  <AlertTriangle className="h-6 w-6" />
                  {alert.message.toUpperCase()}
               </div>
            ))}
         </div>
       )}
    </div>
  );
}
