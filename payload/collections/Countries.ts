import type { CollectionConfig } from 'payload';

export const Countries: CollectionConfig = {
  slug: 'countries',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'heroImageUrl', type: 'text' },
    { name: 'body', type: 'richText' },
    {
      name: 'relatedUniversities',
      type: 'relationship',
      relationTo: 'universities',
      hasMany: true,
    },
  ],
};
