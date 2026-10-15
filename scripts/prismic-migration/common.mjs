/** Shared helpers for the Prismic repository migration. Never logs tokens. */
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = dirname(fileURLToPath(import.meta.url));
export const BACKUP_DIR = join(ROOT, "backup");
export const STATE_DIR = join(ROOT, "state");

export const SOURCE_REPO = process.env.SOURCE_REPO ?? "cost-segregation";
export const DEST_REPO = process.env.DEST_REPO ?? "costsegregationcom";

export const args = process.argv.slice(2);
export const DRY_RUN = args.includes("--dry-run");
export const argValue = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");

/** Read a required secret from the environment; exits with a clear message if missing. */
export function requireEnv(name, why) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    console.error(`Missing ${name} (${why}). Set it with:  $env:${name} = "..."`);
    process.exit(1);
  }
  return value.trim();
}

export function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

export function readJsonDir(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => readJson(join(dir, file)));
}

/** Every image / media URL referenced anywhere in a document's data. */
export function collectAssetUrls(value, found = new Set()) {
  if (Array.isArray(value)) value.forEach((v) => collectAssetUrls(v, found));
  else if (value && typeof value === "object") {
    if (typeof value.url === "string" && (value.dimensions || value.kind || value.link_type === "Media")) {
      found.add(value.url.split("?")[0]);
    }
    Object.values(value).forEach((v) => collectAssetUrls(v, found));
  }
  return found;
}

export const docKey = (doc) => `${doc.type}:${doc.uid ?? "(singleton)"}:${doc.lang}`;
