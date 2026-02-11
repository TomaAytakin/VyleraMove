'use client';

import { useState } from 'react';

export default function AiSimulationPage() {
  const [billResult, setBillResult] = useState<any>(null);
  const [driverResult, setDriverResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const simulateBill = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/simulate/bill');
      const data = await res.json();
      setBillResult(data);
    } catch (err) {
      console.error(err);
      setBillResult({ error: 'Failed to fetch' });
    }
    setLoading(false);
  };

  const simulateDriver = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/simulate/driver');
      const data = await res.json();
      setDriverResult(data);
    } catch (err) {
      console.error(err);
      setDriverResult({ error: 'Failed to fetch' });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-zinc-100">AI Core Simulation</h1>

      {/* Bill Analysis Simulation */}
      <section className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <h2 className="text-xl font-semibold mb-4 text-amber-500">Step 2: "The Auditor" (Bill Scanning)</h2>
        <p className="text-zinc-400 mb-4">
          Simulates uploading a bill with odometer 50,000km while the vehicle has 40,000km.
          Expects a "SUSPICIOUS" flag.
        </p>
        <button
          onClick={simulateBill}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Run Fraud Simulation
        </button>

        {billResult && (
          <div className="mt-4 bg-black p-4 rounded overflow-auto border border-zinc-700 max-h-96">
            <pre className="text-xs text-green-400 font-mono">
              {JSON.stringify(billResult, null, 2)}
            </pre>
          </div>
        )}
      </section>

      {/* Driver Scoring Simulation */}
      <section className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <h2 className="text-xl font-semibold mb-4 text-amber-500">Step 3: "The Judge" (Driver Scoring)</h2>
        <p className="text-zinc-400 mb-4">
          Simulates a trip with:
          <br/>1. 20 mins Idle in Casino Lobby (Penalty)
          <br/>2. 20 mins Idle in Highway Traffic (Mercy - Traffic Detected)
          <br/>3. Hard Braking followed by Steering Correction (Mercy - Accident Avoidance)
          <br/>4. DSM Fatigue Alert (Penalty)
        </p>
        <button
          onClick={simulateDriver}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
        >
          Run Scoring Simulation
        </button>

        {driverResult && (
          <div className="mt-4 bg-black p-4 rounded overflow-auto border border-zinc-700 max-h-96">
            <pre className="text-xs text-green-400 font-mono">
              {JSON.stringify(driverResult, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
