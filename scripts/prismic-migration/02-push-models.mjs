/**
 * Step 2 — create the backed-up custom types and shared slices in the
 * destination. Never overwrites: anything that already exists is skipped and
 * reported (with a note when it differs from the backup).
 *
 *   $env:DEST_CUSTOM_TYPES_TOKEN = "..."   # destination → Settings → API & Security → Custom Types API
 *   node scripts/prismic-migration/02-push-models.mjs --dry-run
 *   node scripts/prismic-migration/02-push-models.mjs
 */
import { join } from "node:path";
import { createClient as createCustomTypesClient } from "@prismicio/custom-types-client";

import { BACKUP_DIR, DEST_REPO, DRY_RUN, readJsonDir, requireEnv } from "./common.mjs";

const token = requireEnv("DEST_CUSTOM_TYPES_TOKEN", "create models in the destination");
const models = createCustomTypesClient({ repositoryName: DEST_REPO, token });

const backupSlices = readJsonDir(join(BACKUP_DIR, "models", "slices"));
const backupTypes = readJsonDir(join(BACKUP_DIR, "models", "customtypes"));
if (!backupSlices.length && !backupTypes.length) {
  console.error("No backup found. Run 01-backup.mjs first.");
  process.exit(1);
}

const existingSlices = new Map((await models.getAllSharedSlices()).map((s) => [s.id, s]));
const existingTypes = new Map((await models.getAllCustomTypes()).map((t) => [t.id, t]));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

console.log(`${DRY_RUN ? "[DRY RUN] " : ""}Destination: ${DEST_REPO}`);
let created = 0;

// Slices first: custom types reference them.
for (const slice of backupSlices) {
  const existing = existingSlices.get(slice.id);
  if (existing) {
    console.log(`skip   slice ${slice.id}${same(existing, slice) ? "" : "  (exists but DIFFERS — not overwritten)"}`);
    continue;
  }
  console.log(`create slice ${slice.id}`);
  if (!DRY_RUN) await models.insertSharedSlice(slice);
  created += 1;
}

for (const ct of backupTypes) {
  const existing = existingTypes.get(ct.id);
  if (existing) {
    console.log(`skip   type  ${ct.id}${same(existing.json, ct.json) ? "" : "  (exists but DIFFERS — not overwritten)"}`);
    continue;
  }
  console.log(`create type  ${ct.id}`);
  if (!DRY_RUN) await models.insertCustomType(ct);
  created += 1;
}

console.log(DRY_RUN ? `\nDry run: ${created} models would be created.` : `\nCreated ${created} models.`);
