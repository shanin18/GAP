import type { CollectionConfig } from 'payload';

export const Universities: CollectionConfig = {
  slug: 'universities',
  access: {
    read: ({ req }) => req.user ? true : { status: { equals: 'published' } },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'city', 'featured', 'status'],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'country', type: 'relationship', relationTo: 'countries', required: true, index: true },
    { name: 'city', type: 'text' },
    { name: 'logoUrl', type: 'text' },
    { name: 'websiteUrl', type: 'text' },
    { name: 'description', type: 'textarea', required: true },
    { name: 'highlights', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'published',
      required: true,
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    { name: 'seoTitle', type: 'text' },
    { name: 'seoDescription', type: 'textarea' },
  ],
};
