import {
  getFleetUtilization,
  getCostAnalysis,
  getSafetyReport,
  getDriverPerformance,
} from '@/app/actions/analytics'
import EfficiencyChart from './components/EfficiencyChart'
import CostChart from './components/CostChart'
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  User,
  Star,
  Frown,
  Car,
  TrendingDown,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const [utilization, costs, safety, drivers] = await Promise.all([
    getFleetUtilization(),
    getCostAnalysis(),
    getSafetyReport(),
    getDriverPerformance(),
  ])

  return (
    <div className="space-y-6 text-zinc-100 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
      <p className="text-zinc-400">Real-time business intelligence and fleet analytics.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

        {/* 1. Operational Efficiency */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Operational Efficiency
            </h2>
            <span className="text-xs font-medium bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Target: 85%</span>
          </div>

          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold text-white">{utilization.utilizationRate}%</span>
            <span className="text-sm text-zinc-400 mb-1">Fleet Utilization</span>
          </div>

          <div className="h-64">
            <EfficiencyChart data={utilization.history} />
          </div>
        </div>

        {/* 2. Financial Performance */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Financial Performance
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">${costs.costPerKm}</span>
                <span className="text-sm text-zinc-400 ml-2">Cost / KM</span>
              </div>

              {costs.expensiveVehicle.id !== 'none' && (
                <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-200">High Cost Alert</p>
                    <p className="text-xs text-red-300/80 mt-1">
                      {costs.expensiveVehicle.licensePlate} is <span className="font-bold">{costs.expensiveVehicle.excessPercentage}%</span> more expensive to run than fleet average.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 h-48 relative">
               <CostChart data={costs.breakdown} />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center mt-8">
                   <p className="text-xs text-zinc-500">Total Spend</p>
                   <p className="text-sm font-bold text-zinc-300">
                     ${costs.breakdown.reduce((a, b) => a + b.value, 0).toLocaleString()}
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* 3. Driver Performance */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Driver Performance
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Top Drivers */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Top Performers
              </h3>
              <div className="space-y-3">
                {drivers.topDrivers.map((driver, i) => (
                  <div key={driver.id} className="flex items-center justify-between bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{driver.name}</p>
                        <p className="text-xs text-zinc-500">{driver.trips} Trips</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-green-400">{driver.trust_score}</span>
                      <p className="text-[10px] text-zinc-600">Trust Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Drivers */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                Needs Improvement
              </h3>
              <div className="space-y-3">
                {drivers.bottomDrivers.map((driver, i) => (
                  <div key={driver.id} className="flex items-center justify-between bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{driver.name}</p>
                        <p className="text-xs text-zinc-500">{driver.violations || 0} Violations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-red-400">{driver.trust_score}</span>
                      <p className="text-[10px] text-zinc-600">Trust Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Safety ROI */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              Safety ROI
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-indigo-950/20 p-4 rounded-lg border border-indigo-900/30">
              <p className="text-3xl font-bold text-indigo-400">{safety.drunkStartsBlocked}</p>
              <p className="text-xs text-indigo-200/70 mt-1">Drunk Starts Blocked</p>
            </div>
            <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
              <p className="text-3xl font-bold text-zinc-300">{safety.interventions}</p>
              <p className="text-xs text-zinc-500 mt-1">Total Interventions</p>
            </div>
          </div>

          <div className="bg-green-950/30 border border-green-900/50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-200/80 mb-1">Estimated Liability Saved</p>
            <p className="text-3xl font-bold text-green-400 tracking-tight">
              ${safety.liabilitySaved.toLocaleString()}
            </p>
            <p className="text-xs text-green-300/50 mt-2">
              Based on industry avg. accident costs
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
