import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn, publicRead } from "./Access";
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from "../hooks/Revalidate";
import { slugFrom } from "../hooks/Slug";
import { urlOrPath } from "../hooks/Validators";

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
