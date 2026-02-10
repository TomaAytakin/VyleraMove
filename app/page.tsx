import { Truck } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-4">
        <Truck className="w-16 h-16 text-blue-600" />
        <h1 className="text-4xl font-bold">Fleet Management System - v0.1</h1>
        <p className="text-xl text-slate-600">Status: System Initialized</p>
      </div>
    </main>
  );
}
