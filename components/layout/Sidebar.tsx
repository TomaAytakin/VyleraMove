"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Route,
  PlusCircle,
  Truck,
  Users,
  Wrench,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import SystemStatus from "./SystemStatus";

const sidebarLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Live Map", icon: Map },
  { href: "/trips", label: "Active Trips", icon: Route },
  { href: "/dispatch", label: "Dispatch", icon: PlusCircle },
  { href: "/fleet", label: "Fleet / Vehicles", icon: Truck },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-zinc-900 text-white rounded-md md:hidden border border-zinc-800 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="flex items-center justify-center h-16 border-b border-zinc-800 bg-zinc-900/50">
            <h1 className="text-2xl font-bold tracking-wider text-white">
              <span className="text-amber-500">Vylera</span>Move
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group ${
                    isActive
                      ? "bg-zinc-900 text-amber-500 border-l-4 border-amber-500 shadow-md shadow-amber-500/10"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white hover:pl-5"
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-amber-500" : "text-zinc-500 group-hover:text-white transition-colors"} />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* System Status Widget */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
            <SystemStatus />
          </div>
        </div>
      </aside>
    </>
  );
}
