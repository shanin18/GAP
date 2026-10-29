import { assignStaffCreator } from '../hooks/staff-ownership';
import { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn, isAdminField, assignedRecords } from "../access";
import { randomBytes } from "crypto";


// Same format as the public form: GAP-YYYYMMDD-XXXXXXXX
const makeReference = () =>
  `GAP-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomBytes(4).toString('hex').toUpperCase()}`;

/** Every new application starts with this checklist, however it was created. */
const documentChecklist = [
  { label: 'Passport / identity document', status: 'required' },
  { label: 'Academic transcripts / certificates', status: 'required' },
  { label: 'English language evidence (if applicable)', status: 'required' },
];

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
        if (operation === 'create' && data && !data.documents?.length) data.documents = documentChecklist.map(item => ({ ...item }));
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
              status: data.status ?? originalDoc?.status ?? 'documents-required',
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
    // Optional here so a lead can be converted before the level is known; the website form still requires it
    { name: 'studyLevel', type: 'select', options: ['Foundation', 'Undergraduate', 'Postgraduate', 'PhD', 'Other'] },
    { name: 'intake', type: 'text', admin: { description: 'When the student wants to start, written as month and year, for example "September 2027".' } },
    { name: 'message', type: 'textarea' },
    { name: 'sourcePage', type: 'text', admin: { readOnly: true, description: 'Read-only: the website page the student’s enquiry came from, copied when a lead is converted. Blank for applications staff create directly.' } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'documents-required',
      index: true,
      admin: { position: 'sidebar', description: 'Documents → Applied to university → Offer → Enrolled. Use Closed if the student stops.' },
      options: [
        { label: 'Documents', value: 'documents-required' },
        { label: 'Applied to university', value: 'university-submitted' },
        { label: 'Offer', value: 'offer-received' },
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
    { name: 'nextAction', label: 'Next step', type: 'text', admin: { position: 'sidebar' } },
    { name: 'nextActionAt', label: 'Follow up on', type: 'date', index: true, admin: { date: { pickerAppearance: 'dayAndTime' }, position: 'sidebar', description: 'Shows in Reminders when due.' } },
    {
      name: 'documents',
      type: 'array',
      admin: { description: 'What this student needs to provide. Update each item as the file arrives and is checked.' },
      fields: [
        { name: 'label', type: 'text', required: true, admin: { description: 'What is needed, for example "Passport".' } },
        { name: 'status', type: 'select', defaultValue: 'required', options: ['required', 'received', 'approved', 'needs-update'], admin: { description: 'Progress of this checklist item. Set it yourself; it does not change when the file\'s own Review status changes.' } },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'documents',
          admin: { description: 'Create new: upload the file now (in the form that opens, select this application again). Choose from existing: attach a file already uploaded in Documents for this student. Files are private: only admins and the assigned staff member can open them.' },
        },
      ],
    },
    {
      name: 'statusHistory',
      type: 'array',
      // Written only by the beforeChange hook above; blocks hand-made entries through the API
      access: { create: () => false, update: () => false },
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
