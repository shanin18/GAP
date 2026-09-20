import { APIError } from 'payload';
import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 8, // sessions last 8 hours
    maxLoginAttempts: 5, // lock the account after 5 wrong passwords...
    lockTime: 10 * 60 * 1000, // ...for 10 minutes
    cookies: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' },
  },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'role', 'updatedAt'] },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: ({ req }) => (!req.user ? false : req.user.role === 'admin' ? true : { id: { equals: req.user.id } }),
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req, id }) => req.user?.role === 'admin' || req.user?.id === id,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        // The very first user becomes the admin
        if (operation === 'create' && !req.user) {
          const { totalDocs } = await req.payload.count({ collection: 'users', req, overrideAccess: true });
          if (totalDocs === 0) data.role = 'admin';
        }
        // Never demote the last remaining admin
        if (operation === 'update' && originalDoc?.role === 'admin' && data.role && data.role !== 'admin') {
          const { totalDocs } = await req.payload.count({
            collection: 'users',
            where: { role: { equals: 'admin' } },
            req,
            overrideAccess: true,
          });
          if (totalDocs <= 1) throw new APIError('There must be at least one admin.', 400);
        }
        return data;
      },
    ],
    beforeDelete: [
      ({ req, id }) => {
        if (req.user?.id === id) throw new APIError('You cannot delete your own account.', 400);
      },
    ],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: { update: ({ req }) => req.user?.role === 'admin' },
      admin: { position: 'sidebar' },
    },
  ],
};