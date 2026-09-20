import { getCms } from '@/lib/payload';
import { renderEmail, renderPlain, type Row } from '@/lib/email-template';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

// Email clients cannot load WebP or localhost images. Use a PNG in /public/images and a live site URL.
const LOGO_URL = process.env.EMAIL_LOGO_URL || `${SITE_URL}/images/email-logo.png`;

/** Team inboxes, from NOTIFY_EMAIL (comma-separated). */
const teamRecipients = () =>
  (process.env.NOTIFY_EMAIL ?? '').split(',').map((s) => s.trim()).filter(Boolean);

type Message = { to: string | string[]; subject: string; html: string; text: string; replyTo?: string };

/** Never throws: a failed email must not break a form submission. */
async function send(message: Message) {
  try {
    const payload = await getCms();
    await payload.sendEmail(message);
  } catch (error) {
    console.error('[email] could not send:', error);
  }
}

export async function notifyNewLead(lead: {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  interestedCountry?: string;
  message?: string;
  sourcePage?: string;
}) {
  const to = teamRecipients();
  if (!to.length) return console.warn('[email] NOTIFY_EMAIL is not set: no lead notification sent.');

  const rows: Row[] = [
    ['Name', lead.name],
    ['Email', lead.email, `mailto:${lead.email}`],
    ['Phone', lead.phone, lead.phone ? `tel:${lead.phone.replace(/[^+0-9]/g, '')}` : undefined],
    ['Country of interest', lead.interestedCountry],
    ['Message', lead.message],
    ['Sent from', lead.sourcePage],
  ];
  const link = `${SITE_URL}/admin/collections/leads/${lead.id}`;
  const intro = `${lead.name} just sent an enquiry through the website.`;
  await send({
    to,
    replyTo: lead.email,
    subject: `New lead: ${lead.name}`,
    html: renderEmail({
      siteUrl: SITE_URL, logoUrl: LOGO_URL,
      title: 'New lead', intro, rows,
      preheader: `${lead.name} is interested in ${lead.interestedCountry || 'studying abroad'}.`,
      action: { label: 'Open in admin', href: link },
    }),
    text: renderPlain(intro, rows, link),
  });
}

export async function notifyNewApplication(app: {
  id: number | string;
  reference: string;
  studentName: string;
  email: string;
  phone?: string;
  countryName?: string;
  universityName?: string;
  studyLevel: string;
  intake?: string;
  message?: string;
}) {
  const team = teamRecipients();
  const jobs: Promise<void>[] = [];

  if (team.length) {
    const rows: Row[] = [
      ['Name', app.studentName],
      ['Email', app.email, `mailto:${app.email}`],
      ['Phone', app.phone, app.phone ? `tel:${app.phone.replace(/[^+0-9]/g, '')}` : undefined],
      ['Destination', app.countryName],
      ['University', app.universityName],
      ['Study level', app.studyLevel],
      ['Intake', app.intake],
      ['Message', app.message],
    ];
    const link = `${SITE_URL}/admin/collections/applications/${app.id}`;
    const intro = `${app.studentName} submitted an application on the website.`;
    jobs.push(
      send({
        to: team,
        replyTo: app.email,
        subject: `New application ${app.reference}: ${app.studentName}`,
        html: renderEmail({
          siteUrl: SITE_URL, logoUrl: LOGO_URL,
          title: 'New application', intro, rows,
          preheader: `${app.studentName} applied for ${app.countryName || 'a destination'}.`,
          highlight: { label: 'Reference', value: app.reference },
          action: { label: 'Open in admin', href: link },
        }),
        text: renderPlain(intro, [['Reference', app.reference], ...rows], link),
      }),
    );
  } else {
    console.warn('[email] NOTIFY_EMAIL is not set: no application notification sent.');
  }

  // Confirmation to the student
  const first = app.studentName.split(' ')[0] || 'there';
  const intro = `Hi ${first}, thank you for applying. We have received your application and our team will be in touch soon. Please keep your reference number.`;
  const summary: Row[] = [
    ['Destination', app.countryName],
    ['University', app.universityName],
    ['Study level', app.studyLevel],
    ['Intake', app.intake],
  ];
  jobs.push(
    send({
      to: app.email,
      subject: `We received your application (${app.reference})`,
      html: renderEmail({
        siteUrl: SITE_URL, logoUrl: LOGO_URL,
        title: 'Application received', intro, rows: summary,
        preheader: `Your reference number is ${app.reference}.`,
        highlight: { label: 'Your reference number', value: app.reference },
      }),
      text: renderPlain(intro, [['Reference', app.reference], ...summary]),
    }),
  );

  await Promise.all(jobs);
}