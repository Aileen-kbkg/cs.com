/**
 * One-time import of the 22 live costsegregation.com blog posts into Prismic
 * (custom type: blog_post) using the official Prismic Migration API.
 *
 * - Uploads each featured image (and the two inline article images) from the
 *   live site into the Prismic media library.
 * - Creates every post as a draft in Prismic's "Migration release" so you can
 *   review before publishing. Nothing goes live until you publish it.
 *
 * Usage (from the project root, PowerShell):
 *   $env:PRISMIC_WRITE_TOKEN = "<Migration API token>"
 *   node scripts/blog-migration/migrate-blog.mjs --dry-run   # check only, no writes
 *   node scripts/blog-migration/migrate-blog.mjs             # run the import
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as prismic from "@prismicio/client";

// Imports straight into the NEW repository (override with $env:DEST_REPO).
const REPOSITORY = process.env.DEST_REPO ?? "costsegregationcom";
// These 5 already exist in the old repository and are copied by
// prismic-migration/03-migrate-content.mjs, so they are not imported here.
const SKIP_UIDS = new Set([
  "str-cost-segregation-timing",
  "cost-segregation-office-building",
  "cost-segregation-for-a-rental",
  "cost-segregation-for-prior-year",
  "cost-segregation-vs-bonus-depreciation",
]);

const dryRun = process.argv.includes("--dry-run");
const here = dirname(fileURLToPath(import.meta.url));
const posts = JSON.parse(readFileSync(join(here, "blog-posts.json"), "utf8"));

const writeToken = (process.env.DEST_WRITE_TOKEN ?? process.env.PRISMIC_WRITE_TOKEN ?? "").trim();
if (!dryRun && !writeToken) {
  console.error(`Set DEST_WRITE_TOKEN first (${REPOSITORY} → Settings → API & Security → Write APIs).`);
  process.exit(1);
}

// Re-run safety: posts recorded by an earlier run are skipped even before they are published.
const STATE_FILE = join(here, "state", "imported.json");
const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : { imported: [] };
const imported = new Set(state.imported);
const record = (uid) => {
  if (imported.has(uid)) return;
  imported.add(uid);
  mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify({ imported: [...imported] }, null, 2));
};

const writeClient = prismic.createWriteClient(REPOSITORY, { writeToken: writeToken ?? "dry-run" });
const readClient = prismic.createClient(REPOSITORY);
const migration = prismic.createMigration();

const filenameFromUrl = (url) => decodeURIComponent(new URL(url).pathname.split("/").pop());

/** Rich text from the converter; inline images become migration assets. */
const toRichText = (blocks) =>
  blocks.map((block) =>
    block.type === "image"
      ? { type: "image", id: migration.createAsset(block.src, filenameFromUrl(block.src), { alt: block.alt || undefined }) }
      : { type: block.type, text: block.text, spans: block.spans, direction: "ltr" },
  );

// Skip posts that are already published in Prismic (safe to re-run).
const existing = new Set(
  (await readClient.getAllByType("blog_post").catch(() => [])).map((doc) => doc.uid),
);

let queued = 0;
for (const post of posts) {
  if (SKIP_UIDS.has(post.uid) || existing.has(post.uid) || imported.has(post.uid)) {
    console.log(`skip  ${post.uid}`);
    continue;
  }
  migration.createDocument(
    {
      type: "blog_post",
      uid: post.uid,
      lang: "en-us",
      tags: post.legacy_path ? ["legacy-blog-url"] : [],
      data: {
        title: [{ type: "heading1", text: post.title, spans: [], direction: "ltr" }],
        date: post.date,
        excerpt: post.excerpt,
        featured_image: migration.createAsset(
          post.featured_image.url,
          filenameFromUrl(post.featured_image.url),
          { alt: post.featured_image.alt || undefined },
        ),
        body: toRichText(post.body),
        faq_title: post.faq_title ?? null,
        faqs: post.faqs.map((faq) => ({ question: faq.question, answer: toRichText(faq.answer) })),
        after_faq: toRichText(post.after_faq),
      },
    },
    post.title,
  );
  queued += 1;
  console.log(`queue ${post.uid}  (${post.date}, ${post.body.length} blocks, ${post.faqs.length} FAQs)`);
}

if (dryRun) {
  console.log(`\nDry run: ${queued} posts ready to import. Nothing was written.`);
  process.exit(0);
}
if (queued === 0) {
  console.log("Nothing to import.");
  process.exit(0);
}

let lastStarted = null;
await writeClient.migrate(migration, {
  reporter: (event) => {
    if (event.type === "assets:creating") console.log(`uploading image ${event.data.current}/${event.data.total}`);
    if (event.type === "documents:creating") {
      if (lastStarted) record(lastStarted);
      lastStarted = event.data.document.document.uid;
      console.log(`creating post ${event.data.current}/${event.data.total}  ${lastStarted}`);
    }
    if (event.type === "end") {
      if (lastStarted) record(lastStarted);
      console.log(`\nDone: ${event.data.migrated.documents} posts, ${event.data.migrated.assets} images.`);
    }
  },
});
console.log(`Review them in ${REPOSITORY} → Releases → Migration release. Nothing has been published.`);
