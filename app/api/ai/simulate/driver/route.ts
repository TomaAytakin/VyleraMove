import { NextResponse } from 'next/server';
import { calculateDriverTrust, TelemetryPoint, DsmEvent } from '@/lib/ai';

export async function GET() {
  try {
    const driverId = 'driver-123';

    // --- Simulation Data ---
    const now = new Date();

    const telemetryData: TelemetryPoint[] = [];

    // 1. Idle in Casino Lobby (20 mins) -> Should Penalize (2 points)
    // Start at T-60 mins
    const casinoStart = new Date(now.getTime() - 60 * 60 * 1000);
    for (let i = 0; i < 20; i++) { // 20 minutes
       telemetryData.push({
         timestamp: new Date(casinoStart.getTime() + i * 60 * 1000),
         speed: 0,
         engine_on: true,
         latitude: 43.651070,
         longitude: -79.347015,
         location_context: "Casino Lobby Parking"
       });
    }

    // 2. Idle in Highway Traffic (20 mins) -> Should NOT Penalize
    // Start at T-30 mins
    const highwayStart = new Date(now.getTime() - 30 * 60 * 1000);
    for (let i = 0; i < 20; i++) { // 20 minutes
       telemetryData.push({
         timestamp: new Date(highwayStart.getTime() + i * 60 * 1000),
         speed: 0,
         engine_on: true,
         latitude: 43.700110,
         longitude: -79.416300,
         location_context: "Highway 401 Traffic Jam"
       });
    }

    // 3. Hard Braking + Mercy (Steering Correction)
    // At T-5 mins
    const crashTime = new Date(now.getTime() - 5 * 60 * 1000);
    telemetryData.push({
      timestamp: crashTime,
      speed: 80,
      engine_on: true,
      latitude: 43.800000,
      longitude: -79.500000,
      location_context: "Main St",
      acceleration_g: -0.8 // Hard Braking!
    });

    // Correction 2 seconds later
    telemetryData.push({
      timestamp: new Date(crashTime.getTime() + 2000),
      speed: 75,
      engine_on: true,
      latitude: 43.800100,
      longitude: -79.500100,
      location_context: "Main St",
      steering_angle: 25 // Sharp turn to avoid
    });

    // 4. DSM Fatigue Alert -> Penalize (10 points)
    const dsmEvents: DsmEvent[] = [
      {
        timestamp: new Date(now.getTime() - 45 * 60 * 1000),
        type: 'FATIGUE',
        confidence: 0.95
      }
    ];

    console.log(`[Simulation] Calculating Trust Score for ${driverId}...`);

    const result = await calculateDriverTrust(driverId, telemetryData, dsmEvents);

    return NextResponse.json({
      test_case: "Casino Idle (Penalize), Highway Idle (Safe), Hard Brake + Correction (Mercy), Fatigue (Penalize)",
      result
    });
  } catch (error) {
    console.error('Error in Driver Simulation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
