import { prisma } from '@/lib/prisma';
import ActiveSuspensions from './_components/ActiveSuspensions';
import TrustScoreTable from './_components/TrustScoreTable';
import FuelWastedWidget from './_components/FuelWastedWidget';
import SobrietySimulator from './_components/SobrietySimulator';
import { DriverStatus } from '@/types/enums';

export const dynamic = 'force-dynamic';

async function getEfficiencyData() {
  const [suspendedDrivers, allDrivers, vehicles, telemetryData] = await Promise.all([
    prisma.driver.findMany({
      where: {
        OR: [
          { is_suspended: true },
          { status: DriverStatus.SUSPENDED }
        ]
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.driver.findMany({
      orderBy: { trust_score: 'desc' },
    }),
    prisma.vehicle.findMany({
      orderBy: { licensePlate: 'asc' },
    }),
    prisma.tripTelemetry.findMany({
      select: { idle_time_minutes: true },
    }),
  ]);

  const totalIdleMinutes = telemetryData.reduce((acc, curr) => acc + curr.idle_time_minutes, 0);

  return {
    suspendedDrivers,
    allDrivers,
    vehicles,
    totalIdleMinutes,
  };
}

export default async function EfficiencyPage() {
  const { suspendedDrivers, allDrivers, vehicles, totalIdleMinutes } = await getEfficiencyData();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Risk & Performance</h1>
          <p className="text-zinc-400">Monitor driver safety, sobriety, and fuel efficiency.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Alerts & Simulator */}
        <div className="space-y-6">
          <ActiveSuspensions suspendedDrivers={suspendedDrivers} />
          <SobrietySimulator vehicles={vehicles} />
          <FuelWastedWidget totalIdleMinutes={totalIdleMinutes} />
        </div>

        {/* Right Column: Trust Table (Span 2) */}
        <div className="md:col-span-2">
          <TrustScoreTable drivers={allDrivers} />
        </div>
      </div>
    </div>
  );
}
