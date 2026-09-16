import type { CollectionConfig } from 'payload';

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  admin: { useAsTitle: 'studentName' },
  fields: [
    { name: 'studentName', type: 'text', required: true },
    { name: 'university', type: 'relationship', relationTo: 'universities' },
    { name: 'quote', type: 'textarea', required: true },
    { name: 'rating', type: 'number', min: 1, max: 5, defaultValue: 5 },
    { name: 'photoUrl', type: 'text' },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
};
