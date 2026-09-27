import { assignStaffCreator } from '../hooks/staff-ownership';
import { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn, isAdminField, assignedRecords } from "../access";
import { randomBytes } from "crypto";


// Same format as the public form: GAP-YYYYMMDD-XXXXXXXX
const makeReference = () =>
  `GAP-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomBytes(4).toString('hex').toUpperCase()}`;

export const Applications: CollectionConfig = {
  slug: 'applications',
  defaultSort: '-updatedAt',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'studentName', 'university', 'status', 'priority', 'assignedTo', 'updatedAt'],
    listSearchableFields: ['reference', 'studentName', 'email', 'phone'],
  },
  access: {
    create: isLoggedIn,
    read: assignedRecords,
    update: assignedRecords,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      // Staff can now create applications in the admin: the reference is generated automatically
      ({ data, operation }) => {
        if (operation === 'create' && data && !data.reference) data.reference = makeReference();
        return data;
      },
    ],
    beforeChange: [assignStaffCreator,
      // Writes the status timeline automatically, so nobody has to type it by hand
      ({ data, originalDoc, operation, req }) => {
        const changed = data.status && data.status !== originalDoc?.status;
        if (operation === 'create' || changed) {
          data.statusHistory = [
            ...(data.statusHistory ?? originalDoc?.statusHistory ?? []),
            {
              status: data.status ?? originalDoc?.status ?? 'submitted',
              changedAt: new Date().toISOString(),
              changedBy: req.user?.id,
            },
          ];
        }
        return data;
      },
    ],
  },
  fields: [
    { name: 'reference', type: 'text', required: true, unique: true, index: true, admin: { readOnly: true, description: 'Read-only: generated automatically when the application is created.' } },
    { name: 'studentName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'phone', type: 'text' },
    { name: 'country', type: 'relationship', relationTo: 'countries', required: true },
    { name: 'university', type: 'relationship', relationTo: 'universities' },
    { name: 'studyLevel', type: 'select', required: true, options: ['Foundation', 'Undergraduate', 'Postgraduate', 'PhD', 'Other'] },
    { name: 'intake', type: 'text' },
    { name: 'message', type: 'textarea' },
    { name: 'sourcePage', type: 'text', admin: { readOnly: true, description: 'Read-only: captured from the website page where the application was submitted. May be blank for applications created by staff.' } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'submitted',
      index: true,
      admin: { position: 'sidebar' },
      options: [
        { label: 'Submitted', value: 'submitted' },
        { label: 'Profile review', value: 'profile-review' },
        { label: 'Documents required', value: 'documents-required' },
        { label: 'Ready to apply', value: 'ready-to-apply' },
        { label: 'Submitted to university', value: 'university-submitted' },
        { label: 'Offer received', value: 'offer-received' },
        { label: 'Enrolled', value: 'enrolled' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'normal',
      index: true,
      admin: { position: 'sidebar' },
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
    },
    {
      name: 'assignedTo',
      access: { create: isAdminField, update: isAdminField },
      type: 'relationship',
      relationTo: 'users',
      index: true,
      admin: { position: 'sidebar', components: { Field: '/components/admin/WorkflowFields#AssignmentField' } },
    },
    { name: 'nextAction', type: 'text', admin: { position: 'sidebar' } },
    { name: 'nextActionAt', type: 'date', index: true, admin: { date: { pickerAppearance: 'dayAndTime' }, position: 'sidebar' } },
    {
      name: 'documents',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'status', type: 'select', defaultValue: 'required', options: ['required', 'received', 'approved', 'needs-update'] },
        { name: 'file', type: 'upload', relationTo: 'documents', admin: { description: 'Private staff-authenticated document record.' } },
      ],
    },
    {
      name: 'statusHistory',
      type: 'array',
      admin: { readOnly: true, description: 'Read-only: recorded automatically whenever the status changes.' },
      fields: [
        { name: 'status', type: 'text', required: true },
        { name: 'note', type: 'textarea' },
        { name: 'changedAt', type: 'date', required: true },
        { name: 'changedBy', type: 'relationship', relationTo: 'users' },
      ],
    },
    { name: 'internalNotes', type: 'textarea' },
  ],
};
