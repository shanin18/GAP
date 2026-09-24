import { APIError, type CollectionConfig } from "payload";
import { isLoggedIn, publicRead } from "../access";
import { revalidateAfterChange } from "../hooks/revalidate";
import catalog from "../../lib/website-content-defaults.json";
import { urlOrPath } from "../hooks/validators";

export const WebsiteContent: CollectionConfig = {
  slug: "website-content",
  labels: { singular: "Website section", plural: "Website Content" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "enabled", "sortOrder", "updatedAt"],
    description:
      "Edit page text, buttons and images here. Countries, universities, services, articles and testimonials have their own collections. Empty text clears a phrase; reset it by copying the original shown below it.",
  },
  defaultSort: "sortOrder",
  access: {
    read: publicRead,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: () => false,
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data;
        const key = originalDoc?.key ?? data.key;
        const section = catalog.find((item) => item.key === key);
        if (!section)
          throw new APIError("Choose a valid website section.", 400);
        const previous = new Map(
          (data.entries ?? originalDoc?.entries ?? []).map(
            (entry: { key: string; value?: string | null }) => [
              entry.key,
              entry,
            ],
          ),
        );
        return {
          ...data,
          key,
          title: section.title,
          entries: section.entries.map((entry) => ({
            ...entry,
            ...(previous.get(entry.key) as object | undefined),
            key: entry.key,
            label: entry.label,
            original: entry.value,
            kind: entry.kind,
          })),
        };
      },
    ],
    beforeChange: [
      ({ data }) => {
        for (const entry of data.entries ?? []) {
          if (
            entry.kind === "image" &&
            entry.original &&
            !entry.value &&
            !entry.image
          ) {
            throw new APIError(
              `Choose an image or enter an image URL for ${entry.label}.`,
              400,
            );
          }
          if (
            (entry.kind === "image" || entry.kind === "link") &&
            entry.value &&
            urlOrPath(entry.value) !== true
          ) {
            throw new APIError(
              `Use a website path or HTTPS URL for ${entry.label}.`,
              400,
            );
          }
        }
        return data;
      },
    ],
    afterChange: [revalidateAfterChange],
  },
  fields: [
    { name: "title", type: "text", admin: { readOnly: true } },
    {
      name: "key",
      label: "Section",
      type: "select",
      required: true,
      unique: true,
      options: catalog.map(({ key, title }) => ({ value: key, label: title })),
      admin: {
        position: "sidebar",
        description:
          "One record per section. Save a new record to load its editable content.",
      },
    },
    {
      name: "enabled",
      label: "Show section on homepage",
      type: "checkbox",
      defaultValue: true,
      admin: {
        position: "sidebar",
        condition: (data) => data.key?.startsWith("home-"),
        description: "Hide this homepage section without deleting its content.",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Homepage sections with lower numbers appear first.",
      },
    },
    {
      name: "entries",
      label: "Content",
      type: "array",
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "/components/admin/ContentRowLabel#ContentRowLabel",
        },
      },
      fields: [
        { name: "key", type: "text", required: true, admin: { hidden: true } },
        {
          name: "kind",
          type: "select",
          options: ["text", "image", "link"],
          admin: { hidden: true },
        },
        { name: "label", type: "text", admin: { readOnly: true } },
        { name: "value", label: "Website content", type: "textarea" },
        {
          name: "image",
          label: "Or choose an uploaded image",
          type: "upload",
          relationTo: "media",
          admin: { condition: (_, sibling) => sibling.kind === "image" },
        },
        {
          name: "original",
          label: "Original content (reference)",
          type: "textarea",
          admin: { readOnly: true },
        },
      ],
    },
  ],
};
