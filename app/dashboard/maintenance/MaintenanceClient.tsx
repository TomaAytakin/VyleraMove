'use client'

import { useState, useTransition } from 'react'
import { uploadInvoice, processInvoiceAI, createMaintenanceLog } from '@/app/actions/maintenance'
import { MaintenanceCategory } from '@/types/enums'
import { Camera, Upload, AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react'
import Image from 'next/image'

type MaintenanceLog = {
  id: string
  date: string
  cost: number
  category: string
  invoice_url: string
  vehicle: { licensePlate: string, make: string, model: string }
  driver: { name: string, trust_score: number, kpi_grade: string }
}

type Props = {
  vehicles: { id: string, licensePlate: string, make: string, model: string }[]
  drivers: { id: string, name: string }[]
  logs: MaintenanceLog[]
  subscriptions: { id: string, licensePlate: string, subscription_starlink_due: string | null }[]
}

export default function MaintenanceClient({ vehicles, drivers, logs, subscriptions }: Props) {
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scannedData, setScannedData] = useState<any>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form State
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedDriver, setSelectedDriver] = useState('')
  const [cost, setCost] = useState('')
  const [category, setCategory] = useState<string>('')
  const [date, setDate] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const uploadRes = await uploadInvoice(formData)
      if (!uploadRes.success || !uploadRes.url) {
        alert('Upload failed')
        setIsUploading(false)
        return
      }

      setPreviewUrl(uploadRes.url)
      setIsProcessing(true)

      const aiRes = await processInvoiceAI(uploadRes.url)
      if (aiRes.success && aiRes.data) {
        setScannedData(aiRes.data)
        setCost(aiRes.data.cost.toString())
        setCategory(aiRes.data.category)
        setDate(aiRes.data.date ? new Date(aiRes.data.date).toISOString().split('T')[0] : '')
      }
    } catch (error) {
      console.error(error)
      alert('Error processing invoice')
    } finally {
      setIsUploading(false)
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicle || !selectedDriver || !cost || !category || !previewUrl) {
      alert('Please fill all fields')
      return
    }

    startTransition(async () => {
      const res = await createMaintenanceLog({
        vehicleId: selectedVehicle,
        driverId: selectedDriver,
        cost: parseFloat(cost),
        category,
        invoice_url: previewUrl,
        ocr_raw_text: scannedData?.ocr_raw_text,
        ai_analysis_json: scannedData?.ai_analysis,
        date: new Date(date)
      })

      if (res.success) {
        alert('Maintenance Log Created!')
        setShowScanner(false)
        setScannedData(null)
        setPreviewUrl(null)
        setCost('')
        setCategory('')
        setDate('')
        setSelectedVehicle('')
        setSelectedDriver('')
      } else {
        alert('Failed to create log')
      }
    })
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 h-full">
      {/* Mobile / Mechanic View */}
      <div className={`flex-1 md:max-w-md space-y-6 ${!showScanner && 'hidden md:block'}`}>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <Camera className="w-6 h-6 text-amber-500" />
            Mechanic Scanner
          </h2>

          {!showScanner ? (
            <button
              onClick={() => setShowScanner(true)}
              className="w-full py-12 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center gap-4 hover:bg-zinc-800 transition text-zinc-400 hover:text-white"
            >
              <Camera className="w-12 h-12" />
              <span className="text-lg font-medium">Scan New Invoice</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-white">New Entry</h3>
                <button onClick={() => setShowScanner(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!previewUrl ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full py-8 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center gap-2 bg-zinc-800/50 text-zinc-400">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8" />
                        <span>Tap to Upload Bill</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800">
                    <Image src={previewUrl} alt="Invoice" fill className="object-contain" />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-amber-500 gap-2">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="font-medium animate-pulse">AI Analysis in Progress...</span>
                      </div>
                    )}
                  </div>

                  {!isProcessing && scannedData && (
                    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded text-sm text-amber-200 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          AI Detected: <strong>${scannedData.cost}</strong> for <strong>{scannedData.category}</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Vehicle</label>
                          <select
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                            value={selectedVehicle}
                            onChange={e => setSelectedVehicle(e.target.value)}
                            required
                          >
                            <option value="">Select Vehicle</option>
                            {vehicles.map(v => (
                              <option key={v.id} value={v.id}>{v.licensePlate} ({v.model})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Driver</label>
                          <select
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                            value={selectedDriver}
                            onChange={e => setSelectedDriver(e.target.value)}
                            required
                          >
                            <option value="">Select Driver</option>
                            {drivers.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Cost ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                            value={cost}
                            onChange={e => setCost(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Date</label>
                          <input
                            type="date"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Category</label>
                        <select
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          required
                        >
                          <option value="">Select Category</option>
                          {Object.values(MaintenanceCategory).map(c => (
                            <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-lg transition disabled:opacity-50"
                      >
                        {isPending ? 'Saving...' : 'Confirm & Save Log'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manager View / Dashboard */}
      <div className={`flex-1 space-y-6 overflow-y-auto ${showScanner ? 'hidden md:block' : 'block'}`}>

        {/* Subscription Tracker Widget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Subscriptions Due
            </h3>
            {subscriptions.length === 0 ? (
              <p className="text-zinc-500 text-sm">No subscriptions due soon.</p>
            ) : (
              <ul className="space-y-2">
                {subscriptions.map(s => (
                  <li key={s.id} className="text-sm text-zinc-300 flex justify-between">
                    <span>{s.licensePlate}</span>
                    <span className="text-amber-500">
                      {s.subscription_starlink_due ? new Date(s.subscription_starlink_due).toLocaleDateString() : 'N/A'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

           <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
             <h3 className="text-lg font-semibold text-white mb-2">Fleet Health</h3>
             <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">98%</span>
                <span className="text-sm text-emerald-500 mb-1">Operational</span>
             </div>
             <p className="text-xs text-zinc-500 mt-2">2 Vehicles in Maintenance</p>
           </div>
        </div>

        {/* Recent Repairs Table */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="text-lg font-semibold text-white">Recent Maintenance Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950 text-zinc-400">
                <tr>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Vehicle</th>
                  <th className="p-4 font-medium">Driver</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium text-right">Cost</th>
                  <th className="p-4 font-medium text-right">Trust Score Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">No maintenance logs yet.</td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-zinc-800/50 transition group">
                      <td className="p-4 text-zinc-300">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="p-4 text-white font-medium">{log.vehicle.licensePlate}</td>
                      <td className="p-4 text-zinc-300">
                        <div>{log.driver.name}</div>
                        <div className="text-xs text-zinc-500">Current Score: <span className={log.driver.trust_score < 90 ? 'text-red-500' : 'text-emerald-500'}>{log.driver.trust_score}</span> ({log.driver.kpi_grade})</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${log.category === MaintenanceCategory.ACCIDENT ? 'bg-red-500/10 text-red-500' :
                            log.category === MaintenanceCategory.NON_WEAR_DAMAGE ? 'bg-orange-500/10 text-orange-500' :
                            'bg-emerald-500/10 text-emerald-500'
                          }
                        `}>
                          {log.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right text-white">${log.cost.toFixed(2)}</td>
                      <td className="p-4 text-right">
                         {log.category === MaintenanceCategory.ACCIDENT && <span className="text-red-500 font-bold">-10</span>}
                         {log.category === MaintenanceCategory.NON_WEAR_DAMAGE && <span className="text-orange-500 font-bold">-5</span>}
                         {log.category === MaintenanceCategory.WEAR_AND_TEAR && <span className="text-zinc-500">-</span>}
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
