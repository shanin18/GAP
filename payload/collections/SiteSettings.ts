import type { CollectionConfig } from 'payload';

export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  admin: { useAsTitle: 'siteName' },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'Global Admission Platform' },
    { name: 'address', type: 'textarea' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'facebookUrl', type: 'text' },
    { name: 'instagramUrl', type: 'text' },
    { name: 'maintenanceMode', type: 'checkbox', defaultValue: false },
  ],
};
