# V1 Runtime Screenshot Inspection Notes

> **REPOSITORY BOUNDARY STATEMENT**
>
> **tacedge-v1-PD is the only writable repository. TACEDGE Geotech was inspected as a
> strictly read-only evidence source. No intentional changes were made to TACEDGE
> Geotech.**

## 1. Repository baseline (at start of this exercise)

| Item | tacedge-v1-PD | TACEDGE Geotech |
|---|---|---|
| Path | `/home/user/V1-PD` | `/home/user/Geotech` |
| Branch | `claude/tacedge-v1-product-definition-bxrl5e` | `claude/tacedge-v1-product-definition-bxrl5e` |
| Commit | `8a91db7` (V1 PD site + evidence) | `975a2ea` (unchanged since PD inspection) |
| git status | clean | clean |

## 2. Runtime environment

| Item | Value |
|---|---|
| Runtime type | **Safe local runtime with sanitised (fictional) data** — option 3 of the runtime access rules. No test tenant, staging environment or production access was available. |
| How it was created | The tracked files of TACEDGE Geotech (commit `975a2ea`) were exported with `git archive` to a **disposable copy at `/home/user/v1-runtime/app`** — outside both repositories. Dependencies were installed in the copy only. TACEDGE Geotech itself was not modified: no node_modules, no lockfile change, no .env, no file edits. |
| Database | Local PostgreSQL 16 initialised at `/home/user/v1-runtime/pgdata`, listening on `127.0.0.1:5433` only, trust auth, created empty. **Contains zero production data.** Schema created with `npm run db:push`; data seeded with the repo's own `scripts/seed-local.cjs` (which refuses non-local DATABASE_URLs). |
| Runtime URL | `http://localhost:5000` (Express + Vite dev middleware, `npm run dev`) |
| Environment type | Local development |
| Tenant observed | **RockControl** (default/engineering tenant; `custom_domain=localhost` per the seed script). LPC, SteepWorks and TACEDGE-brand tenant experiences were **not accessible** (branding is domain-resolved and those tenants' data/domains do not exist locally) — marked BLOCKED where relevant. |
| Accounts / roles | Five fictional accounts created for this exercise: OrgAdmin ("Test Admin"), ProjectManager ("Pat Morgan"), SiteSupervisor ("Sam Keller"), FieldTech ("Frankie Tane"), ClientViewer ("Vic Ellison"). All names are fictional; the shared password is a throwaway local value. |
| Test writes permitted? | **Yes** — the environment is fully local and disposable; writes cannot reach any production system. |
| Notifications disabled? | **Yes, structurally**: no Resend-valid key (placeholder only), no Twilio/Teams/SharePoint/ElevenLabs/Deepgram/OpenAI/Anthropic/LINZ keys configured. The server logged each integration as disabled at boot. No external communication is possible from this runtime. |
| External integrations | All absent/disabled. AI-dependent flows are therefore BLOCKED at runtime and documented as such. |
| Data safety | All observed data is fictional, seeded by the repo's own local seed script with names further fictionalised in the disposable copy (project "Riverview Cutting Stabilisation", client "Alpine Hydro Ltd", engineer "K. Manning, CPEng"). Nothing requires redaction, but every screenshot was still reviewed before inclusion. |
| Inspection date | 2026-07-17 |

## 3. Environment fidelity caveats

This local runtime differs from production in ways that bound what it can prove:

1. **Dev server, not the production build** — Vite middleware serves the client; the
   production esbuild bundle and Fly.io topology are not exercised.
2. **No AI keys** — anchor-plan import, test-sheet OCR, meeting analysis, voice
   extraction, report proposals and Ask RC are disabled; their screens render but their
   AI actions are BLOCKED.
3. **No external services** — SharePoint/Teams/Outlook/voice/email flows can be opened
   but not completed; marked PARTIALLY OBSERVED or BLOCKED.
4. **No map tiles** — LINZ/Mapbox keys are absent; map surfaces render without imagery.
5. **Single tenant** — tenant-variant behaviour (LPC port, SteepWorks, TACEDGE brand)
   is code-inspected only (INFERRED/BLOCKED), not observed.
6. **Seeded data volume is small** — performance characteristics are not representative.

These caveats are repeated on affected screenshots and workflows via runtime
classifications.

## 4. Credential handling

- The only credentials are throwaway local accounts inside the disposable database.
- The `.env` in the disposable copy contains a random local session secret and a
  non-functional email-key placeholder; it lives outside both repositories and is never
  committed.
- Browser automation stores no persisted auth state inside tacedge-v1-PD;
  `working/` is gitignored.

## 5. Boot-time observations (recorded verbatim from server logs)

- `WARN ANTHROPIC_API_KEY not set — anchor import AI disabled` (and job-brief, voice
  extractor, Ask RC equivalents).
- `WARN No ELEVENLABS_WEBHOOK_SECRET or VOICE_WEBHOOK_SECRET configured. Webhook
  endpoints (/api/elevenlabs/*) are unprotected.` — **live confirmation of the
  fail-open webhook finding** (EV-021).
- `INFO Archive purge scheduler started (retention=30d, interval=24h)` — confirms the
  in-process purge worker starts with the app.
- The server **failed to boot** until `RESEND_API_KEY` was present: the Resend client
  is constructed at import time (`server/email.ts:4`). Recorded as a validation finding
  (the PD had classified email as optional/degrading).
