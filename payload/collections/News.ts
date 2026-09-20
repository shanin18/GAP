import { Access, CollectionConfig, Where } from "payload";
import { isAdmin, isLoggedIn } from "../access";
import { revalidateAfterChange, revalidateAfterDelete } from "../hooks/revalidate";
import { slugFrom } from "../hooks/slug";
import { urlOrPath } from "../hooks/validators";


// Visitors only see published posts whose date has arrived (so posts can be scheduled)
const readNews: Access = ({ req }) => {
  if (req.user) return true;

  const publicPosts: Where = {
    and: [
      { status: { equals: 'published' } },
      { publishedDate: { less_than_equal: new Date().toISOString() } },
    ],
  };
  return publicPosts;
};

export const News: CollectionConfig = {
  slug: 'news',
  defaultSort: '-publishedDate',
  access: {
    read: readNews,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'publishedDate'], listSearchableFields: ['title', 'slug'] },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [slugFrom('title')] },
      admin: { position: 'sidebar', description: 'Filled in from the title. It becomes the page address.' },
    },
    { name: 'coverImageUrl', type: 'text', validate: urlOrPath },
    { name: 'shortBlurb', type: 'textarea', required: true },
    { name: 'content', type: 'richText' },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', description: 'A future date schedules the post.' },
    },
    { name: 'status', type: 'select', defaultValue: 'draft', required: true, options: ['draft', 'published'], index: true, admin: { position: 'sidebar' } },
    { name: 'seoTitle', type: 'text' },
    { name: 'seoDescription', type: 'textarea', maxLength: 170 },
  ],
};
