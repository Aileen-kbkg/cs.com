/**
 * Step 1 — READ-ONLY backup of the source repository.
 * Saves every custom type, shared slice and published document to ./backup
 * and writes ./backup/report.json with counts. Never writes to Prismic.
 *
 *   $env:SOURCE_CUSTOM_TYPES_TOKEN = "..."     # source → Settings → API & Security → Custom Types API
 *   $env:SOURCE_ACCESS_TOKEN = "..."           # only if the source Content API is private
 *   node scripts/prismic-migration/01-backup.mjs
 */
import { join } from "node:path";
import * as prismic from "@prismicio/client";
import { createClient as createCustomTypesClient } from "@prismicio/custom-types-client";

import { BACKUP_DIR, SOURCE_REPO, collectAssetUrls, requireEnv, writeJson } from "./common.mjs";

const token = requireEnv("SOURCE_CUSTOM_TYPES_TOKEN", "read source models");
const models = createCustomTypesClient({ repositoryName: SOURCE_REPO, token });
const content = prismic.createClient(SOURCE_REPO, {
  accessToken: process.env.SOURCE_ACCESS_TOKEN || undefined,
});

console.log(`Backing up ${SOURCE_REPO} (read-only)…`);

const customTypes = await models.getAllCustomTypes();
for (const ct of customTypes) writeJson(join(BACKUP_DIR, "models", "customtypes", `${ct.id}.json`), ct);

const slices = await models.getAllSharedSlices();
for (const slice of slices) writeJson(join(BACKUP_DIR, "models", "slices", `${slice.id}.json`), slice);

const documents = await content.dangerouslyGetAll({ lang: "*" });
const counts = {};
const assets = new Set();
for (const doc of documents) {
  counts[doc.type] = (counts[doc.type] ?? 0) + 1;
  collectAssetUrls(doc.data, assets);
  writeJson(join(BACKUP_DIR, "documents", `${doc.type}__${doc.uid ?? doc.id}__${doc.lang}.json`), doc);
}

const report = {
  source: SOURCE_REPO,
  createdAt: new Date().toISOString(),
  customTypes: customTypes.map((ct) => ct.id).sort(),
  sharedSlices: slices.map((s) => s.id).sort(),
  publishedDocuments: documents.length,
  documentsByType: counts,
  locales: [...new Set(documents.map((d) => d.lang))],
  referencedAssets: [...assets].sort(),
  notIncluded: [
    "Draft and release content (the Content API returns published documents only)",
    "Media not referenced by any published document",
  ],
};
writeJson(join(BACKUP_DIR, "report.json"), report);

console.log(`Custom types: ${report.customTypes.length}  (${report.customTypes.join(", ")})`);
console.log(`Shared slices: ${report.sharedSlices.length}`);
console.log(`Published documents: ${report.publishedDocuments}  ${JSON.stringify(counts)}`);
console.log(`Referenced media files: ${report.referencedAssets.length}`);
console.log(`Saved to ${BACKUP_DIR}`);
