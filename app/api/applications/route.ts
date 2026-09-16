import { NextResponse } from 'next/server';
import { getCms } from '@/lib/payload';
import { applicationSchema } from '@/lib/validations/application';
import { payloadCollectionRoutes } from '@/lib/payload-collection-routes';

export const { GET, PATCH, DELETE, PUT, OPTIONS } = payloadCollectionRoutes('applications');

function makeReference() {
  const date = new Date().toISOString().slice(0,10).replaceAll('-','');
  return `GAP-${date}-${crypto.randomUUID().slice(0,6).toUpperCase()}`;
}
export async function POST(request: Request) {
  try {
    const parsed = applicationSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid application data.' }, { status: 400 });
    const payload = await getCms();
    const data = parsed.data;
    const countries = await payload.find({ collection: 'countries', where: { id: { equals: data.countryId } }, limit: 1, depth: 0, overrideAccess: false });
    if (!countries.docs.length) return NextResponse.json({ error: 'Please select a valid destination.' }, { status: 400 });
    if (data.universityId) {
      const universities = await payload.find({ collection: 'universities', where: { and: [
        { id: { equals: data.universityId } }, { country: { equals: data.countryId } }, { status: { equals: 'published' } },
      ] }, limit: 1, depth: 0, overrideAccess: false });
      if (!universities.docs.length) return NextResponse.json({ error: 'Please select a published university in your chosen destination.' }, { status: 400 });
    }
    const application = await payload.create({ collection: 'applications', data: {
      reference: makeReference(), studentName: data.studentName, email: data.email, phone: data.phone,
      country: data.countryId, university: data.universityId || undefined, studyLevel: data.studyLevel,
      intake: data.intake, message: data.message, sourcePage: data.sourcePage, status: 'submitted',
      documents: [
        { label: 'Passport / identity document', status: 'required' },
        { label: 'Academic transcripts / certificates', status: 'required' },
        { label: 'English language evidence (if applicable)', status: 'required' },
      ],
    } });
    return NextResponse.json({ ok: true, reference: application.reference }, { status: 201 });
  } catch (error) {
    console.error('Application submission failed:', error);
    return NextResponse.json({ error: 'We could not submit your application. Please try again.' }, { status: 500 });
  }
}
