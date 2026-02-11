import { NextResponse } from 'next/server';
import { analyzeMaintenanceBill } from '@/lib/ai';

export async function GET() {
  try {
    // Simulate uploading a bill with odometer 50,000 while vehicle has 40,000.
    // The "fraud-bill" string in the URL triggers the mock logic in lib/ai.ts
    const imageUrl = 'https://example.com/fraud-bill.jpg';
    const currentOdometer = 40000;

    console.log(`[Simulation] Analyzing bill: ${imageUrl} against vehicle odometer: ${currentOdometer}`);

    const result = await analyzeMaintenanceBill(imageUrl, currentOdometer);

    return NextResponse.json({
      test_case: "Bill says 50,000km. Vehicle has 40,000km. Expect SUSPICIOUS.",
      result
    });
  } catch (error) {
    console.error('Error in Bill Simulation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
