import { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn, publishedFlagOrStaff } from "../access";
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from "../hooks/revalidate";
import { urlOrPath } from "../hooks/validators";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  defaultSort: "sortOrder",
  access: {
    read: publishedFlagOrStaff,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: "studentName",
    defaultColumns: [
      "studentName",
      "university",
      "country",
      "published",
      "sortOrder",
    ],
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: "studentName", type: "text", required: true },
    { name: "university", type: "relationship", relationTo: "universities" },
    {
      name: "country",
      type: "relationship",
      relationTo: "countries",
      admin: {
        description: "Optional. Show this review on that country page.",
      },
    },
    { name: "quote", type: "textarea", required: true, maxLength: 400 },
    { name: "rating", type: "number", min: 1, max: 5, defaultValue: 5 },
    { name: "photoUrl", type: "text", validate: urlOrPath },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Lower numbers appear first.",
      },
    },
    {
      name: "published",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
  ],
};
