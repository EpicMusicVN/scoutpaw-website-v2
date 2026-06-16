import { getPayload } from "payload";
import config from "../payload.config";

/**
 * Idempotent first-admin seed. Run with: `pnpm seed:admin`
 * (which uses `payload run`, loading .env + the config). Reads
 * SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD. Safe to re-run — skips if present.
 */
const run = async () => {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set.");
  }

  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    payload.logger.info(`Admin ${email} already exists — skipping.`);
    return;
  }

  await payload.create({
    collection: "users",
    data: { name: "Admin", email, password, role: "admin" },
  });
  payload.logger.info(`Created admin user ${email}.`);
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
