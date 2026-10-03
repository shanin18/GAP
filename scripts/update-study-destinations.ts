import { getPayload } from 'payload';

// Original editorial starting points, editable in Countries > Body after import.
// No visa, employment, scholarship or admission outcome is promised.
const destinations = [
  ['Australia', 'australia', 'Compare campus-based degrees, practical learning and research pathways across Australia.', 'Sydney, Melbourne, Brisbane, Adelaide and Perth', 'Business, engineering, health sciences and computing'],
  ['Canada', 'canada', 'Explore university and college routes, comparing the qualification, province and institution before choosing a program.', 'Toronto, Vancouver, Ottawa, Montreal and Calgary', 'Computing, business, engineering and applied sciences'],
  ['United Kingdom', 'united-kingdom', 'Build a shortlist across England, Scotland, Wales and Northern Ireland, with attention to course structure and assessment.', 'London, Manchester, Birmingham, Edinburgh and Cardiff', 'Business, law, design, engineering and social sciences'],
  ['New Zealand', 'new-zealand', 'Compare university and applied study options while planning for campus location and a manageable student budget.', 'Auckland, Wellington, Christchurch and Dunedin', 'Environmental studies, agriculture, business and technology'],
  ['United States', 'united-states', 'Explore a broad range of campuses and degree structures, checking accreditation, academic fit and the full cost of attendance.', 'Boston, New York, Chicago, Los Angeles and Houston', 'Computer science, business, engineering and liberal arts'],
  ['Finland', 'finland', 'Compare universities and universities of applied sciences, focusing on teaching language and the balance of theory and practice.', 'Helsinki, Espoo, Tampere, Turku and Oulu', 'Technology, design, business and environmental studies'],
  ['Sweden', 'sweden', 'Explore research-oriented and collaborative study environments, comparing course content and application requirements.', 'Stockholm, Gothenburg, Lund and Uppsala', 'Engineering, sustainability, business and design'],
  ['Denmark', 'denmark', 'Consider degree options with attention to project work, teaching language and the practical requirements of living in Denmark.', 'Copenhagen, Aarhus, Odense and Aalborg', 'Engineering, business, architecture and life sciences'],
  ['Switzerland', 'switzerland', 'Compare institutions across language regions and check both the language of instruction and the local cost of living.', 'Zurich, Geneva, Lausanne, Bern and Basel', 'Hospitality, business, engineering and life sciences'],
  ['Austria', 'austria', 'Explore university and applied-science routes, checking language preparation and individual course entry requirements.', 'Vienna, Graz, Innsbruck, Linz and Salzburg', 'Engineering, business, music and social sciences'],
  ['Germany', 'germany', 'Compare university and applied-science degrees, checking qualification recognition and German or English language requirements.', 'Berlin, Munich, Hamburg, Frankfurt and Aachen', 'Engineering, computing, business and natural sciences'],
  ['Malta', 'malta', 'Explore study options in Malta with careful checks on provider recognition, course delivery and accommodation.', 'Msida, Valletta and St Julian’s', 'Business, hospitality, computing and language studies'],
  ['Poland', 'poland', 'Compare English-taught and Polish-taught courses, checking the recognition of your previous qualifications and degree award.', 'Warsaw, Krakow, Wroclaw, Gdansk and Poznan', 'Medicine, engineering, computing and business'],
  ['Lithuania', 'lithuania', 'Explore university and college options, comparing academic requirements, teaching language and student support.', 'Vilnius, Kaunas and Klaipeda', 'Business, engineering, computing and health sciences'],
] as const;

function node(type: string, text: string, tag?: string) {
  return { type, version: 1, format: '', indent: 0, direction: 'ltr' as const, ...(tag ? { tag } : {}), children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }] };
}
function guide(name: string, intro: string, cities: string, programs: string) {
  const sections = [
    ['Overview', intro],
    ['Admission requirements', 'Prepare your passport, academic transcripts and certificates, a clear study history, and the language evidence required by the course. Some programs also request a statement of purpose, references, a portfolio or an interview. Entry criteria depend on your qualification and the institution; we review your profile before shortlisting.'],
    ['Intakes and deadlines', 'Choose a course first, then confirm its available start dates and application deadline directly with the institution. Scholarship and competitive-course deadlines can be earlier than general admission. Allow time for transcripts, language tests, offer conditions, accommodation and the relevant visa process.'],
    ['Programs and study levels', `Subjects to explore include ${programs.toLowerCase()}. Compare foundation or pathway study, bachelor’s degrees, postgraduate taught courses and research degrees according to your existing qualifications. Confirm duration, modules, placement arrangements and professional recognition on the individual course page.`],
    ['Universities', `Shortlist institutions in ${name} by course content, entry requirements, location, accreditation and total cost. Ask your adviser for a course-level comparison and verify each offer with the institution. A university listing or recommendation does not itself imply a partnership with GAP.`],
    ['Tuition and living costs', 'Build a budget that includes tuition, any deposit, accommodation, utilities, food, transport, health cover, study materials, travel and application fees. Obtain a current fee quotation for your exact course and intake. Scholarship eligibility varies, and a budget should not depend on an unconfirmed award or future part-time income.'],
    ['Student cities', `Places to compare include ${cities}. Look beyond the city name: check the campus address, housing availability, commute, local services and support available to international students.`],
    ['Work opportunities', 'Check the current official immigration rules for your nationality, course and permission before accepting work. Permission to study does not guarantee unrestricted work rights or a job. For plans after graduation, confirm the current eligibility requirements with the relevant government authority; these can change during your studies.'],
    ['Articles and useful reading', 'Read the latest course handbook, international admissions guidance, accommodation advice and official student immigration guidance before making a decision. Country-specific GAP articles appear below when published and linked by our team.'],
    ['Questions and answers', `Which course should I choose? Start with your academic background, interests and career goals, then compare suitable programs in ${name}.`],
    ['Can I apply without a language test?', 'This depends on the institution and course. An exemption or alternative assessment must be confirmed by the institution; it should never be assumed.'],
    ['Are admission, scholarships or visas guaranteed?', 'No. Institutions, funding bodies and immigration authorities make their own decisions. GAP helps you understand requirements and prepare your application.'],
    ['How do I get started?', 'Book an appointment and bring your academic records, preferred subjects, intended start date and an approximate budget. We will discuss suitable next steps.'],
  ];
  return { root: { type: 'root', version: 1, format: '' as const, indent: 0, direction: 'ltr' as const, children: sections.flatMap(([title, text], index) => [node('heading', title, index > 9 ? 'h3' : 'h2'), node('paragraph', text)]) } };
}

process.env.PAYLOAD_PUSH_SCHEMA = 'false';
process.env.SMTP_HOST = '';
const { default: config } = await import('../payload/payload.config');
const payload = await getPayload({ config });
try {
  for (const [name, slug, introduction, cities, programs] of destinations) {
    const result = await payload.find({ collection: 'countries', where: { or: [{ slug: { equals: slug } }, { name: { equals: name } }] }, limit: 1, depth: 0 });
    const existing = result.docs[0];
    const body = guide(name, introduction, cities, programs);
    if (existing) {
      // Preserve existing authored copy. Add the guide once, identified by its heading.
      if (JSON.stringify(existing.body ?? {}).includes('Admission requirements')) continue;
      if (existing.body?.root?.children?.length) body.root.children.unshift(...existing.body.root.children as typeof body.root.children);
      await payload.update({ collection: 'countries', id: existing.id, context: { disableRevalidate: true }, data: { body } });
    } else {
      await payload.create({ collection: 'countries', context: { disableRevalidate: true }, data: { name, slug, introduction, body, highlights: [{ text: 'Explore your study options' }, { text: 'Plan your application' }, { text: 'Prepare your student budget' }] } });
    }
    console.log(`Prepared country: ${name}`);
  }
  const services = [
    { title: 'Academic Counselling', icon: 'MessageCircle' as const, sortOrder: -20, shortDescription: 'Choose a study path that fits your strengths, interests and academic background.', introduction: 'Turn a broad study ambition into a practical academic plan. We review your qualifications, discuss subject interests and help you compare suitable courses and entry routes.', points: ['Academic profile and qualification review', 'Subject, course and university comparison', 'Language preparation and entry requirement planning', 'A practical application and intake timeline'] },
    { title: 'Career Counselling', icon: 'Search' as const, sortOrder: -19, shortDescription: 'Connect your study choices with your longer-term career goals.', introduction: 'Explore how different courses relate to the work you want to pursue. We help you consider skills, professional recognition and development opportunities without promising employment outcomes.', points: ['Career interests and transferable skills discussion', 'Course choices aligned with career direction', 'Questions to ask about internships and professional accreditation', 'Planning for a CV, portfolio and future skills development'] },
  ];
  for (const service of services) {
    const { docs } = await payload.find({ collection: 'services', where: { title: { equals: service.title } }, limit: 1 });
    if (!docs.length) await payload.create({ collection: 'services', context: { disableRevalidate: true }, data: { ...service, points: service.points.map(text => ({ text })) } });
    console.log(`Prepared service: ${service.title}`);
  }
} finally { await payload.destroy(); }
