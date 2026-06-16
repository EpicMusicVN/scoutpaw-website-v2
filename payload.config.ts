import path from "path";
import { fileURLToPath } from "url";

import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

import { users } from "./lib/payload/collections/users";
import { media } from "./lib/payload/collections/media";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Env is read with `?? ""` (not `!`) so the config can be evaluated for
// typecheck / importmap generation without live secrets. Adapters connect
// lazily at first use, so an empty connection string is harmless until then.
export default buildConfig({
  admin: { user: users.slug },
  collections: [users, media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI ?? "" },
  }),
  // `sharp` (image resizing) intentionally omitted in Phase 1 — the media
  // collection defines no imageSizes, so plain R2 uploads need no transforms.
  // Re-introduce a version-aligned sharp when image sizes are added.
  plugins: [
    s3Storage({
      collections: { media: true },
      bucket: process.env.R2_BUCKET ?? "",
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
        },
        endpoint: process.env.R2_ENDPOINT ?? "",
        region: "auto",
        forcePathStyle: true,
      },
    }),
  ],
});
