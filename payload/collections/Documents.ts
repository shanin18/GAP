import { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn } from "../access";


export const Documents: CollectionConfig = {
  slug: 'documents',
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'application', 'documentType', 'reviewStatus', 'uploadedBy', 'updatedAt'],
    listSearchableFields: ['filename'],
  },
  access: {
    create: isLoggedIn,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  hooks: {
    // "Uploaded by" is filled in automatically from the logged-in user
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && data && !data.uploadedBy && req.user) data.uploadedBy = req.user.id;
        return data;
      },
    ],
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
    {
      name: 'documentType',
      type: 'select',
      required: true,
      options: [
        { label: 'Passport / identity', value: 'identity' },
        { label: 'Academic transcript / certificate', value: 'academic' },
        { label: 'English language evidence', value: 'english' },
        { label: 'Financial evidence', value: 'financial' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'uploadedBy', type: 'relationship', relationTo: 'users', required: true, index: true, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'reviewStatus', type: 'select', defaultValue: 'received', admin: { position: 'sidebar' }, options: ['received', 'approved', 'needs-update'] },
    { name: 'reviewNote', type: 'textarea' },
  ],
};
