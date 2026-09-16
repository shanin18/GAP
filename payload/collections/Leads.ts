import type { CollectionConfig } from 'payload';

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: { useAsTitle: 'email', defaultColumns: ['name','email','interestedCountry','status','assignedTo','updatedAt'] },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'phone', type: 'text' },
    { name: 'interestedCountry', type: 'text' },
    { name: 'message', type: 'textarea' },
    { name: 'sourcePage', type: 'text' },
    { name: 'status', type: 'select', required: true, defaultValue: 'new', index: true, options: [
      { label: 'New', value: 'new' }, { label: 'Contacted', value: 'contacted' },
      { label: 'Qualified', value: 'qualified' }, { label: 'Application started', value: 'application-started' },
      { label: 'Not proceeding', value: 'not-proceeding' },
    ]},
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', index: true },
    { name: 'followUpAt', type: 'date', index: true },
    { name: 'staffNotes', type: 'textarea', access: { create: ({ req }) => Boolean(req.user), read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user) } },
    { name: 'emailVerified', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
    { name: 'verificationToken', type: 'text', admin: { readOnly: true } },
    { name: 'verifiedAt', type: 'date', admin: { readOnly: true } },
  ],
};
