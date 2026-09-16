import type { CollectionConfig } from 'payload';

export const News: CollectionConfig = {
  slug: 'news',
  access: {
    read: ({ req }) => req.user ? true : { status: { equals: 'published' } },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'publishedDate'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'coverImageUrl', type: 'text' },
    { name: 'shortBlurb', type: 'textarea', required: true },
    { name: 'content', type: 'richText' },
    { name: 'publishedDate', type: 'date', required: true },
    { name: 'status', type: 'select', defaultValue: 'draft', required: true, options: ['draft', 'published'], index: true },
    { name: 'seoTitle', type: 'text' },
    { name: 'seoDescription', type: 'textarea', maxLength: 170 },
  ],
};
