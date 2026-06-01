#!/usr/bin/env node
// One-shot uploader: pushes /public/assets/top-picks/*.jpg to the R2 bucket
// under the key `top-picks/{basename}`. Reads R2 creds from .env.local at the
// repo root. Run from the project root:
//   node scripts/upload-top-picks-images.mjs
//
// Why a script (not a hot path): hand-curated affiliate content refreshes a
// few times a year. Adding a build-time uploader would couple deploys to
// asset sync; keeping this manual lets editors iterate the JSON freely.

import { readFile, readdir } from "node:fs/promises";
import { createReadStream, statSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const LOCAL_DIR = join(REPO_ROOT, "public", "assets", "top-picks");
const R2_PREFIX = "top-picks";

async function loadDotenvLocal() {
  // Minimal .env.local parser — handles KEY=value lines, ignores comments and
  // blank lines. Strips surrounding double quotes if present.
  const path = join(REPO_ROOT, ".env.local");
  const text = await readFile(path, "utf8");
  const env = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function main() {
  const env = await loadDotenvLocal();
  const accountId = env.R2_ACCOUNT_ID;
  const bucket = env.R2_BUCKET_NAME;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
    console.error(
      "Missing one of R2_ACCOUNT_ID / R2_BUCKET_NAME / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY in .env.local",
    );
    process.exit(1);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  let files;
  try {
    files = (await readdir(LOCAL_DIR)).filter((f) => f.endsWith(".jpg"));
  } catch (err) {
    console.error(`Cannot read ${LOCAL_DIR}:`, err.message);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`No .jpg files found in ${LOCAL_DIR}`);
    process.exit(1);
  }

  console.log(`Uploading ${files.length} file(s) to r2://${bucket}/${R2_PREFIX}/`);

  let failed = 0;
  for (const file of files) {
    const localPath = join(LOCAL_DIR, file);
    const key = `${R2_PREFIX}/${basename(file)}`;
    const size = statSync(localPath).size;
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: createReadStream(localPath),
          ContentType: "image/jpeg",
          ContentLength: size,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
      await client.send(
        new HeadObjectCommand({ Bucket: bucket, Key: key }),
      );
      console.log(`  ✓ ${key}  (${size} bytes)`);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${key}  ${err.name}: ${err.message}`);
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} upload(s) failed.`);
    process.exit(1);
  }
  console.log(`\nDone. Verify at: https://images.scoutpaw.tv/${R2_PREFIX}/{filename}`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
