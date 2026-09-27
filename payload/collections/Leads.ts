import { assignStaffCreator, validateStaffApplication } from '../hooks/staff-ownership';
import { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn, isAdminField, assignedRecords } from "../access";


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
    read: assignedRecords,
    update: assignedRecords,
    delete: isAdmin,
  },
  hooks: { beforeChange: [assignStaffCreator, validateStaffApplication] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'phone', type: 'text' },
    { name: 'interestedCountry', type: 'text' },
    { name: 'message', type: 'textarea' },
    { name: 'sourcePage', type: 'text', admin: { readOnly: true, description: 'Read-only: captured from the website page where the enquiry was submitted. / means the homepage.' } },
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
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', index: true, access: { create: isAdminField, update: isAdminField }, admin: { position: 'sidebar', components: { Field: '/components/admin/WorkflowFields#AssignmentField' } } },
    { name: 'followUpAt', type: 'date', index: true, admin: { date: { pickerAppearance: 'dayAndTime' }, position: 'sidebar', description: 'Due follow-ups appear automatically in Reminders while the workspace is open. Reschedule after following up, or close the lead when finished.' } },
    {
      name: 'application',
      type: 'relationship',
      relationTo: 'applications',
      admin: { position: 'sidebar', description: 'Optional: connect this enquiry to the student application. Use + to create one on their behalf, then save this lead. If they already applied through the website, select that application to avoid a duplicate.' },
    },
    { name: 'staffNotes', type: 'textarea' },
    { name: 'emailVerified', type: 'checkbox', defaultValue: false, access: { create: () => false, update: () => false }, admin: { readOnly: true, position: 'sidebar', components: { Field: '/components/admin/WorkflowFields#VerificationStatus' } } },
    {
      name: 'verificationToken',
      type: 'text',
      // Never exposed in the admin or the REST API. Server code (local API) can still read and write it.
      access: { read: () => false, create: () => false, update: () => false },
      admin: { hidden: true },
    },
    { name: 'verifiedAt', type: 'date', access: { create: () => false, update: () => false }, admin: { hidden: true } },
  ],
};
