"use client";

import { Bell, ShieldAlert, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Simple breadcrumb logic
  const getBreadcrumb = () => {
    const path = pathname.split("/").filter((p) => p);
    if (path.length === 0) return "Dashboard";
    return path.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" > ");
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-zinc-950 border-b border-zinc-800 shadow-sm shadow-zinc-900/50 relative z-10">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-4 pl-12 md:pl-0 transition-all duration-300">
        <div className="flex items-center text-sm md:text-base">
          <span className="text-zinc-500 font-medium hidden sm:inline">Fleet</span>
          <span className="mx-2 text-zinc-700 hidden sm:inline">/</span>
          <span className="text-zinc-100 font-semibold tracking-wide truncate max-w-[150px] sm:max-w-none">
            {getBreadcrumb()}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all duration-200 group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-zinc-950" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-zinc-800">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center text-zinc-300 ring-2 ring-zinc-800 shadow-inner cursor-pointer hover:ring-zinc-600 transition-all">
            <User size={18} />
          </div>
          <div className="hidden md:block cursor-pointer">
            <p className="text-sm font-medium text-zinc-100 hover:text-amber-500 transition-colors">Admin User</p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Fleet Manager</p>
          </div>
        </div>

        {/* Emergency Stop Button */}
        <button className="ml-2 flex items-center gap-2 px-3 md:px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-md hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300 group">
          <ShieldAlert size={18} className="group-hover:animate-pulse" />
          <span className="font-bold text-xs md:text-sm hidden lg:inline tracking-wider">EMERGENCY STOP</span>
        </button>
      </div>
    </header>
  );
}
