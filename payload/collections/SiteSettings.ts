import { CollectionConfig } from "payload";
import { isAdminField, isLoggedIn, publicRead } from "../access";
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from "../hooks/revalidate";
import { optionalUrl, urlOrPath } from "../hooks/validators";

export const SiteSettings: CollectionConfig = {
  slug: "site-settings",
  access: {
    read: publicRead,
    // Only one settings record should ever exist
    create: async ({ req }) => {
      if (!req.user) return false;
      const { totalDocs } = await req.payload.count({
        collection: "site-settings",
        req,
        overrideAccess: true,
      });
      return totalDocs === 0;
    },
    update: isLoggedIn,
    delete: () => false,
  },
  admin: { useAsTitle: "siteName" },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: "siteName",
      type: "text",
      required: true,
      defaultValue: "Global Admission Platform",
    },
    { name: "seoTitle", type: "text" },
    { name: "seoDescription", type: "textarea", maxLength: 170 },
    { name: "faviconUrl", type: "text", validate: urlOrPath },
    { name: "address", type: "textarea" },
    { name: "phone", type: "text" },
    { name: "email", type: "email" },
    { name: "facebookUrl", type: "text", validate: optionalUrl },
    { name: "instagramUrl", type: "text", validate: optionalUrl },
    { name: "linkedinUrl", type: "text", validate: optionalUrl },
    {
      name: "socialLinks",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          options: ["facebook", "instagram", "linkedin", "youtube"],
        },
        { name: "url", type: "text", required: true, validate: optionalUrl },
      ],
    },
    {
      name: "maintenanceMode",
      type: "checkbox",
      defaultValue: false,
      access: { update: isAdminField },
    },
    {
      name: "maintenanceMessage",
      type: "textarea",
      defaultValue: "We are updating our website. Please check back soon.",
    },
  ],
};
