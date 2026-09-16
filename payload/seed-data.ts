export const seedData = {
  countries: [
    { name: 'Australia', slug: 'australia' },
    { name: 'Canada', slug: 'canada' },
    { name: 'New Zealand', slug: 'new-zealand' },
  ],
  services: [
    { title: 'Counselling', shortDescription: 'Understand your goals and identify a practical study-abroad direction.', sortOrder: 1 },
    { title: 'University & Program Selection', shortDescription: 'Compare suitable universities and programs around your academic goals.', sortOrder: 2 },
    { title: 'Admission & Enrollment', shortDescription: 'Move through applications, documents and enrollment with structured support.', sortOrder: 3 },
    { title: 'Pre-departure Guidance', shortDescription: 'Prepare for the transition from admission to your departure.', sortOrder: 4 },
  ],
};

export const sampleUniversities = [
  { name: 'Example University Melbourne', slug: 'example-university-melbourne', countrySlug: 'australia', city: 'Melbourne', description: 'Sample CMS university record for the GAP university discovery experience.', featured: true, status: 'published' },
  { name: 'Example University Toronto', slug: 'example-university-toronto', countrySlug: 'canada', city: 'Toronto', description: 'Sample CMS university record for the GAP university discovery experience.', featured: true, status: 'published' },
  { name: 'Example University Auckland', slug: 'example-university-auckland', countrySlug: 'new-zealand', city: 'Auckland', description: 'Sample CMS university record for the GAP university discovery experience.', featured: false, status: 'published' },
];
