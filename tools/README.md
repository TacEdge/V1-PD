# Capture tooling — V1 Screenshots & Workflow Guide

Puppeteer scripts that captured the screenshots in `public/screenshots/v1-workflows/`,
run against a **local disposable** V1 runtime (never production).

## Safety contract

- Runs only against `V1_BASE_URL` (default `http://localhost:5000`) — a local disposable
  instance of TACEDGE Geotech seeded with **fictional** data.
- **No credentials are committed.** The local-fixture password is supplied at runtime via
  `V1_LOCAL_PASSWORD`; browser session cookies come from throwaway local accounts and are
  never written to disk in this repo.
- Scripts never send email/Teams/SharePoint/voice, never create production records, and
  never trigger irreversible actions. The "email logs" dialog is opened read-only.
- Raw captures go to the gitignored `working/screenshots-raw/`; only reviewed, sanitised
  images are copied into `public/screenshots/v1-workflows/`.

## Reproducing (local only)

1. Stand up a local disposable V1 runtime (copy of TACEDGE Geotech + local Postgres),
   seed it with `scripts/seed-local.cjs`, and start `npm run dev` on port 5000.
2. `export V1_LOCAL_PASSWORD=<the local seed password>`
3. Run the batches: `node tools/prep-data.mjs`, `prep-data2.mjs`, `prep-data3.mjs`,
   then `capture-01-orient.mjs` … `capture-07-auth.mjs`, then `render-xlsx.mjs`.

Determinism: fixed viewports (1440×900 desktop, 390×844 mobile), animations disabled,
`X-Forwarded-For` varied to avoid the app's auth rate limiter on repeated runs.
