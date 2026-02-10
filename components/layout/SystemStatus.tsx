"use client";

import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function SystemStatus() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString());

    // Defer initial update to avoid hydration mismatch and linter warning
    // about synchronous state updates in effect
    const frameId = requestAnimationFrame(() => {
      updateTime();
    });

    const interval = setInterval(updateTime, 1000);

    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-md p-4 flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        System Status
      </h3>
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-500">
          GPS Gateway: Online
        </span>
      </div>
      <div className="text-xs text-zinc-600">
        Last update: {time || "--:--:--"}
      </div>
    </div>
  );
}
