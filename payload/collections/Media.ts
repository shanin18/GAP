import type { CollectionConfig } from "payload";
import { isAdmin, isLoggedIn, publicRead } from "../access";
import {
  revalidateAfterChange,
  revalidateAfterDelete,
} from "../hooks/revalidate";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "alt",
    description:
      "Upload public website images. Copy a file URL into image URL fields in other collections, or select it in Website Content.",
  },
  access: {
    read: publicRead,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  upload: {
    staticDir: "public/uploads",
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ],
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: "alt", label: "Image description", type: "text", required: true },
  ],
};
