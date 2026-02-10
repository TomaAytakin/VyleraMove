import MapView from '@/components/map/MapView';

export default function MapPage() {
  return (
    <div className="h-full w-full flex flex-col">
       <div className="flex-1 min-h-0">
          <MapView />
       </div>
    </div>
  );
}
