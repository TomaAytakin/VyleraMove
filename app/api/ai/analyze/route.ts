import { NextRequest, NextResponse } from 'next/server';
import { analyzeMaintenanceBill } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, currentOdometer } = await req.json();

    if (!imageUrl || currentOdometer === undefined) {
      return NextResponse.json({ error: 'Missing imageUrl or currentOdometer' }, { status: 400 });
    }

    const result = await analyzeMaintenanceBill(imageUrl, currentOdometer);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
