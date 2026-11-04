/**
 * Create the `services` custom type in the destination repository from
 * customtypes/services/index.json. Insert-only: if a `services` type already
 * exists it is left untouched, and no other type or slice is ever changed.
 *
 *   $env:DEST_CUSTOM_TYPES_TOKEN = "..."   # costsegregationcom → Settings → API & Security → Custom Types API
 *   node scripts/prismic-migration/04-push-services-type.mjs --dry-run
 *   node scripts/prismic-migration/04-push-services-type.mjs
 */
import { join } from "node:path";
import { createClient as createCustomTypesClient } from "@prismicio/custom-types-client";

import { DEST_REPO, DRY_RUN, ROOT, readJson, requireEnv } from "./common.mjs";

const TYPE_ID = "services";
const modelPath = join(ROOT, "..", "..", "customtypes", TYPE_ID, "index.json");
const model = readJson(modelPath);
if (!model || model.id !== TYPE_ID) {
  console.error(`Could not read the ${TYPE_ID} model at ${modelPath}.`);
  process.exit(1);
}

const token = requireEnv("DEST_CUSTOM_TYPES_TOKEN", "create the services type in the destination");
const models = createCustomTypesClient({ repositoryName: DEST_REPO, token });

console.log(`${DRY_RUN ? "[DRY RUN] " : ""}Destination: ${DEST_REPO}`);

const existingTypes = new Map((await models.getAllCustomTypes()).map((t) => [t.id, t]));
if (existingTypes.has(TYPE_ID)) {
  console.log(`skip   type  ${TYPE_ID}  (already exists — not overwritten)`);
  process.exit(0);
}

// Every slice the model offers must already exist remotely; this script never creates slices.
const sliceIds = Object.keys(model.json.Main.slices.config.choices);
const remoteSlices = new Set((await models.getAllSharedSlices()).map((s) => s.id));
const missing = sliceIds.filter((id) => !remoteSlices.has(id));
if (missing.length) {
  console.error(`Stopping: these slices are not in ${DEST_REPO}: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`create type  ${TYPE_ID}  (slices: ${sliceIds.join(", ")})`);
if (!DRY_RUN) await models.insertCustomType(model);
console.log(DRY_RUN ? "\nDry run: nothing was created." : `\nCreated the ${TYPE_ID} type.`);
