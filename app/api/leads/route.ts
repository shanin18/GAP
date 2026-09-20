import { NextResponse } from 'next/server';
import { getCms } from '@/lib/payload';
import { leadSchema } from '@/lib/validations/lead';
import { payloadCollectionRoutes } from '@/lib/payload-collection-routes';
import { guardPublicPost, isHoneypotFilled } from '@/lib/public-form-guard';

const routes = payloadCollectionRoutes('leads');
export const { GET, PATCH, DELETE, PUT, OPTIONS } = routes;

export async function POST(request: Request) {
  try {
    // Staff creating a record from the admin panel: hand the request to Payload untouched
    const staff = await routes.staffPost(request);
    if (staff) return staff;

    const guard = await guardPublicPost(request, { key: 'lead', limit: 5, windowMs: 10 * 60_000 });
    if ('response' in guard) return guard.response;

    // Bots fill the hidden field: pretend it worked, store nothing
    if (isHoneypotFilled(guard.body)) return NextResponse.json({ ok: true }, { status: 201 });

    const parsed = leadSchema.safeParse(guard.body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid form data.' }, { status: 400 });
    }
    const d = parsed.data;
    const email = d.email.trim().toLowerCase();

    const payload = await getCms();

    // The same person sending the form twice in 10 minutes counts once (double clicks, retries)
    const recent = await payload.count({
      collection: 'leads',
      where: { and: [{ email: { equals: email } }, { createdAt: { greater_than: new Date(Date.now() - 10 * 60_000).toISOString() } }] },
    });
    if (recent.totalDocs > 0) return NextResponse.json({ ok: true }, { status: 201 });

    // Only these fields can be set from the public form, whatever the schema allows.
    // Adjust the list to match your leadSchema.
    const lead = await payload.create({
      collection: 'leads',
      data: {
        name: d.name,
        email,
        phone: d.phone,
        interestedCountry: d.interestedCountry,
        message: d.message,
        sourcePage: d.sourcePage,
        status: 'new',
      },
    });

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    console.error('Lead submission failed:', error);
    return NextResponse.json({ error: 'We could not submit your request. Please try again.' }, { status: 500 });
  }
}