import type { CollectionConfig } from 'payload';

export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: { useAsTitle: 'filename', defaultColumns: ['filename', 'application', 'documentType', 'uploadedBy', 'updatedAt'] },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  upload: {
    mimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    staticDir: 'private-uploads',
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'private, no-store');
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Content-Security-Policy', "default-src 'none'; sandbox");
    },
  },
  fields: [
    { name: 'application', type: 'relationship', relationTo: 'applications', required: true, index: true },
    { name: 'documentType', type: 'select', required: true, options: [
      { label: 'Passport / identity', value: 'identity' },
      { label: 'Academic transcript / certificate', value: 'academic' },
      { label: 'English language evidence', value: 'english' },
      { label: 'Financial evidence', value: 'financial' },
      { label: 'Other', value: 'other' },
    ]},
    { name: 'uploadedBy', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'reviewStatus', type: 'select', defaultValue: 'received', options: ['received', 'approved', 'needs-update'] },
    { name: 'reviewNote', type: 'textarea' },
  ],
};
