# Prismic repository migration: cost-segregation → costsegregationcom

Run everything from the project root in **one PowerShell window** (environment
variables only last for that window). Tokens are read from the environment and
never printed or saved. Nothing is ever written to the source repository, and
nothing is published in the destination.

## One-time setup
```powershell
npm i -D @prismicio/custom-types-client@1.3.1
```

## Tokens (never commit or paste them anywhere)
| Variable | Where to create it |
|---|---|
| `SOURCE_CUSTOM_TYPES_TOKEN` | cost-segregation → Settings → API & Security → Custom Types API |
| `DEST_CUSTOM_TYPES_TOKEN` | costsegregationcom → Settings → API & Security → Custom Types API |
| `DEST_WRITE_TOKEN` | costsegregationcom → Settings → API & Security → **Write APIs** |
| `SOURCE_ACCESS_TOKEN` (optional) | only if the source Content API is private |

```powershell
$env:SOURCE_CUSTOM_TYPES_TOKEN = "..."
$env:DEST_CUSTOM_TYPES_TOKEN   = "..."
$env:DEST_WRITE_TOKEN          = "..."
```

## Steps
1. Backup (read-only):  `node scripts/prismic-migration/01-backup.mjs`
   → check `scripts/prismic-migration/backup/report.json` (expect 3 types, 15 slices, 7 documents).
2. Models: `node scripts/prismic-migration/02-push-models.mjs --dry-run`, then without `--dry-run`.
3. Content dry run: `node scripts/prismic-migration/03-migrate-content.mjs --dry-run`
4. Test batch: `node scripts/prismic-migration/03-migrate-content.mjs --only=site_settings,blog_post:cost-segregation-office-building`
   → check both in costsegregationcom → Releases → Migration release.
5. Rest: `node scripts/prismic-migration/03-migrate-content.mjs`
6. Remaining 17 blog posts: `node scripts/blog-migration/migrate-blog.mjs --dry-run`, then without.

Re-running any step is safe: existing models, documents already in the
destination, and documents recorded in `state/` are skipped.
