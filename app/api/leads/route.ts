import { NextResponse } from 'next/server';
import { getCms } from '@/lib/payload';
import { leadSchema } from '@/lib/validations/lead';
import { payloadCollectionRoutes } from '@/lib/payload-collection-routes';

export const { GET, PATCH, DELETE, PUT, OPTIONS } = payloadCollectionRoutes('leads');

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid form data.' }, { status: 400 });
    }

    const payload = await getCms();
    const lead = await payload.create({ collection: 'leads', data: { ...parsed.data, status: 'new' } });

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    console.error('Lead submission failed:', error);
    return NextResponse.json({ error: 'We could not submit your request. Please try again.' }, { status: 500 });
  }
}
