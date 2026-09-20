import { NextResponse, after } from 'next/server';
import { getCms } from '@/lib/payload';
import { applicationSchema } from '@/lib/validations/application';
import { payloadCollectionRoutes } from '@/lib/payload-collection-routes';
import { guardPublicPost, isHoneypotFilled } from '@/lib/public-form-guard';
import { notifyNewApplication } from '@/lib/notify';

const routes = payloadCollectionRoutes('applications');
export const { GET, PATCH, DELETE, PUT, OPTIONS } = routes;

function makeReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `GAP-${date}-${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    // Staff creating a record from the admin panel: hand the request to Payload untouched
    const staff = await routes.staffPost(request);
    if (staff) return staff;

    const guard = await guardPublicPost(request, { key: 'application', limit: 3, windowMs: 15 * 60_000 });
    if ('response' in guard) return guard.response;

    // Bots fill the hidden field: pretend it worked, store nothing
    if (isHoneypotFilled(guard.body)) {
      return NextResponse.json({ ok: true, reference: makeReference() }, { status: 201 });
    }

    const parsed = applicationSchema.safeParse(guard.body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid application data.' }, { status: 400 });
    }
    const data = parsed.data;
    const email = data.email.trim().toLowerCase();
    const payload = await getCms();

    // Direct lookup instead of a search
    const country = await payload
      .findByID({ collection: 'countries', id: data.countryId, depth: 0, overrideAccess: false })
      .catch(() => null);
    if (!country) return NextResponse.json({ error: 'Please select a valid destination.' }, { status: 400 });

    let universityName: string | undefined;
    if (data.universityId) {
      const universities = await payload.find({
        collection: 'universities',
        where: {
          and: [
            { id: { equals: data.universityId } },
            { country: { equals: data.countryId } },
            { status: { equals: 'published' } },
          ],
        },
        limit: 1,
        depth: 0,
        overrideAccess: false,
      });
      if (!universities.docs.length) {
        return NextResponse.json({ error: 'Please select a published university in your chosen destination.' }, { status: 400 });
      }
      universityName = universities.docs[0].name;
    }

    // Avoid double submissions (double click, refresh)
    const recent = await payload.count({
      collection: 'applications',
      where: {
        and: [
          { email: { equals: email } },
          { country: { equals: data.countryId } },
          { createdAt: { greater_than: new Date(Date.now() - 10 * 60_000).toISOString() } },
        ],
      },
    });
    if (recent.totalDocs > 0) {
      return NextResponse.json(
        { error: 'We have already received your application. Our team will be in touch soon.' },
        { status: 409 },
      );
    }

    const application = await payload.create({
      collection: 'applications',
      data: {
        reference: makeReference(),
        studentName: data.studentName,
        email,
        phone: data.phone,
        country: data.countryId,
        university: data.universityId || undefined,
        studyLevel: data.studyLevel,
        intake: data.intake,
        message: data.message,
        sourcePage: data.sourcePage,
        status: 'submitted',
        documents: [
          { label: 'Passport / identity document', status: 'required' },
          { label: 'Academic transcripts / certificates', status: 'required' },
          { label: 'English language evidence (if applicable)', status: 'required' },
        ],
      },
    });
    // Email the team and confirm to the student after the response is sent
    after(() =>
      notifyNewApplication({
        id: application.id,
        reference: application.reference,
        studentName: data.studentName,
        email,
        phone: data.phone,
        countryName: country.name,
        universityName,
        studyLevel: data.studyLevel,
        intake: data.intake,
        message: data.message,
      }),
    );

    return NextResponse.json({ ok: true, reference: application.reference }, { status: 201 });
  } catch (error) {
    console.error('Application submission failed:', error);
    return NextResponse.json({ error: 'We could not submit your application. Please try again.' }, { status: 500 });
  }
}
