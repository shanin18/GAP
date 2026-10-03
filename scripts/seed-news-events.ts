import { getPayload } from 'payload';
import type { News } from '../payload-types';
import { stockImage } from '../lib/stock-images';

process.env.PAYLOAD_PUSH_SCHEMA = 'false';
process.env.SMTP_HOST = '';
const { default: config } = await import('../payload/payload.config');
const payload = await getPayload({ config });
const text = (value: string) => ({ type: 'text', text: value, format: 0, detail: 0, mode: 'normal', style: '', version: 1 });
const paragraph = (value: string) => ({ type: 'paragraph', children: [text(value)], direction: 'ltr', format: '', indent: 0, version: 1, textFormat: 0, textStyle: '' });
const heading = (value: string) => ({ type: 'heading', tag: 'h2', children: [text(value)], direction: 'ltr', format: '', indent: 0, version: 1 });
const entries = [
  { slug: 'choosing-your-study-destination', title: 'Choosing a study destination that fits your goals', image: 'canada', shortBlurb: 'A practical way to compare destinations, courses and everyday student life before making your shortlist.', sections: [
    ['Start with the course', 'Write down the subjects you enjoy, the qualification you want and the skills you hope to build. Compare course modules, teaching methods and assessment rather than choosing a destination from photographs alone.'],
    ['Compare your complete budget', 'Include tuition, accommodation, transport, food and the costs of preparing your application. Use figures supplied directly by the institution and review what any scholarship actually covers.'],
    ['Think about everyday life', 'Research the campus location, climate, accommodation choices and student support. A smaller city and a large metropolitan campus can offer very different experiences.'],
    ['Bring a shortlist to your appointment', 'Choose two or three possible destinations and explain why each interests you. An adviser can help you identify questions to ask institutions and decide what information you still need.'] ] },
  { slug: 'prepare-your-university-application', title: 'Prepare your university application without the last-minute rush', image: 'planning', shortBlurb: 'Organise your records, questions and deadlines into a clear application plan.', sections: [
    ['Build a course-specific checklist', 'Read the application instructions for your chosen course. Keep a list of required records, supporting statements and any additional tasks. Requirements differ between institutions and programmes.'],
    ['Keep your documents organised', 'Store readable copies of your academic records and label files consistently. Check names and dates across documents. Ask the institution whether translations or certified copies are needed before arranging them.'],
    ['Work backwards from the deadline', 'Allow time to request references, prepare statements and resolve missing information. Keep a calendar of the dates given by the institution and avoid assuming every course has the same deadline.'],
    ['Review before submitting', 'Check that you selected the correct programme and intake, answered each question and attached the requested files. Keep a copy of the submitted application and confirmation for your records.'] ] },
  { slug: 'make-the-most-of-your-counselling-session', title: 'Make the most of your first study-abroad counselling session', image: 'academic', shortBlurb: 'Bring the right questions and leave with a practical set of next steps.', sections: [
    ['Share your starting point', 'Tell your adviser about your academic background, preferred subjects, budget and intended start date. It is fine if you have not chosen a university yet.'],
    ['Prepare a few useful questions', 'Ask how courses differ, what information you should confirm directly with universities and which documents to prepare first. Discuss the reasons behind each recommendation.'],
    ['Keep expectations clear', 'Ask what support is included and which decisions remain with the institution. Counselling is guidance; admission, scholarships and visa outcomes are determined by the relevant decision makers.'],
    ['Agree on the next step', 'Finish with a short action list and a follow-up date. Keep notes so you can compare your options after the session rather than feeling pressured to decide immediately.'] ] },
  { slug: 'preview-study-abroad-planning-session', title: 'Study-abroad planning session — preview event', image: 'study', shortBlurb: 'Explore how to build a destination and course shortlist in this sample event announcement.', eventDate: '2026-11-14T10:00:00+06:00', eventLocation: 'Online — preview only; no live meeting or registration', sections: [
    ['Preview announcement', 'This is fictional test content for the event page. The date is illustrative. No session is confirmed and registration is not open.'],
    ['Proposed session outline', 'An introduction to choosing a course, comparing destination options and preparing questions for a counselling appointment.'],
    ['Who the session would suit', 'Students beginning their study-abroad research and families who want to understand how to organise the first steps.'],
    ['What to prepare', 'For a real session, bring a list of preferred subjects, your intended intake and questions about your study plans. Confirm attendance details with GAP when a verified event is announced.'] ] },
  { slug: 'preview-application-preparation-workshop', title: 'Application preparation workshop — preview event', image: 'planning', shortBlurb: 'A sample workshop announcement about documents, application timelines and common preparation questions.', eventDate: '2026-11-21T15:00:00+06:00', eventLocation: 'Venue to be confirmed — preview only', sections: [
    ['Preview announcement', 'This event is sample content for testing. The date and workshop are not confirmed. There is no booking or ticket associated with this page.'],
    ['Proposed workshop topics', 'Organising academic records, reading course requirements, planning application deadlines and reviewing a personal checklist.'],
    ['Practical preparation', 'A real workshop could help attendees turn a list of university requirements into a manageable set of tasks. Exact requirements should always be confirmed with the chosen institution.'],
    ['Before attending a real event', 'Check the official announcement for the venue, time, organiser and registration details. Do not submit personal documents through unverified event links.'] ] },
  { slug: 'preview-pre-departure-conversation', title: 'Getting ready for your next chapter — preview event', image: 'departure', shortBlurb: 'A sample pre-departure conversation covering arrival planning and settling into student life.', eventDate: '2026-11-28T11:00:00+06:00', eventLocation: 'Online — preview only; no live meeting or registration', sections: [
    ['Preview announcement', 'This is a fictional event announcement used to demonstrate the website. The date is illustrative and no session or registration is confirmed.'],
    ['Proposed conversation topics', 'Planning travel, reviewing accommodation arrangements, preparing arrival contacts and understanding where to find campus support.'],
    ['Build an arrival checklist', 'For a real departure, confirm your arrangements with the relevant providers and institution. Keep important contact details accessible and check official guidance applicable to your destination.'],
    ['Ask your questions early', 'Bring practical questions about your first week and any arrangements you still need to confirm. Verified event details will be published separately when available.'] ] },
];
try {
  for (const [index, entry] of entries.entries()) {
    const existing = await payload.find({ collection: 'news', where: { slug: { equals: entry.slug } }, limit: 1, depth: 0 });
    if (existing.docs.length) { console.log(`Kept ${entry.slug}`); continue; }
    const coverImageUrl = stockImage(entry.image);
    if (!coverImageUrl) throw new Error(`Missing optimized image: ${entry.image}`);
    const data: Omit<News, 'id' | 'createdAt' | 'updatedAt'> = {
      title: entry.title, slug: entry.slug, shortBlurb: entry.shortBlurb,
      coverImageUrl, entryType: entry.eventDate ? 'event' : 'blog',
      eventDate: entry.eventDate, eventLocation: entry.eventLocation,
      publishedDate: new Date(Date.now() - (entries.length - index) * 60000).toISOString(),
      status: 'published',
      content: { root: { type: 'root', children: entry.sections.flatMap(([title, body]) => [heading(title), paragraph(body)]), direction: 'ltr', format: '', indent: 0, version: 1 } },
      seoDescription: entry.shortBlurb,
    };
    await payload.create({ collection: 'news', data, overrideAccess: true, context: { disableRevalidate: true } });
    console.log(`Created ${entry.slug}`);
  }
  const published = await payload.find({ collection: 'news', overrideAccess: false, where: { slug: { in: entries.map(entry => entry.slug) } }, limit: 6, depth: 0 });
  if (published.docs.length !== entries.length || published.docs.some(doc => !doc.content?.root.children.length || !doc.coverImageUrl)) {
    throw new Error('Sample entries did not pass public content verification.');
  }
  console.log(`Verified ${published.docs.length} public entries with full content and cover images.`);
} finally { await payload.destroy(); }
