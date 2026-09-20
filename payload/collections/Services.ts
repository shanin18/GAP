import type { CollectionConfig } from 'payload';
import { isAdmin, isLoggedIn, publicRead } from '../access';
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate';

export const Services: CollectionConfig = {
  slug: 'services',
  defaultSort: 'sortOrder',
  access: {
    read: publicRead,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'icon', 'sortOrder', 'updatedAt'] },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      // The website only knows these four icons, so a dropdown prevents typos
      name: 'icon',
      type: 'select',
      options: [
        { label: 'Chat bubble (counselling)', value: 'MessageCircle' },
        { label: 'Magnifier (selection)', value: 'Search' },
        { label: 'Document tick (admission)', value: 'FileCheck2' },
        { label: 'Plane (departure)', value: 'Plane' },
      ],
    },
    { name: 'shortDescription', type: 'textarea', required: true },
    { name: 'sortOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar', description: 'Lower numbers appear first.' } },
  ],
};
