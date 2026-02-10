'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Vehicle } from '@/lib/hooks/useFleetData';

interface MapWrapperProps {
  vehicles: Vehicle[];
}

export default function MapWrapper({ vehicles }: MapWrapperProps) {
  const Map = useMemo(
    () =>
      dynamic(() => import('@/components/map/LiveFleetMap'), {
        loading: () => <div className="h-full w-full bg-zinc-900 flex items-center justify-center text-zinc-500">Loading Map...</div>,
        ssr: false,
      }),
    []
  );

  return <Map vehicles={vehicles} />;
}
