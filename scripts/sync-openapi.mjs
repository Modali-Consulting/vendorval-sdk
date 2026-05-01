#!/usr/bin/env node
/**
 * Pull the latest OpenAPI spec from the vendorval-api GitHub release and
 * write it to specs/openapi.json. Used by the spec-drift workflow and
 * runnable locally.
 *
 *   node scripts/sync-openapi.mjs
 *   node scripts/sync-openapi.mjs --tag v1.2.3
 *
 * Honors GITHUB_TOKEN if present (avoids unauthenticated rate limits).
 */
import { writeFile, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "..", "specs", "openapi.json");
const REPO = "Modali-Consulting/vendorval-api";
const ASSET_NAME = "openapi.json";

const argv = process.argv.slice(2);
const tagIdx = argv.indexOf("--tag");
const tag = tagIdx >= 0 ? argv[tagIdx + 1] : null;

const headers = { Accept: "application/vnd.github+json", "User-Agent": "vendorval-sdk-sync" };
if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

async function ghJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`${url} → ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function main() {
  const url = tag
    ? `https://api.github.com/repos/${REPO}/releases/tags/${tag}`
    : `https://api.github.com/repos/${REPO}/releases/latest`;
  const release = await ghJson(url);
  const asset = (release.assets ?? []).find((a) => a.name === ASSET_NAME);
  if (!asset) {
    throw new Error(`Release ${release.tag_name} has no ${ASSET_NAME} asset.`);
  }

  const dl = await fetch(asset.browser_download_url, {
    headers: { Accept: "application/octet-stream", "User-Agent": "vendorval-sdk-sync" },
  });
  if (!dl.ok) {
    throw new Error(`Download failed: ${dl.status} ${dl.statusText}`);
  }
  const fresh = await dl.text();
  // Re-stringify to normalize formatting so diffs are stable.
  const normalized = `${JSON.stringify(JSON.parse(fresh), null, 2)}\n`;

  let prev = "";
  try {
    prev = await readFile(OUT, "utf8");
  } catch {}

  if (prev === normalized) {
    console.log(`No changes (release ${release.tag_name}).`);
    return;
  }

  await writeFile(OUT, normalized);
  console.log(`Updated specs/openapi.json from release ${release.tag_name}.`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
