import type { CollectionConfig } from 'payload';

export const Applications: CollectionConfig = {
  slug: 'applications',
  admin: { useAsTitle: 'reference', defaultColumns: ['reference','studentName','university','status','updatedAt'] },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'reference', type: 'text', required: true, unique: true, index: true, admin: { readOnly: true } },
    { name: 'studentName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'phone', type: 'text' },
    { name: 'country', type: 'relationship', relationTo: 'countries', required: true },
    { name: 'university', type: 'relationship', relationTo: 'universities' },
    { name: 'studyLevel', type: 'select', required: true, options: ['Foundation','Undergraduate','Postgraduate','PhD','Other'] },
    { name: 'intake', type: 'text' },
    { name: 'message', type: 'textarea' },
    { name: 'sourcePage', type: 'text' },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', index: true },
    { name: 'priority', type: 'select', defaultValue: 'normal', index: true, options: [{ label: 'Low', value: 'low' }, { label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }, { label: 'Urgent', value: 'urgent' }] },
    { name: 'nextAction', type: 'text' },
    { name: 'nextActionAt', type: 'date', index: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'submitted', index: true, options: [
      { label: 'Submitted', value: 'submitted' }, { label: 'Profile review', value: 'profile-review' },
      { label: 'Documents required', value: 'documents-required' }, { label: 'Ready to apply', value: 'ready-to-apply' },
      { label: 'Submitted to university', value: 'university-submitted' }, { label: 'Offer received', value: 'offer-received' },
      { label: 'Enrolled', value: 'enrolled' }, { label: 'Closed', value: 'closed' },
    ]},
    { name: 'documents', type: 'array', fields: [
      { name: 'label', type: 'text', required: true },
      { name: 'status', type: 'select', defaultValue: 'required', options: ['required','received','approved','needs-update'] },
      { name: 'file', type: 'upload', relationTo: 'documents', admin: { description: 'Private staff-authenticated document record.' } },
    ]},
    { name: 'statusHistory', type: 'array', admin: { description: 'Internal timeline of important application updates.' }, fields: [{ name: 'status', type: 'text', required: true }, { name: 'note', type: 'textarea' }, { name: 'changedAt', type: 'date', required: true }, { name: 'changedBy', type: 'relationship', relationTo: 'users' }] },
    { name: 'internalNotes', type: 'textarea', access: { create: ({ req }) => Boolean(req.user), read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user) } },
  ],
};
