import { Truck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
        <Truck className="relative w-24 h-24 text-blue-500" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
          Fleet Management System - v0.1
        </h1>
        <p className="text-xl text-zinc-500 font-medium">
          Status: <span className="text-emerald-500">System Initialized</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12">
        {[
          { label: "Active Vehicles", value: "12", color: "text-blue-500" },
          { label: "Pending Dispatch", value: "3", color: "text-amber-500" },
          { label: "Alerts", value: "0", color: "text-red-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg backdrop-blur-sm">
            <p className="text-zinc-500 text-sm uppercase tracking-wider font-semibold">{stat.label}</p>
            <p className={`text-4xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
