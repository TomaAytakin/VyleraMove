import { useState, useEffect, useRef } from 'react';

export type VehicleType = 'VIP_LIMO' | 'SUV' | 'SHUTTLE_VAN' | 'BUS';
export type VehicleStatus = 'MOVING' | 'IDLE' | 'OFFLINE' | 'ALARM';

export interface Telemetry {
  speed: number;
  fuel: number;
  ignition: boolean;
  temperature?: number;
}

export interface DriverInfo {
  id: string;
  name: string;
  photoUrl?: string;
}

export interface GuestInfo {
  name: string;
  roomNumber?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  status: VehicleStatus;
  lat: number;
  lng: number;
  heading: number;
  telemetry: Telemetry;
  driver?: DriverInfo;
  guest?: GuestInfo;
  lastUpdate: number;
}

export interface FleetAlert {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: 'FATIGUE' | 'SMOKING' | 'CRASH' | 'GEOFENCE';
  message: string;
  timestamp: number;
  active: boolean;
}

interface UseFleetDataReturn {
  vehicles: Vehicle[];
  alerts: FleetAlert[];
  isConnected: boolean;
}

const CENTER_LAT = 10.627543;
const CENTER_LNG = 103.522141;

const generateMockVehicles = (count: number): Vehicle[] => {
  return Array.from({ length: count }).map((_, i) => {
    const type: VehicleType = i % 4 === 0 ? 'VIP_LIMO' : i % 3 === 0 ? 'SUV' : 'SHUTTLE_VAN';
    const status: VehicleStatus = Math.random() > 0.8 ? 'IDLE' : 'MOVING';

    return {
      id: `v-${i + 1}`,
      name: `${type === 'VIP_LIMO' ? 'Limo' : type === 'SUV' ? 'SUV' : 'Van'} ${String(i + 1).padStart(2, '0')}`,
      type,
      status,
      lat: CENTER_LAT + (Math.random() - 0.5) * 0.05,
      lng: CENTER_LNG + (Math.random() - 0.5) * 0.05,
      heading: Math.floor(Math.random() * 360),
      telemetry: {
        speed: status === 'MOVING' ? Math.floor(Math.random() * 60) + 20 : 0,
        fuel: Math.floor(Math.random() * 60) + 40,
        ignition: status === 'MOVING' || status === 'IDLE',
      },
      driver: {
        id: `d-${i}`,
        name: `Driver ${i + 1}`,
      },
      guest: i % 5 === 0 ? { name: `Guest ${i + 1}` } : undefined,
      lastUpdate: Date.now(),
    };
  });
};

export function useFleetData(): UseFleetDataReturn {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<FleetAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Use Ref to access latest vehicles in intervals without re-triggering them
  const vehiclesRef = useRef<Vehicle[]>([]);

  useEffect(() => {
    vehiclesRef.current = vehicles;
  }, [vehicles]);

  useEffect(() => {
    // Delay initialization to next tick to avoid synchronous setState in effect warning
    // and ensure client-side only data generation (avoid hydration mismatch)
    setTimeout(() => {
        const initialVehicles = generateMockVehicles(50);
        setVehicles(initialVehicles);
        vehiclesRef.current = initialVehicles;
        setIsConnected(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    // Movement Loop
    const moveInterval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === 'OFFLINE' || v.status === 'ALARM') return v;

        let { lat, lng, heading } = v;
        let speed = v.telemetry.speed;
        let status = v.status;

        // Simulate Random Status Change
        if (Math.random() > 0.995) {
             status = status === 'MOVING' ? 'IDLE' : 'MOVING';
             speed = status === 'MOVING' ? 30 : 0;
        }

        if (status === 'MOVING') {
            const speedFactor = 0.00005;
            const rad = (heading * Math.PI) / 180;
            lat += Math.cos(rad) * speedFactor;
            lng += Math.sin(rad) * speedFactor;

            if (Math.random() > 0.9) {
                heading = (heading + (Math.random() - 0.5) * 20 + 360) % 360;
            }
        }

        return {
            ...v,
            lat,
            lng,
            heading,
            status,
            telemetry: {
                ...v.telemetry,
                speed,
                fuel: Math.max(0, v.telemetry.fuel - 0.001),
                ignition: status !== 'OFFLINE'
            },
            lastUpdate: Date.now()
        };
      }));
    }, 1000);

    // Alert Loop
    const alertInterval = setInterval(() => {
        const currentVehicles = vehiclesRef.current;

        if (Math.random() > 0.7) { // 30% chance every 5s
            const idToAlert = Math.floor(Math.random() * currentVehicles.length);
            const target = currentVehicles[idToAlert];

            if (!target || target.status !== 'MOVING') return;

            // Create Alert
            const newAlert: FleetAlert = {
                id: `alert-${Date.now()}`,
                vehicleId: target.id,
                vehicleName: target.name,
                type: 'FATIGUE',
                message: `Fatigue Detected: ${target.name}`,
                timestamp: Date.now(),
                active: true
            };

            setAlerts(prevAlerts => [newAlert, ...prevAlerts].slice(0, 10));

            // Set Vehicle to ALARM
            setVehicles(prev => prev.map(v => v.id === target.id ? { ...v, status: 'ALARM' } : v));

            // Auto-resolve after 5s
            setTimeout(() => {
                 setVehicles(curr => curr.map(v => v.id === target.id && v.status === 'ALARM' ? { ...v, status: 'MOVING' } : v));
            }, 5000);
        }
    }, 5000);

    return () => {
        clearInterval(moveInterval);
        clearInterval(alertInterval);
    };
  }, [isConnected]);

  return { vehicles, alerts, isConnected };
}
