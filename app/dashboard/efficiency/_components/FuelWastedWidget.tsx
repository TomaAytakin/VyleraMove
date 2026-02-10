import { Fuel, Timer, AlertCircle } from 'lucide-react';

interface FuelWastedWidgetProps {
  totalIdleMinutes: number;
}

export default function FuelWastedWidget({ totalIdleMinutes }: FuelWastedWidgetProps) {
  // Constants
  const LITERS_PER_HOUR_IDLE = 1.2; // Avg for idling engine
  const FUEL_COST_PER_LITER = 1.25; // USD/Liter estimate

  const hours = totalIdleMinutes / 60;
  const wastedLiters = hours * LITERS_PER_HOUR_IDLE;
  const wastedCost = wastedLiters * FUEL_COST_PER_LITER;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-400 font-medium text-sm uppercase tracking-wider">Idle Waste Tracker</h3>
        <Fuel className="w-5 h-5 text-amber-500" />
      </div>

      <div className="space-y-6">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-zinc-100">{wastedLiters.toFixed(1)}</span>
          <span className="text-zinc-500 text-lg font-medium mb-1">Liters</span>
        </div>

        <div className="w-full bg-zinc-800 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-amber-500 to-red-600 h-2 rounded-full"
            style={{ width: `${Math.min(100, (wastedLiters / 50) * 100)}%` }} // Max 50L visualization
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 border-t border-zinc-800 pt-4">
          <div>
            <p className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
              <Timer className="w-3 h-3" /> Time Wasted
            </p>
            <p className="text-zinc-300 font-mono">{Math.floor(hours)}h {totalIdleMinutes % 60}m</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Cost Impact
            </p>
            <p className="text-red-400 font-mono font-bold">${wastedCost.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
