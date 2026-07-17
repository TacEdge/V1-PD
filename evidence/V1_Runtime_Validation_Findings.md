# V1 Runtime Validation Findings

Runtime observation against the existing V1 Product Definition (the "PD").
Environment: local disposable runtime, RockControl tenant, fictional seeded data,
2026-07-17. See `V1_Runtime_Screenshot_Inspection_Notes.md` for the full boundary.

**The existing Product Definition is not modified by this document.** Where runtime
differs, the discrepancy is recorded here for a later, deliberate PD update.

Result codes: **Confirmed** · **Refined** · **Contradicted** · **Still unverified**.

---

### RV-01 — The application runs; the PD's "not run / no screenshots" gap is now closed (for one tenant)
- **PD claim:** "The V1 application was not run during this inspection; runtime behaviour is classified INFERRED or UNVERIFIED throughout" (EV-050).
- **Runtime observation:** The application boots and serves the full authenticated experience from the tracked source at commit `975a2ea`, against a local Postgres with the repo's own schema and seed. ~69 screenshots captured across roles and surfaces.
- **Result:** **Refined.** The PD's static findings stand; this guide supplies the runtime layer for the RockControl tenant only. LPC/SteepWorks/TACEDGE-brand runtime remains unverified.
- **Screenshot:** WF-01-S02-dashboard-admin-desktop.
- **Likely explanation:** Access was available for a safe local runtime (option 3), not previously attempted.
- **PD update needed?** Optional — add a note that a local runtime validation exists.

### RV-02 — No QA/confirm gate between review and outward record (CONFIRMED, and visible)
- **PD claim:** V1 has no review-state lifecycle; `needsPmReview` is a flag, not a gate; "reviewing" ≠ "confirming" (Section 04; EV-011; V1-DRL-03).
- **Runtime observation:** The Drill Summary shows every anchor with drill/grout/test columns and a **Review** column that renders "—" for all rows. There is no confirm/submit-for-QA control, no state transition, and no lock. Export actions (PDF, Email, Export) sit at the top of the same screen and act on the current data directly.
- **Result:** **Confirmed.** V1 reviews and exports; it does not confirm.
- **Screenshot:** WF-08-S01-drill-summary-desktop.
- **Likely explanation:** As designed in V1.
- **PD update needed?** No — reinforces the existing finding.

### RV-03 — Design presets flow into field capture (CONFIRMED — the configure→capture spine)
- **PD claim:** Anchor designs are inherited read-only by install logs; the operator "confirms and records" (V1-CFG-01, V1-DRL-01).
- **Runtime observation:** Opening a planned anchor on the Drill screen shows a "Driller Quick Fill — B4" dialog with a **FROM DESIGN** panel (Hole Diameter 50 mm, Max Depth 2.0 m, Bar Spec RB16G, Design Angle 10°, Design Load 80 kN) pre-filled from the project plan; the operator enters only crew, date, actual angle, lithology and notes, and can flag the anchor for testing.
- **Result:** **Confirmed.** The configure→capture inheritance is real and central to the field UX.
- **Screenshot:** WF-05-S03-drill-capture-dialog-desktop.
- **PD update needed?** No.

### RV-04 — Status auto-advances and is shown consistently (CONFIRMED)
- **PD claim:** Anchor status auto-advances planned→drilled→grouted→tested (V1-DRL-01; FIG-04-05).
- **Runtime observation:** The Anchor Plan and drill grid render status-coloured tiles with live tallies ("2 planned · 3 drilled · 1 grouted · 6 tested", "7 of 12 complete"); the dashboard and Drill Summary agree.
- **Result:** **Confirmed.**
- **Screenshot:** WF-03-S01-anchor-plan-desktop, WF-04-S01b-drill-grid-selected-desktop.
- **PD update needed?** No.

### RV-05 — The engineering **test-report PDF itself depends on the AI service** (REFINES the PD)
- **PD claim:** AI is used for test-sheet OCR and conformance analysis (V1-TST-03); the test PDF/XLSX exports are listed as ordinary outputs (V1-TST-04).
- **Runtime observation:** `GET /api/anchor-logs/:id/test-result/report-pdf` returned **HTTP 500 `"Failed to generate engineering report - AI service unavailable"`** with no Anthropic key configured. The engineering test-report PDF is therefore gated on the AI service, not just OCR.
- **Result:** **Refined / partially Contradicted.** The test-report PDF is not a pure templating output; it will not render without AI. The XLSX drill-log export, by contrast, worked (below).
- **Screenshot:** BLOCKED (no output produced); server log captured in inspection notes.
- **Likely explanation:** AI-composed report body; key absent in local runtime.
- **PD update needed?** Yes — clarify that the test-report PDF has an AI dependency (V1-TST-04 / V1-RPT).

### RV-06 — Drill-log XLSX export works and is a 5-sheet workbook (CONFIRMED, detail added)
- **PD claim:** XLSX exports built from a Python/openpyxl template (V1-RPT-03; EV-031).
- **Runtime observation:** `GET /api/projects/:id/drill-log/xlsx` produced a 263 KB workbook with sheets **Drill log table, Totals, Anchor Map, Grouting Summary, Drop Down Lists**, populated with the seeded anchors and lithology.
- **Result:** **Confirmed**, with the sheet structure now documented.
- **Screenshot:** WF-09-S01-drill-log-xlsx-content (rendered from the actual file).
- **PD update needed?** No — enriches V1-RPT-03.

### RV-07 — Report Builder produces a live multi-page PDF with signatory metadata (CONFIRMED, richer than described)
- **PD claim:** Tiptap block editor with revisions and prepared/reviewed/authorised signatories (V1-RPT-01).
- **Runtime observation:** The builder shows a section outline (Cover, Revisions, Limitations, 1–7 + Sign-off), a block editor, and a **live 28-page PDF preview** with a metadata block (CLIENT, PROJECT, PROJECT CODE, PREPARED BY, ISSUE DATE, REVISION A, STATUS DRAFT) and the tenant logo. "All changes saved" autosave is visible.
- **Result:** **Confirmed**, and more polished than the PD conveyed.
- **Screenshot:** WF-09-S04-report-builder-desktop.
- **PD update needed?** Optional — note the live-preview maturity.

### RV-08 — `RESEND_API_KEY` is required at boot (CONTRADICTS "email optional/degrading")
- **PD claim:** Only `DATABASE_URL` and `SESSION_SECRET` fail closed at startup; other integrations "degrade" (EV-046; Section 07).
- **Runtime observation:** The server **crashed at import time** without `RESEND_API_KEY` (`server/email.ts:4` constructs `new Resend(...)` at module load). Boot only succeeded after a placeholder key was supplied.
- **Result:** **Contradicted (narrowly).** Email is not merely degrading — a *missing* key is fail-fast at startup because the client is built eagerly. (A malformed/placeholder key still boots; it would only fail on send.)
- **Screenshot:** N/A (server log captured in inspection notes).
- **Likely explanation:** Eager client construction at import, not lazy.
- **PD update needed?** Yes — add `RESEND_API_KEY` to the effective fail-closed set (with the nuance that any value satisfies boot).

### RV-09 — Fail-open webhook validation confirmed at runtime (CONFIRMED)
- **PD claim:** Webhook/Twilio validators fail open when secrets are unset (EV-021).
- **Runtime observation:** Boot log: `WARN No ELEVENLABS_WEBHOOK_SECRET or VOICE_WEBHOOK_SECRET configured. Webhook endpoints (/api/elevenlabs/*) are unprotected.`
- **Result:** **Confirmed** — the application itself announces the fail-open state.
- **PD update needed?** No.

### RV-10 — A "Just Drill" one-off capture path exists (NEW observation)
- **PD claim:** Not described in the PD.
- **Runtime observation:** The Drill screen offers **"Just Drill — Captures the anchor install as a form — no project required. Rolls up into your submissions list."** alongside project-based capture. This is a project-less capture route that lands in the forms/submissions store rather than the anchor plan.
- **Result:** **New / Refined.** A second capture path parallel to the planned-anchor flow.
- **Screenshot:** WF-04-S00-drill-project-select-desktop.
- **Likely explanation:** A field convenience for un-planned holes; unifies with the forms model.
- **PD update needed?** Optional — note the dual capture paths.

### RV-11 — FieldTech navigation is materially trimmed and requires project selection (CONFIRMED)
- **PD claim:** Field role gets a capture-focused, trimmed nav (Section 04; FIG-04-02).
- **Runtime observation:** FieldTech sees Dashboard, Drill and Grout Logs, Drill Summary, Daily Activity, Notes, a reduced Safety set, Forms and "My Submissions" — no Projects, Testing, Assets, Settings, Meetings-management. On the Drill screen the field user must first pick a project from a "Choose project…" selector before the grid appears.
- **Result:** **Confirmed**, with the project-selection step documented.
- **Screenshot:** WF-04-S00-drill-project-select-desktop, WF-01-S05-dashboard-field-mobile.
- **PD update needed?** No.

### RV-12 — In-app brand identity renders as "TACEDGE" inside the app shell even for the RockControl tenant (observation / caution)
- **PD claim:** Tenant branding is applied at runtime from `tenant_config` (V1-ORG-02).
- **Runtime observation:** The **login page** resolved RockControl branding, but the **in-app sidebar** showed a TACEDGE logo/wordmark ("Shared Operational Clarity. Simple. Fast.") and the top bar reads "Ask TacEdge". The seeded tenant's `brand_logo_url` is `/rclogo.png`.
- **Result:** **Still unverified / tenant-config caveat.** Likely a local default-brand fallback (the seed's minimal `tenant_config` plus dev host resolution), not necessarily production behaviour. Recorded so it is not mistaken for a universal claim.
- **Screenshot:** WF-01-S01-login-desktop (RockControl brand) vs WF-01-S02-dashboard-admin-desktop (TACEDGE shell).
- **Likely explanation:** Local branding resolution / bootstrap default in dev; needs a production check.
- **PD update needed?** No — flagged as an open validation item, not a PD correction.

### RV-13 — Map surfaces render without tiles (CONFIRMED limitation of the local runtime, not V1)
- **PD claim:** MapLibre + LINZ basemaps; keys are client-side (V1-MAP-01).
- **Runtime observation:** The Site Map and project map render the frame and controls but no imagery (no LINZ/Mapbox keys locally).
- **Result:** **Confirmed** as an environment limitation; V1 map behaviour with tiles is **Still unverified** here.
- **Screenshot:** WF-16-S01-site-map-desktop.
- **PD update needed?** No.

### RV-14 — Empty/blocked integration states are graceful (CONFIRMED)
- **Runtime observation:** Documents shows "No document libraries configured"; Surveys, Calendar and SharePoint-backed areas render clean empty states rather than errors.
- **Result:** **Confirmed** — integration-absent states are handled.
- **Screenshot:** WF-20-S01-documents-desktop.
- **PD update needed?** No.

### RV-15 — Public auth routes 404 for authenticated users (NEW observation)
- **PD claim:** The router has two mutually-exclusive trees selected by auth state (Section 04, from static analysis).
- **Runtime observation:** Navigating to `/register`, `/forgot-password` or `/request-access` **while holding a session** renders the "404 Page Not Found" screen — those routes exist only in the unauthenticated router tree. They render correctly in a clean (logged-out) context.
- **Result:** **New / Confirmed** (confirms the two-tree design with a concrete consequence). Harmless, but a signup/reset link followed by an already-logged-in user dead-ends at 404.
- **Screenshot:** ATLAS-PDS-AUTH-register-desktop (clean context) — the real "Activate Your Account" page.
- **Likely explanation:** wouter's authenticated `<Switch>` omits the public auth routes.
- **PD update needed?** Optional.

---

## Summary

| Result | Count | Findings |
|---|---|---|
| Confirmed | 8 | RV-02, RV-03, RV-04, RV-06, RV-07, RV-09, RV-13, RV-14 |
| Refined | 3 | RV-01, RV-05, RV-10 |
| Contradicted (narrow) | 1 | RV-08 |
| Still unverified / caution | 2 | RV-11 (confirmed but tenant-scoped), RV-12 |

**PD updates recommended (not applied here):** RV-05 (test-report PDF AI dependency),
RV-08 (`RESEND_API_KEY` effectively fail-closed at boot). Both are narrow corrections;
the PD's core findings held up well against the runtime.
