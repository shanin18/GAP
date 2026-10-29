import { assignStaffCreator, validateStaffApplication } from '../hooks/staff-ownership';
import { CollectionConfig, type CollectionBeforeChangeHook } from "payload";
import { isAdmin, isLoggedIn, isAdminField, assignedRecords } from "../access";
import { convertLead } from '../endpoints/convert-lead';

/** Linking an application by hand also marks an open lead Converted. */
const markConverted: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const linkedNow = data.application && !originalDoc?.application;
  const open = ['new', 'contacted'].includes(data.status ?? originalDoc?.status ?? 'new');
  if (linkedNow && open) data.status = 'application-started';
  return data;
};


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
  hooks: { beforeChange: [assignStaffCreator, validateStaffApplication, markConverted] },
  endpoints: [convertLead],
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
      admin: { position: 'sidebar', description: 'New → Contacted → Converted. Use Not interested if they stop.' },
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Converted', value: 'application-started' },
        { label: 'Not interested', value: 'not-proceeding' },
      ],
    },
    { name: 'convertToApplication', type: 'ui', admin: { position: 'sidebar', components: { Field: '/components/admin/ConvertLead#ConvertLead' } } },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', index: true, access: { create: isAdminField, update: isAdminField }, admin: { position: 'sidebar', components: { Field: '/components/admin/WorkflowFields#AssignmentField' } } },
    { name: 'followUpAt', label: 'Follow up on', type: 'date', index: true, admin: { date: { pickerAppearance: 'dayAndTime' }, position: 'sidebar', description: 'Shows in Reminders when due. Reschedule after following up, or close the lead when finished.' } },
    {
      name: 'application',
      type: 'relationship',
      relationTo: 'applications',
      admin: { position: 'sidebar', description: 'Filled in by Convert to application. If the student already applied through the website, select that application here instead to avoid a duplicate.' },
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
