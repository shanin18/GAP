import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: ({ req }) => !req.user ? false : req.user.role === 'admin' ? true : { id: { equals: req.user.id } },
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req, id }) => req.user?.role === 'admin' || req.user?.id === id,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [async ({ data, operation, req }) => {
      if (operation === 'create' && !req.user) {
        const { totalDocs } = await req.payload.count({ collection: 'users', req, overrideAccess: true });
        if (totalDocs === 0) data.role = 'admin';
      }
      return data;
    }],
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
    },
  ],
};
