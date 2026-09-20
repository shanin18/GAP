import type { CollectionConfig } from 'payload';
import { isAdmin, isLoggedIn, publishedOrStaff } from '../access';
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate';
import { slugFrom } from '../hooks/slug';
import { optionalUrl, urlOrPath } from '../hooks/validators';

export const Universities: CollectionConfig = {
  slug: 'universities',
  defaultSort: 'name',
  access: {
    read: publishedOrStaff,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'city', 'featured', 'status'],
    listSearchableFields: ['name', 'city', 'slug'],
  },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [slugFrom('name')] },
      admin: { position: 'sidebar', description: 'Filled in from the name. It becomes the page address.' },
    },
    { name: 'country', type: 'relationship', relationTo: 'countries', required: true, index: true },
    { name: 'city', type: 'text' },
    { name: 'logoUrl', type: 'text', validate: urlOrPath },
    { name: 'websiteUrl', type: 'text', validate: optionalUrl },
    { name: 'description', type: 'textarea', required: true },
    { name: 'highlights', type: 'array', fields: [{ name: 'text', type: 'text', required: true }] },
    { name: 'featured', type: 'checkbox', defaultValue: false, index: true, admin: { position: 'sidebar' } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'published',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    { name: 'seoTitle', type: 'text' },
    { name: 'seoDescription', type: 'textarea', maxLength: 170 },
  ],
};
