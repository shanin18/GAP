import { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn, publicRead } from "../access";
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from "../hooks/revalidate";
import { slugFrom } from "../hooks/slug";
import { urlOrPath } from "../hooks/validators";

export const Countries: CollectionConfig = {
  slug: "countries",
  defaultSort: "name",
  access: {
    read: publicRead,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  admin: { useAsTitle: "name", defaultColumns: ["name", "slug", "updatedAt"] },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [slugFrom("name")] },
      admin: {
        position: "sidebar",
        description: "Filled in from the name. It becomes the page address.",
      },
    },
    { name: "heroImageUrl", type: "text", validate: urlOrPath },
    { name: "introduction", type: "textarea" },
    {
      name: "highlights",
      type: "array",
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "gallery",
      type: "array",
      fields: [
        { name: "imageUrl", type: "text", required: true, validate: urlOrPath },
        { name: "caption", type: "text", required: true },
      ],
    },
    {
      name: "steps",
      label: "Journey steps",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "text", type: "textarea", required: true },
      ],
    },
    {
      name: "relatedNews",
      type: "relationship",
      relationTo: "news",
      hasMany: true,
      admin: {
        description: "Published articles to show on this country page.",
      },
    },
    { name: "seoTitle", type: "text" },
    { name: "seoDescription", type: "textarea", maxLength: 170 },
    { name: "body", type: "richText" },
    {
      name: "relatedUniversities",
      type: "relationship",
      relationTo: "universities",
      hasMany: true,
    },
    {
      // Automatic list, based on each university's "country" field. No extra data to maintain.
      name: "universityList",
      type: "join",
      collection: "universities",
      on: "country",
      admin: {
        description:
          "Every university that lists this country. Updates automatically.",
      },
    },
  ],
};
