import type { CollectionConfig } from "payload";
import { isEditorOrAdmin } from "../access/roles";

/**
 * Upload collection. Files are stored in Cloudflare R2 via the S3 storage
 * adapter (see `payload.config.ts`). Public read so the live site can serve
 * media URLs; writes restricted to editors/admins.
 */
export const media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: isEditorOrAdmin,
    update: isEditorOrAdmin,
    delete: isEditorOrAdmin,
  },
  upload: true,
  fields: [
    { name: "alt", type: "text", admin: { description: "Accessible alt text" } },
  ],
};
