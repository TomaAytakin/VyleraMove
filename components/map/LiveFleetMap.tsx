'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import { Vehicle } from '@/lib/hooks/useFleetData';
import { Battery, Gauge, Key, Video, User } from 'lucide-react';

const CENTER_LAT = 10.627543;
const CENTER_LNG = 103.522141;

// Helper to create rotated SVG icon
const createVehicleIcon = (vehicle: Vehicle) => {
  const { status, heading } = vehicle;

  let color = '#22c55e'; // Green (Moving)
  if (status === 'IDLE') color = '#eab308'; // Yellow
  if (status === 'OFFLINE' || status === 'ALARM') color = '#ef4444'; // Red

  // Simple Arrow/Car Shape
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" width="40" height="40" style="transform: rotate(${heading}deg); filter: drop-shadow(0 3px 3px rgba(0,0,0,0.5));">
      <path d="M12 2L2 22L12 18L22 22L12 2Z" />
    </svg>
  `;

  // Add pulsing effect for ALARM
  const className = status === 'ALARM' ? 'animate-pulse' : '';

  return L.divIcon({
    html: `<div class="${className} flex items-center justify-center">${svg}</div>`,
    className: 'bg-transparent border-none', // Remove default Leaflet square
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

interface LiveFleetMapProps {
  vehicles: Vehicle[];
}

export default function LiveFleetMap({ vehicles }: LiveFleetMapProps) {
  return (
    <div className="h-full w-full bg-zinc-900 relative">
      <MapContainer
        center={[CENTER_LAT, CENTER_LNG]}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        style={{ background: '#09090b' }} // Match dark theme
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.lat, vehicle.lng]}
            icon={createVehicleIcon(vehicle)}
          >
            <Popup className="custom-popup">
              <div className="w-64 p-1">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-zinc-200 pb-2 mb-2">
                   <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden">
                      {vehicle.driver?.photoUrl ? (
                        <img src={vehicle.driver.photoUrl} alt="Driver" className="h-full w-full object-cover" />
                      ) : (
                        <User className="text-zinc-500 h-6 w-6" />
                      )}
                   </div>
                   <div>
                      <h3 className="font-bold text-lg text-zinc-900 leading-tight">{vehicle.name}</h3>
                      <p className="text-xs text-zinc-500">{vehicle.driver?.name || 'No Driver'}</p>
                   </div>
                </div>

                {/* Status Badge */}
                <div className={`text-xs font-bold px-2 py-1 rounded w-fit mb-2 ${
                    vehicle.status === 'MOVING' ? 'bg-green-100 text-green-700' :
                    vehicle.status === 'IDLE' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                }`}>
                    {vehicle.status}
                </div>

                {/* Guest Info */}
                {vehicle.guest && (
                    <div className="mb-2 bg-blue-50 p-2 rounded border border-blue-100">
                        <p className="text-xs text-blue-500 font-semibold uppercase">Current Guest</p>
                        <p className="text-sm font-medium text-blue-900">{vehicle.guest.name}</p>
                        {vehicle.guest.roomNumber && <p className="text-xs text-blue-700">Room: {vehicle.guest.roomNumber}</p>}
                    </div>
                )}

                {/* Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex flex-col items-center bg-zinc-50 p-2 rounded">
                        <Gauge className="h-4 w-4 text-zinc-400 mb-1" />
                        <span className="text-sm font-bold text-zinc-700">{Math.round(vehicle.telemetry.speed)} km/h</span>
                    </div>
                    <div className="flex flex-col items-center bg-zinc-50 p-2 rounded">
                        <Battery className={`h-4 w-4 mb-1 ${vehicle.telemetry.fuel < 20 ? 'text-red-500' : 'text-zinc-400'}`} />
                        <span className="text-sm font-bold text-zinc-700">{Math.round(vehicle.telemetry.fuel)}%</span>
                    </div>
                </div>

                {/* Ignition */}
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-3 px-1">
                    <span className="flex items-center gap-1">
                        <Key className="h-3 w-3" /> Ignition
                    </span>
                    <span className={`font-bold ${vehicle.telemetry.ignition ? 'text-green-600' : 'text-zinc-400'}`}>
                        {vehicle.telemetry.ignition ? 'ON' : 'OFF'}
                    </span>
                </div>

                {/* Actions */}
                <button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors">
                    <Video className="h-3 w-3" />
                    Open Live Cam
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
