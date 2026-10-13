/**
 * Step 3 — copy the backed-up published documents (and the media they use)
 * into the destination with the official Migration API. Documents land as
 * drafts in the destination's "Migration release" — nothing is published.
 *
 * Safe to re-run: skips documents already published in the destination or
 * recorded in ./state/content-migrated.json by an earlier run.
 *
 *   $env:DEST_WRITE_TOKEN = "..."   # destination → Settings → API & Security → Write APIs
 *   node scripts/prismic-migration/03-migrate-content.mjs --dry-run
 *   node scripts/prismic-migration/03-migrate-content.mjs --only=site_settings,blog_post:cost-segregation-office-building
 *   node scripts/prismic-migration/03-migrate-content.mjs
 */
import { join } from "node:path";
import * as prismic from "@prismicio/client";

import {
  BACKUP_DIR, DEST_REPO, DRY_RUN, STATE_DIR, argValue, collectAssetUrls, docKey,
  readJson, readJsonDir, requireEnv, writeJson,
} from "./common.mjs";

const STATE_FILE = join(STATE_DIR, "content-migrated.json");
const documents = readJsonDir(join(BACKUP_DIR, "documents"));
if (!documents.length) {
  console.error("No backed-up documents. Run 01-backup.mjs first.");
  process.exit(1);
}

// --only=type or type:uid (comma-separated)
const only = argValue("only")?.split(",").map((s) => s.trim()).filter(Boolean);
const selected = documents.filter(
  (doc) => !only || only.some((f) => f === doc.type || f === `${doc.type}:${doc.uid}`),
);

// What already exists in the destination (published) + what earlier runs created.
const destRead = prismic.createClient(DEST_REPO, {
  accessToken: process.env.DEST_ACCESS_TOKEN || undefined,
});
const destPublished = await destRead.dangerouslyGetAll({ lang: "*" }).catch(() => []);
const existing = new Set(destPublished.map(docKey));
const singletonTypes = new Set(destPublished.filter((d) => !d.uid).map((d) => `${d.type}:${d.lang}`));
const state = readJson(STATE_FILE, { migrated: [] });
const done = new Set(state.migrated);

const writeToken = DRY_RUN ? "dry-run" : requireEnv("DEST_WRITE_TOKEN", "write documents and media");
const writeClient = prismic.createWriteClient(DEST_REPO, { writeToken });
const migration = prismic.createMigration();

const queued = [];
const assets = new Set();
for (const doc of selected) {
  const key = docKey(doc);
  const singletonTaken = !doc.uid && singletonTypes.has(`${doc.type}:${doc.lang}`);
  if (existing.has(key) || singletonTaken || done.has(key)) {
    console.log(`skip   ${key}  (already in ${DEST_REPO})`);
    continue;
  }
  collectAssetUrls(doc.data, assets);
  const title = doc.uid ?? doc.type;
  migration.createDocumentFromPrismic(doc, title);
  queued.push(key);
  console.log(`queue  ${key}`);
}

console.log(`\n${queued.length} documents, ${assets.size} media files referenced.`);
if (DRY_RUN) {
  writeJson(join(STATE_DIR, "dry-run-report.json"), {
    destination: DEST_REPO, documents: queued, media: [...assets].sort(), createdAt: new Date().toISOString(),
  });
  console.log("Dry run only — nothing written. Report: state/dry-run-report.json");
  process.exit(0);
}
if (!queued.length) process.exit(0);

// Record each document as soon as the next one starts (= previous finished),
// so an interrupted run never re-creates finished documents.
const record = (key) => {
  if (!done.has(key)) {
    done.add(key);
    writeJson(STATE_FILE, { migrated: [...done] });
  }
};
let lastStarted = null;
await writeClient.migrate(migration, {
  reporter: (event) => {
    if (event.type === "assets:creating") console.log(`media ${event.data.current}/${event.data.total}`);
    if (event.type === "documents:creating") {
      if (lastStarted) record(lastStarted);
      const doc = event.data.document.document;
      lastStarted = docKey(doc);
      console.log(`document ${event.data.current}/${event.data.total}  ${lastStarted}`);
    }
    if (event.type === "end") {
      if (lastStarted) record(lastStarted);
      console.log(`\nDone: ${event.data.migrated.documents} documents, ${event.data.migrated.assets} media files.`);
    }
  },
});
console.log(`Review in ${DEST_REPO} → Releases → Migration release. Nothing has been published.`);
