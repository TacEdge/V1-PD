# V1 Repository and Runtime Inspection Notes

> **REPOSITORY BOUNDARY STATEMENT**
>
> **tacedge-v1-PD is the only writable repository. TACEDGE Geotech was inspected as a
> read-only evidence source. No intentional changes were made to the TACEDGE Geotech
> repository.**

---

## 1. Repository baseline

### 1.1 tacedge-v1-PD (writable output repository)

| Item | Value |
|---|---|
| Repository name | tacedge-v1-PD (GitHub: `tacedge/v1-pd`) |
| Absolute path | `/home/user/V1-PD` |
| Current branch | `claude/tacedge-v1-product-definition-bxrl5e` |
| Commit SHA at start of work | `37f11a6da4311b717b84daa1488b83de1346d095` |
| Working-tree state at start | Clean (`nothing to commit, working tree clean`) |
| Contents at start | `TACEDGE_Ground_Engineering_V2.0_Product_Definition.pdf` only |
| Chosen documentation framework | Astro (static output, zero-JS by default) |
| Build command | `npm run build` |
| Development command | `npm run dev` |
| Print workflow | Open `/print` route in a Chromium-based browser → File → Print → A4 portrait → Save as PDF. Print stylesheet is applied automatically via `@media print`. |

### 1.2 TACEDGE Geotech (read-only evidence source)

| Item | Value |
|---|---|
| Repository name | TACEDGE Geotech (GitHub: `tacedge/geotech`) |
| Absolute path | `/home/user/Geotech` |
| Current branch | `claude/tacedge-v1-product-definition-bxrl5e` |
| Commit SHA inspected | `975a2ea352f1e1ab260c622a66ab59291d8b81b1` |
| Commit date | 2026-07-05 15:49:35 +1200 (merge of PR #222, `perf/efficiency-pass-1`) |
| Inspection date | 2026-07-17 |
| Working-tree state | Clean at start and end of inspection |
| Application | "RockControl" — multi-tenant SaaS for construction H&S, geotechnical anchor work and port operations |
| Framework / runtime | React 18 + Vite 5 (client), Express 4 + TypeScript (server), Node.js (container inspected with Node v22.22.2) |
| Package manager | npm (package-lock.json present); npm 10.9.7 in inspection container |
| Existing build commands | `npm run build` (vite build + esbuild server bundle), `npm run check` (tsc --noEmit) |
| Existing deployment commands | `fly deploy` (Fly.io, Sydney region, `fly.toml`); DB migrations via `release_command` running `node dist/scripts/migrate.js` |
| Available environments | Production (Fly.io: rockcontrol.app, tacedgepm.com, lpcreporting.app). No staging environment evident in the repository. No local database available in the inspection container. |
| Was the application successfully run? | **No.** Running V1 requires a Postgres/Supabase database, session secret, and multiple external API keys (Anthropic, OpenAI, Deepgram, ElevenLabs, Twilio, Resend, Microsoft Graph, LINZ). None of these were available, and installing dependencies or environment files into TACEDGE Geotech was prohibited by the repository safety rules. |
| Runtime evidence basis | **Static inspection only.** All runtime behaviour claims are marked INFERRED or UNVERIFIED. No local, test, staging or production runtime evidence was gathered. No production credentials were used. |

## 2. Inspection method

1. Confirmed both repository paths, branches, SHAs and clean working trees before any work.
2. All generated work was performed inside `/home/user/V1-PD`.
3. TACEDGE Geotech was inspected with read-only tooling only (file reads, `git log`,
   content search). No files were created, modified, formatted or deleted in it; no
   packages were installed; no branches or commits were created.
4. Evidence hierarchy applied (highest first): schema and migrations → active routes,
   pages, components and services → tests/fixtures → deployment configuration → README
   and docs → git history → code comments and naming → multi-signal inference. The V2
   Product Definition PDF was used for format and comparison context only.
5. Because the application could not be run safely, screenshots of the live product
   could not be captured. The screen inventory is reconstructed from route
   registrations, page components and navigation code, and is marked accordingly.

## 3. Safety confirmations

- tacedge-v1-PD is the writable output repository. ✔
- TACEDGE Geotech is the read-only source repository. ✔
- No environment files, credentials, secrets, tokens, customer data or personal
  information were copied into tacedge-v1-PD. Environment variables are documented by
  **name only**.
- `git status` was re-run in TACEDGE Geotech at the end of the work to confirm a clean
  working tree (output recorded in the final summary).
