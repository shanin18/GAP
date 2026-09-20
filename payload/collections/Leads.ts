import { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn } from "../access";


export const Leads: CollectionConfig = {
  slug: 'leads',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'interestedCountry', 'status', 'assignedTo', 'createdAt'],
    listSearchableFields: ['name', 'email', 'phone'],
  },
  access: {
    create: isLoggedIn,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'phone', type: 'text' },
    { name: 'interestedCountry', type: 'text' },
    { name: 'message', type: 'textarea' },
    { name: 'sourcePage', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      admin: { position: 'sidebar' },
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Application started', value: 'application-started' },
        { label: 'Not proceeding', value: 'not-proceeding' },
      ],
    },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', index: true, admin: { position: 'sidebar' } },
    { name: 'followUpAt', type: 'date', index: true, admin: { position: 'sidebar' } },
    {
      name: 'application',
      type: 'relationship',
      relationTo: 'applications',
      admin: { position: 'sidebar', description: 'Link the application once this lead converts.' },
    },
    { name: 'staffNotes', type: 'textarea' },
    { name: 'emailVerified', type: 'checkbox', defaultValue: false, admin: { readOnly: true, position: 'sidebar' } },
    {
      name: 'verificationToken',
      type: 'text',
      // Never exposed in the admin or the REST API. Server code (local API) can still read and write it.
      access: { read: () => false },
      admin: { hidden: true },
    },
    { name: 'verifiedAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
  ],
};
