import { getSobrietyTests, getTamperLogs } from '@/app/actions/safety'
import { SobrietyResult } from '@/types/enums'

export default async function SafetyPage() {
  const sobrietyTests = await getSobrietyTests()
  const tamperLogs = await getTamperLogs()

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-100">Sobriety & Safety Compliance</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Live Feed Section */}
        <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800">
          <h2 className="text-xl font-semibold text-amber-500 mb-4">Live Sobriety Feed</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="border-b border-zinc-700 bg-zinc-800/50 text-zinc-100 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3 text-right">BAC</th>
                  <th className="px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {sobrietyTests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-center text-zinc-500">
                      No sobriety tests recorded yet.
                    </td>
                  </tr>
                ) : (
                  sobrietyTests.map((test) => {
                    const isZero = test.bac_level === 0
                    const isFail = test.result === SobrietyResult.FAIL || test.result === SobrietyResult.TAMPER

                    return (
                      <tr key={test.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {new Date(test.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {test.vehicle?.licensePlate || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {test.driver?.name || 'Unknown'}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-right font-mono ${
                          !isZero ? 'text-red-500 font-bold' : 'text-green-500'
                        }`}>
                          {test.bac_level.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            test.result === SobrietyResult.PASS
                              ? 'bg-green-900/30 text-green-400 border border-green-800'
                              : test.result === SobrietyResult.FAIL
                                ? 'bg-red-900/30 text-red-400 border border-red-800'
                                : 'bg-amber-900/30 text-amber-400 border border-amber-800'
                          }`}>
                            {test.result}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tamper Log Section */}
        <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Tamper & Violation Log</h2>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-zinc-300">
              <thead className="border-b border-zinc-700 bg-zinc-800/50 text-zinc-100 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {tamperLogs.length === 0 ? (
                   <tr>
                    <td colSpan={3} className="px-4 py-3 text-center text-zinc-500">
                      No tamper events recorded.
                    </td>
                  </tr>
                ) : (
                  tamperLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                           <span className="text-zinc-200 font-medium">
                             {log.vehicle?.licensePlate} - {log.driver?.name}
                           </span>
                           <span className="text-xs text-red-400 font-mono">
                             Result: {log.result} (BAC: {log.bac_level.toFixed(2)}%)
                           </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-zinc-500 italic">
                          Alert Sent to Manager
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
