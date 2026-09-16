import type { CollectionConfig } from 'payload';

export const Services: CollectionConfig = {
  slug: 'services',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'icon', type: 'text' },
    { name: 'shortDescription', type: 'textarea', required: true },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
};
