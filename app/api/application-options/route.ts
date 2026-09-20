import { NextResponse } from 'next/server';
import { getApplicationOptions } from '@/lib/cms-queries';

export async function GET() {
  try {
    const data = await getApplicationOptions();
    return NextResponse.json(data, {
      // Lets a CDN or the browser reuse the answer for 5 minutes
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Application options failed:', error);
    return NextResponse.json({ error: 'Options are unavailable right now.' }, { status: 503 });
  }
}
