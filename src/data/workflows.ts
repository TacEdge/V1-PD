// Screenshots & Workflow Guide — data model.
// Runtime classifications: OBSERVED | OBSERVED — READ ONLY | OBSERVED — TEST DATA
//   | PARTIALLY OBSERVED | INFERRED | BLOCKED | CONTRADICTED
const SHOT = '/screenshots/v1-workflows';

export interface Shot {
  file: string; // filename in public/screenshots/v1-workflows
  caption: string;
  viewport: 'desktop' | 'mobile' | 'artefact';
  cls: string; // runtime classification
}
export interface Step {
  n: number | string;
  action: string;
  sees: string;
  records: string;
  handoff?: string;
  note?: string;
  shots: Shot[];
}
export interface Workflow {
  id: string;
  name: string;
  priority: 1 | 2 | 3;
  actor: string;
  supporting: string;
  startRoute: string;
  endState: string;
  cls: string;
  capabilities: string[];
  pds: string[];
  outcome: string;
  external: string;
  v2Questions: string[];
  steps: Step[];
}

const s = (file: string, caption: string, viewport: Shot['viewport'], cls: string): Shot =>
  ({ file: `${SHOT}/${file}`, caption, viewport, cls });

export const workflows: Workflow[] = [
  {
    id: 'WF-01', name: 'Sign in and reach the tenant experience', priority: 1,
    actor: 'All roles', supporting: '—', startRoute: '/login', endState: 'Role-adaptive dashboard',
    cls: 'OBSERVED', capabilities: ['V1-AUTH-01', 'V1-DSH-01', 'V1-ORG-03'], pds: ['PDS-AUTH', 'PDS-DSH'],
    outcome: 'The user lands on a dashboard whose navigation and widgets are shaped by their role group. No confirmation or approval occurs at sign-in; it is an entry point only.',
    external: 'None. (Microsoft OAuth path exists but was not exercised locally.)',
    v2Questions: [
      'Which tenant-config fields must drive the in-app shell, not only the login page? (The app shell showed TACEDGE branding for the RockControl tenant locally — RV-12.)',
      'Is the four-group role model (Management / Supervisor / Field / Viewer) the right granularity for the V2 operator → PM → engineer chain?',
    ],
    steps: [
      { n: 1, action: 'Open the app; enter email + password (Microsoft OAuth also offered).', sees: 'A tenant-branded login — RockControl branding resolved from the host before sign-in.', records: 'A Postgres-backed session cookie (30-day rolling).', handoff: 'Into the authenticated shell.', shots: [s('WF-01-S01-login-desktop.png', 'Login — RockControl brand resolved pre-login.', 'desktop', 'OBSERVED')] },
      { n: 2, action: 'Arrive on the dashboard (OrgAdmin).', sees: 'KPI tiles (anchors, completion, metres, grout, test pass), a project-progress card and analytics charts.', records: '—', note: 'The in-app sidebar shows a TACEDGE wordmark and “Ask TacEdge”, though the tenant is RockControl (RV-12 — likely a local default; verify in production).', shots: [s('WF-01-S02-dashboard-admin-desktop.png', 'OrgAdmin dashboard — full management navigation.', 'desktop', 'OBSERVED — TEST DATA')] },
      { n: 3, action: 'Compare the field and viewer roles.', sees: 'FieldTech gets a capture-focused, trimmed navigation; ClientViewer is read-only.', records: '—', handoff: 'Field users go to Drill; viewers to read surfaces.', shots: [s('WF-01-S04-dashboard-field-desktop.png', 'FieldTech dashboard — navigation trimmed to capture + safety.', 'desktop', 'OBSERVED'), s('WF-01-S04b-dashboard-viewer-desktop.png', 'ClientViewer dashboard — read-only surfaces.', 'desktop', 'OBSERVED')] },
      { n: 4, action: 'Open the mobile experience (field crew).', sees: 'A phone layout with a fixed bottom bar: Home · This Page · brand · Drill · Voice, and a slide-in nav drawer.', records: '—', shots: [s('WF-01-S05-dashboard-field-mobile.png', 'Field mobile dashboard + bottom navigation.', 'mobile', 'OBSERVED'), s('WF-01-S03b-mobile-drawer.png', 'Mobile navigation drawer.', 'mobile', 'OBSERVED')] },
    ],
  },
  {
    id: 'WF-02', name: 'Configure a ground-engineering project', priority: 1,
    actor: 'Project Manager', supporting: 'OrgAdmin', startRoute: '/projects', endState: 'Project with zones, designs, mixes and methods',
    cls: 'OBSERVED — TEST DATA', capabilities: ['V1-PRJ-01', 'V1-PRJ-02', 'V1-CFG-01', 'V1-CFG-02', 'V1-CFG-03'], pds: ['PDS-PRJ', 'PDS-PRJD'],
    outcome: 'A configured project shell: zones/sections, anchor designs, grout mixes and drill methods that field capture later inherits. Nothing is released; this is preparation.',
    external: 'None (local writes only).',
    v2Questions: [
      'Does V2 keep per-project setup, or move to reusable, work-type-scoped templates the PD calls out as absent in V1?',
      'The setup is spread across many tabs with no guided first-run — is a “cold PM in under 10 minutes” bar (V2 DoD 1) reachable from this base?',
    ],
    steps: [
      { n: 1, action: 'Open Projects and select a project.', sees: 'A projects list with status and progress.', records: '—', handoff: 'Into the project workspace.', shots: [s('WF-02-S01-projects-list-desktop.png', 'Projects list.', 'desktop', 'OBSERVED — TEST DATA')] },
      { n: 2, action: 'Review the project overview.', sees: 'A tabbed workspace: Overview, Job Brief, Specifications, Anchor Plan, Site Map, Drill Summary, DAS Specs, Reports, Records, Surveys, Settings.', records: '—', shots: [s('WF-02-S02-project-overview-desktop.png', 'Project workspace — tab strip and header.', 'desktop', 'OBSERVED — TEST DATA')] },
      { n: 3, action: 'Define specifications.', sees: 'Anchor designs, grout mixes and drill methods for the project.', records: 'Design/mix/method rows the plan and capture inherit.', handoff: 'Specifications feed the Anchor Plan and the drill dialog.', shots: [s('WF-02-S03-specifications-desktop.png', 'Specifications — the building blocks capture inherits.', 'desktop', 'OBSERVED — TEST DATA')] },
      { n: 4, action: 'Review supporting project areas.', sees: 'A per-project Records area (meetings, documents, incidents, variations) and a documents store.', records: '—', shots: [s('WF-02-S07-records-meetings-desktop.png', 'Records tab — meetings within the project.', 'desktop', 'OBSERVED'), s('WF-02-S08-project-documents-desktop.png', 'Project documents area.', 'desktop', 'OBSERVED')] },
    ],
  },
  {
    id: 'WF-03', name: 'Plan anchors', priority: 1,
    actor: 'Project Manager', supporting: '—', startRoute: '/projects/:id', endState: 'Planned anchors placed in zones',
    cls: 'OBSERVED — TEST DATA', capabilities: ['V1-PRJ-02', 'V1-PLN-01', 'V1-PLN-02'], pds: ['PDS-PRJD'],
    outcome: 'A zone/row anchor layout with designs assigned — the source of the field crew’s day list and the Status Board’s tallies. AI PDF import can propose the layout but a human approves before anything is created.',
    external: 'None. AI plan import and job brief require the Anthropic key and were BLOCKED locally.',
    v2Questions: [
      'Is AI plan import load-bearing or assistive for V2 (V2 makes it a Must, human-approved)?',
      'The plan is schematic (zone/row grid) plus a face-photo map — does that satisfy the V2 Spatial Map job, or is real-space placement new?',
    ],
    steps: [
      { n: 1, action: 'Open the Anchor Plan.', sees: 'A status-coloured anchor grid by zone (2 planned · 3 drilled · 1 grouted · 6 tested), row-direction control, design legend, and an “Import plan from PDF” action.', records: 'Planned anchor rows.', handoff: 'Drillers see saved anchors in the Drill screen immediately.', shots: [s('WF-03-S01-anchor-plan-desktop.png', 'Anchor Plan — schematic grid, design legend, PDF-import entry.', 'desktop', 'OBSERVED — TEST DATA')] },
      { n: 2, action: 'Attempt AI-assisted planning (Job Brief / PDF import).', sees: 'The entry points render but the AI actions are disabled without a key.', records: '—', note: 'AI plan import and job-brief extraction are BLOCKED in this runtime; the propose→approve→commit discipline could not be observed end-to-end.', shots: [s('WF-03-S03-job-brief-blocked-desktop.png', 'Job Brief tab — AI extraction unavailable (no key).', 'desktop', 'BLOCKED')] },
    ],
  },
  {
    id: 'WF-04', name: 'Locate and select an anchor', priority: 1,
    actor: 'Field crew', supporting: '—', startRoute: '/drill', endState: 'The intended anchor is open for capture',
    cls: 'OBSERVED — TEST DATA', capabilities: ['V1-DRL-01', 'V1-MAP-02'], pds: ['PDS-DRL', 'PDS-PRJD'],
    outcome: 'The field user identifies and opens the anchor they are working on, from a schematic grid or a face-photo map.',
    external: 'None.',
    v2Questions: [
      'Should V2 unify the planned-anchor flow and the project-less “Just Drill” capture path (RV-10)?',
      'Is “pick a project first” the right first step for a field user, or should the device already know the job?',
    ],
    steps: [
      { n: 1, action: 'Open Drill.', sees: 'A “Select a project” step, plus a “Just Drill” option that captures an install as a form with no project.', records: '—', note: 'The project-less “Just Drill” path (RV-10) is a second capture route that lands in Submissions rather than the anchor plan.', shots: [s('WF-04-S00-drill-project-select-desktop.png', 'Drill entry — project select and the “Just Drill” one-off path.', 'desktop', 'OBSERVED')] },
      { n: 2, action: 'Select the project.', sees: 'A status-coloured Anchor Map with a Grid / Photo Map toggle, a live progress bar and “7 of 12 complete”.', records: '—', handoff: 'Tap an anchor to open capture.', shots: [s('WF-04-S01b-drill-grid-selected-desktop.png', 'Drill grid — status tiles, Grid/Photo-Map toggle, progress.', 'desktop', 'OBSERVED — TEST DATA'), s('WF-04-S01-drill-grid-mobile.png', 'Drill grid on a phone.', 'mobile', 'OBSERVED')] },
    ],
  },
  {
    id: 'WF-05', name: 'Capture drilling', priority: 1,
    actor: 'Field crew', supporting: 'Site Supervisor', startRoute: '/drill', endState: 'Anchor status = drilled',
    cls: 'OBSERVED — TEST DATA', capabilities: ['V1-DRL-01', 'V1-DRL-02', 'V1-DRL-03', 'V1-OFF-01'], pds: ['PDS-DRL'],
    outcome: 'A drill record against a planned anchor, with lithology and notes. Status auto-advances to drilled and populates the PM’s live views. The operator confirms and records; they do not decide the specs.',
    external: 'None (local writes). Offline replay exists but was not exercised in this runtime.',
    v2Questions: [
      'Does the V2 review lifecycle (submitted → confirmed) change this capture dialog, or ride alongside it?',
      'Is the offline sync-queue robust enough for the V2 “full shift, no signal, nothing lost” bar (DoD 4)?',
    ],
    steps: [
      { n: 1, action: 'Open a planned anchor from the grid.', sees: 'A “Driller Quick Fill” dialog with a FROM DESIGN panel (hole diameter, max depth, bar spec, design angle, design load) pre-filled from the plan.', records: '—', note: 'This is the configure→capture spine in one screen: the operator touches only what physically varies.', shots: [s('WF-05-S03-drill-capture-dialog-desktop.png', 'Driller Quick Fill — design presets inherited; minimal entry.', 'desktop', 'OBSERVED — TEST DATA')] },
      { n: 2, action: 'Enter crew, date, actual angle, lithology by depth and notes; optionally flag for testing.', sees: 'Lithology from/to rows (free-type where no presets exist), a notes field, and a “Flag this anchor for testing” control.', records: 'A drill record + ground-profile layers; the testing flag if set.', handoff: 'Status auto-advances to drilled; the PM sees it live.', shots: [s('WF-05-S03b-drill-capture-dialog-full.png', 'Full capture dialog — lithology, notes, flag-for-testing.', 'desktop', 'OBSERVED — TEST DATA')] },
      { n: 3, action: 'Use quick / bulk drill for repeated values.', sees: 'A streamlined quick-drill mode.', records: 'Multiple anchors updated efficiently.', shots: [s('WF-05-S06-quick-drill-desktop.png', 'Quick-drill mode.', 'desktop', 'OBSERVED'), s('WF-05-S05-drill-grid-desktop.png', 'Drill grid (desktop, supervisor).', 'desktop', 'OBSERVED')] },
    ],
  },
  {
    id: 'WF-06', name: 'Capture grouting', priority: 1,
    actor: 'Field crew', supporting: '—', startRoute: '/drill', endState: 'Anchor status = grouted',
    cls: 'OBSERVED — TEST DATA', capabilities: ['V1-GRT-01'], pds: ['PDS-DRL'],
    outcome: 'A grout record against a drilled anchor (mix from PM presets, volumes, date). Status advances to grouted.',
    external: 'None.',
    v2Questions: [
      'Where does the requires-redrill exception sit in the V2 two-dimension model (work phase vs review state)?',
    ],
    steps: [
      { n: 1, action: 'Select a drilled anchor and record grout.', sees: 'The same quick-fill dialog family, now for grout — mix selection, volumes/bag counts, date, issue flags.', records: 'A grout record; status advances to grouted.', handoff: 'Grouted anchors become testable.', note: 'The requires-redrill path was not exercised (no false failures were created).', shots: [s('WF-05-S03-drill-capture-dialog-desktop.png', 'Grout is captured through the same quick-fill pattern.', 'desktop', 'OBSERVED — TEST DATA')] },
    ],
  },
  {
    id: 'WF-07', name: 'Capture and process an anchor test', priority: 1,
    actor: 'Project Manager', supporting: 'Site Supervisor', startRoute: '/anchor-testing', endState: 'Test result with conformance',
    cls: 'PARTIALLY OBSERVED', capabilities: ['V1-TST-01', 'V1-TST-02', 'V1-TST-03', 'V1-TST-04'], pds: ['PDS-TST'],
    outcome: 'A load-test record against a standard, with a pass/fail conformance result. Paper remains the capture medium; the platform digitises downstream via AI OCR.',
    external: 'None. Photo OCR and the engineering test-report PDF require the Anthropic key and were BLOCKED (RV-05).',
    v2Questions: [
      'Is AI acceptable in the trusted-record path — the test-report PDF itself would not render without it (RV-05)?',
      'V2 treats “value is in digitising the output, not the capture” — does V1’s OCR-first pattern match that intent?',
    ],
    steps: [
      { n: 1, action: 'Open Anchor Testing.', sees: 'A test list with pass/fail totals (5 pass, 1 fail), standard, design/proof/max loads, creep and tester.', records: '—', shots: [s('WF-07-S01-anchor-testing-list-desktop.png', 'Anchor Testing — results, standards and a visible Fail.', 'desktop', 'OBSERVED — TEST DATA')] },
      { n: 2, action: 'Review a test against its standard.', sees: 'Per-load-step readings and conformance against the selected standard (e.g. PTI DC35).', records: '—', note: 'Photo OCR and the test-report PDF are BLOCKED without AI; the report PDF returned HTTP 500 “AI service unavailable” (RV-05).', shots: [s('WF-07-S02-test-detail-desktop.png', 'Test results with standards and conformance columns.', 'desktop', 'OBSERVED — TEST DATA')] },
    ],
  },
  {
    id: 'WF-08', name: 'Review the project record', priority: 1,
    actor: 'Project Manager', supporting: '—', startRoute: '/anchor-logs', endState: 'Reviewed (not confirmed) record',
    cls: 'OBSERVED — TEST DATA', capabilities: ['V1-DRL-03'], pds: ['PDS-ALG'],
    outcome: 'The PM sees the whole anchor record, can filter, bulk-edit and flag rows for review — but there is no confirm/QA gate. Reviewing is not confirming; export acts on live data directly.',
    external: 'None.',
    v2Questions: [
      'How does V2’s submitted → confirmed → re-opened lifecycle graft onto this flat table (RV-02)?',
      'Where should the confirmed-only-outward boundary live relative to the Drill Summary and the exports beside it?',
    ],
    steps: [
      { n: 1, action: 'Open Drill Summary.', sees: 'Every anchor with drill/grout/test columns, stats, filters — and a Review column that is empty for all rows.', records: '—', note: 'RV-02: there is no QA/confirm gate. needsPmReview is a flag; “Review” never resolves to a locked, confirmed state. Export/PDF/Email sit at the top of the same screen.', shots: [s('WF-08-S01-drill-summary-desktop.png', 'Drill Summary — note the empty Review column: no confirm gate.', 'desktop', 'OBSERVED — TEST DATA')] },
      { n: 2, action: 'Open a log for detail / edit.', sees: 'A per-anchor detail dialog.', records: 'Edits to the anchor record (capability-gated, not state-gated).', shots: [s('WF-08-S03-log-detail-dialog-desktop.png', 'Anchor log detail.', 'desktop', 'OBSERVED')] },
    ],
  },
  {
    id: 'WF-09', name: 'Export and release information', priority: 1,
    actor: 'Project Manager', supporting: '—', startRoute: '/anchor-logs', endState: 'XLSX / PDF / built report output',
    cls: 'OBSERVED — TEST DATA', capabilities: ['V1-RPT-01', 'V1-RPT-02', 'V1-RPT-03'], pds: ['PDS-ALG', 'PDS-RPT'],
    outcome: 'The outward-facing V1 record is an exported file (XLSX drill log, engineering test PDF) or a built report emailed to the engineer. Release is an export action, not a state transition — nothing is “confirmed” before it leaves.',
    external: 'Email send (opened, NOT triggered). The test-report PDF is AI-gated (RV-05).',
    v2Questions: [
      'Which export is the client-facing record of truth in V2 — the drill-log XLSX, the test PDF, or the built report?',
      'Does the Report Builder become the V2 closeout tool, or does release-from-record replace document assembly?',
    ],
    steps: [
      { n: 1, action: 'Export the drill log to XLSX.', sees: 'A 5-sheet workbook (Drill log table, Totals, Anchor Map, Grouting Summary, Drop-Down Lists) populated with the project record.', records: '—', note: 'The XLSX export worked at runtime (RV-06); the image is rendered from the actual exported file.', shots: [s('WF-09-S01-drill-log-xlsx-content.png', 'Content of the actual drill-log XLSX export.', 'artefact', 'OBSERVED — TEST DATA')] },
      { n: 2, action: 'Open the “email logs to teammate” dialog (not sent).', sees: 'A recipient picker restricted to tenant teammates.', records: '—', handoff: 'Would email the log set to a colleague.', note: 'Opened read-only; no email was sent (send is disabled in this runtime).', shots: [s('WF-09-S02-email-logs-dialog-desktop.png', 'Email-logs dialog (opened, not sent).', 'desktop', 'OBSERVED — READ ONLY')] },
      { n: 3, action: 'Build an engineer report.', sees: 'A section outline (Cover → Sign-off), a block editor, and a live 28-page PDF preview with a metadata block (client, project, prepared-by, revision, status) and the tenant logo.', records: 'A report document + immutable revision snapshots.', handoff: 'The built report is the client-facing deliverable.', shots: [s('WF-09-S04-report-builder-desktop.png', 'Report Builder — block editor and live multi-page PDF preview.', 'desktop', 'OBSERVED — TEST DATA'), s('WF-09-S03-project-reports-desktop.png', 'Project reports list.', 'desktop', 'OBSERVED')] },
    ],
  },
  {
    id: 'WF-10', name: 'Complete a Daily Activity Sheet', priority: 1,
    actor: 'Site Supervisor', supporting: 'Field crew', startRoute: '/daily-activity', endState: 'Saved DAS + PDF / invoice XLSX',
    cls: 'OBSERVED — TEST DATA', capabilities: ['V1-DAS-01', 'V1-DAS-02', 'V1-DAS-03'], pds: ['PDS-DAS', 'PDS-PRJD'],
    outcome: 'A per-shift record of crew and plant hours, auto-totalled and exportable as a PDF and an invoice-format XLSX. V1 already exceeds the V2 “resourcing sheet” scope here.',
    external: 'None.',
    v2Questions: [
      'Does V2 adopt V1’s DAS rate cards (positions/personnel/plant rates) as-is, given V2 parks pay/invoice computation?',
    ],
    steps: [
      { n: 1, action: 'Open Daily Activity and start a sheet.', sees: 'Sheet details (site, date, shift, weather, completed-by), a Staff table and a Plant & Equipment table with Add-Row.', records: 'A daily-activity form with crew/plant hours.', shots: [s('WF-10-S02-das-new-sheet-desktop.png', 'New DAS — staff and plant hour tables.', 'desktop', 'OBSERVED — TEST DATA'), s('WF-10-S01-das-list-desktop.png', 'Daily Activity list.', 'desktop', 'OBSERVED')] },
      { n: 2, action: 'Rely on the project DAS specs.', sees: 'Positions, personnel and plant with rates, assigned per project, feed the pickers.', records: '—', shots: [s('WF-10-S00-project-das-specs-desktop.png', 'Project DAS specs — the rate/roster catalogues.', 'desktop', 'OBSERVED')] },
    ],
  },
  // ---------- Priority 2 ----------
  {
    id: 'WF-11', name: 'JSA daily sign-in', priority: 2,
    actor: 'Field crew', supporting: 'OrgAdmin', startRoute: '/forms/:id', endState: 'Child sign-in record',
    cls: 'OBSERVED — TEST DATA', capabilities: ['V1-SAF-04', 'V1-FRM-01'], pds: ['PDS-FRM', 'PDS-FB'],
    outcome: 'A daily acknowledgement against a parent JSA, with a signature. Notably, drilling is NOT gated on sign-in in V1 — unlike the V2 SOS-4 concept.',
    external: 'None.',
    v2Questions: [
      'Does V2 require JSA sign-on to gate drilling, and where would that gate live (client, API, both)?',
    ],
    steps: [
      { n: 1, action: 'Open the JSA form on a phone and sign in.', sees: 'A dynamic form (task, hazards, controls, PPE) with a signature field.', records: 'A child sign-in form linked to the parent JSA.', note: 'No enforced barrier gates drilling on sign-in in V1 (WF-05 opens regardless).', shots: [s('WF-11-S02-jsa-fill-mobile.png', 'JSA fill with daily sign-in (mobile).', 'mobile', 'OBSERVED — TEST DATA')] },
    ],
  },
  {
    id: 'WF-12', name: 'Incident or near-miss report', priority: 2,
    actor: 'Field crew', supporting: 'HSE / PM', startRoute: '/incidents', endState: 'Submitted incident form',
    cls: 'OBSERVED — TEST DATA', capabilities: ['V1-SAF-01', 'V1-SAF-02', 'V1-FRM-03'], pds: ['PDS-SAF', 'PDS-FRM', 'PDS-SUB'],
    outcome: 'A safety event captured via a form template, listed for management, with status. Teams/SharePoint sync and AI analysis are integration-dependent.',
    external: 'Teams / SharePoint notifications (disabled locally). No real incident was submitted.',
    v2Questions: [
      'Which incident store is authoritative — the incidents table or form-based incident-reports (the PD flags two stores)?',
    ],
    steps: [
      { n: 1, action: 'Open Incidents; start a report.', sees: 'An incidents list and a template-driven form.', records: 'An incident-report form (test content).', shots: [s('WF-12-S01-incidents-list-desktop.png', 'Incidents list.', 'desktop', 'OBSERVED'), s('WF-12-S02-incident-fill-mobile.png', 'Incident form (mobile).', 'mobile', 'OBSERVED — TEST DATA')] },
      { n: 2, action: 'Attempt to submit incomplete.', sees: 'Required-field validation blocks submission.', records: '—', shots: [s('WF-12-S02b-incident-validation-mobile.png', 'Required-field validation on the incident form.', 'mobile', 'OBSERVED')] },
    ],
  },
  {
    id: 'WF-13', name: 'In-app voice report', priority: 2,
    actor: 'Field crew', supporting: '—', startRoute: '__voice__', endState: 'Extracted form (draft)',
    cls: 'PARTIALLY OBSERVED', capabilities: ['V1-VCE-02', 'V1-VCE-03'], pds: ['PDS-DSH'],
    outcome: 'A voice-first report dialog that (with Deepgram + Anthropic) transcribes speech and extracts a structured form. Locally the dialog and report-type chips were seen; transcription/extraction were BLOCKED.',
    external: 'None locally (Deepgram/Anthropic disabled). The phone agent was not called.',
    v2Questions: [
      'Is voice a V2 workspace feature or a retained service — V2 makes voice transcription a “Should”, not a Must?',
    ],
    steps: [
      { n: 1, action: 'Open the Quick Voice Report dialog.', sees: 'Report-type chips (Incident, Near miss, Take 5, Inspection, Crew briefing, Variation, Drill log) and a mic — “speak naturally for 30–60 seconds”.', records: '—', note: 'Transcription and AI field extraction are BLOCKED without keys; only the entry surface was observed.', shots: [s('WF-13-S01-voice-dialog-desktop.png', 'Quick Voice Report — type chips + mic (extraction blocked).', 'desktop', 'PARTIALLY OBSERVED')] },
    ],
  },
  {
    id: 'WF-14', name: 'Safety meeting / toolbox talk', priority: 2,
    actor: 'Site Supervisor', supporting: 'All', startRoute: '/meetings', endState: 'Meeting record + actions',
    cls: 'PARTIALLY OBSERVED', capabilities: ['V1-MTG-01', 'V1-MTG-02', 'V1-MTG-03'], pds: ['PDS-MTG', 'PDS-MTGD'],
    outcome: 'A meeting record with participants, tasks and (with keys) recording, transcription and AI analysis. Recording/AI were BLOCKED locally.',
    external: 'None locally.',
    v2Questions: [
      'Is the meetings suite (recording, transcription, AI) in the V2 workspace scope, or a separate H&S product?',
    ],
    steps: [
      { n: 1, action: 'Open Meetings and a meeting.', sees: 'A meetings list and a detail view with attendance and actions.', records: 'Participants, tasks.', note: 'Recording, transcription and AI analysis are BLOCKED without keys.', shots: [s('WF-14-S01-meetings-list-desktop.png', 'Meetings list.', 'desktop', 'OBSERVED — TEST DATA'), s('WF-14-S03-meeting-detail-desktop.png', 'Meeting detail (recording/AI blocked).', 'desktop', 'PARTIALLY OBSERVED')] },
    ],
  },
  {
    id: 'WF-15', name: 'Dynamic form creation and submission', priority: 2,
    actor: 'OrgAdmin', supporting: 'Field crew', startRoute: '/forms', endState: 'Template + submissions',
    cls: 'OBSERVED — TEST DATA', capabilities: ['V1-FRM-01', 'V1-FRM-02', 'V1-FRM-03'], pds: ['PDS-FB', 'PDS-FRM', 'PDS-SUB'],
    outcome: 'Custom form templates authored in a builder, filled dynamically on a phone, and reviewed in a submissions inbox with a status lifecycle.',
    external: 'None.',
    v2Questions: [
      'How much of the general forms platform does the V2 ground-engineering workspace keep vs. shed?',
    ],
    steps: [
      { n: 1, action: 'Browse templates; open the Form Builder.', sees: 'A template gallery and a drag-and-drop field builder.', records: 'Form templates.', shots: [s('WF-15-S01-forms-gallery-desktop.png', 'Forms gallery.', 'desktop', 'OBSERVED — TEST DATA'), s('WF-15-S02-form-builder-desktop.png', 'Form Builder.', 'desktop', 'OBSERVED')] },
      { n: 2, action: 'Review the submissions inbox.', sees: 'Submitted forms with status (draft → pending → approved/rejected → completed → archived).', records: 'Status changes.', shots: [s('WF-15-S04-submissions-desktop.png', 'Submissions inbox.', 'desktop', 'OBSERVED')] },
    ],
  },
  {
    id: 'WF-16', name: 'Project map and face-photo workflow', priority: 2,
    actor: 'Project Manager', supporting: 'Field crew', startRoute: '/projects/:id', endState: 'Annotations / pinned anchors',
    cls: 'PARTIALLY OBSERVED', capabilities: ['V1-MAP-01', 'V1-MAP-02'], pds: ['PDS-PRJD'],
    outcome: 'A MapLibre project map with annotations, and a face-photo canvas where anchors are pinned onto rock-face imagery. Map tiles were absent locally (no LINZ key).',
    external: 'None.',
    v2Questions: [
      'Do face-photo pins and the zone grid satisfy the V2 Status Board / Spatial Map jobs, or is that surface new?',
    ],
    steps: [
      { n: 1, action: 'Open the Site Map tab.', sees: 'The map frame and controls render; no basemap imagery without a LINZ/Mapbox key.', records: '—', note: 'Map behaviour with tiles, and face-photo pinning, remain unverified in this runtime.', shots: [s('WF-16-S01-site-map-desktop.png', 'Site Map — frame renders; no tiles locally.', 'desktop', 'PARTIALLY OBSERVED')] },
    ],
  },
  // ---------- Priority 3 (concise) ----------
  {
    id: 'WF-17', name: 'Asset register and certification', priority: 3,
    actor: 'OrgAdmin', supporting: '—', startRoute: '/assets', endState: 'Asset with certification expiry',
    cls: 'OBSERVED — TEST DATA', capabilities: ['V1-AST-01'], pds: ['PDS-AST'],
    outcome: 'A register of plant and test equipment with certification/calibration expiry; jack assets link to anchor tests.',
    external: 'None.',
    v2Questions: ['Is asset / calibration tracking within the V2 workspace scope?'],
    steps: [{ n: 1, action: 'Open the Asset Register.', sees: 'Assets with categories, certification dates and expiry.', records: 'Asset rows.', shots: [s('WF-17-S01-asset-register-desktop.png', 'Asset Register with certification expiry.', 'desktop', 'OBSERVED — TEST DATA')] }],
  },
  {
    id: 'WF-18', name: 'User creation and RBAC', priority: 3,
    actor: 'OrgAdmin', supporting: '—', startRoute: '/settings', endState: 'Users + capability overrides',
    cls: 'OBSERVED — TEST DATA', capabilities: ['V1-USR-01', 'V1-USR-02'], pds: ['PDS-SET'],
    outcome: 'User management and per-org capability overrides from Settings.',
    external: 'Invite email (not sent locally).',
    v2Questions: ['Does V2 keep per-org RBAC overrides, or a fixed role model?'],
    steps: [{ n: 1, action: 'Open Settings → users.', sees: 'A user table and role administration.', records: 'Users; capability overrides.', shots: [s('WF-18-S01-settings-users-desktop.png', 'Settings — user management.', 'desktop', 'OBSERVED — TEST DATA')] }],
  },
  {
    id: 'WF-19', name: 'Tenant branding and configuration', priority: 3,
    actor: 'OrgAdmin', supporting: '—', startRoute: '/settings', endState: 'Branding / flags configured',
    cls: 'PARTIALLY OBSERVED', capabilities: ['V1-ORG-02', 'V1-ORG-03'], pds: ['PDS-SET'],
    outcome: 'Per-tenant branding, feature flags and copy overrides. The PD notes PATCH /api/tenant/config is un-zodded.',
    external: 'None.',
    v2Questions: ['Where does the config-not-code boundary sit in V2, given V1’s in-app branding leakage (RV-12)?'],
    steps: [{ n: 1, action: 'Open Settings → branding.', sees: 'Branding and configuration controls.', records: 'tenant_config updates.', shots: [s('WF-19-S01-branding-desktop.png', 'Settings — branding/configuration.', 'desktop', 'PARTIALLY OBSERVED')] }],
  },
  {
    id: 'WF-20', name: 'Project documents and SharePoint', priority: 3,
    actor: 'OrgAdmin', supporting: 'Viewer', startRoute: '/documents', endState: 'Document listing',
    cls: 'OBSERVED — READ ONLY', capabilities: ['V1-DOC-01', 'V1-PRJ-04'], pds: ['PDS-DOC', 'PDS-PRJD'],
    outcome: 'A SharePoint-backed document browser (via Microsoft Graph) plus a per-project documents store. SharePoint was absent locally — a clean empty state.',
    external: 'None.',
    v2Questions: ['Consolidate to one document model in V2; does SharePoint remain a customer requirement?'],
    steps: [{ n: 1, action: 'Open Documents.', sees: '“No document libraries configured” — a graceful empty state.', records: '—', shots: [s('WF-20-S01-documents-desktop.png', 'Documents — SharePoint-absent empty state.', 'desktop', 'OBSERVED — READ ONLY')] }],
  },
  {
    id: 'WF-23', name: 'Drone survey and point cloud', priority: 3,
    actor: 'Project Manager', supporting: '—', startRoute: '/projects/:id', endState: 'Survey / analysis',
    cls: 'OBSERVED — READ ONLY', capabilities: ['V1-DRN-01', 'V1-DRN-02', 'V1-DRN-03'], pds: ['PDS-PRJD'],
    outcome: 'A drone-survey surface for imagery and point clouds. Empty locally; the point-cloud worker and AI analysis are BLOCKED.',
    external: 'None.',
    v2Questions: ['Is drone / point-cloud processing within the V2 workspace scope, or a separate capability?'],
    steps: [{ n: 1, action: 'Open the Surveys tab.', sees: 'An empty surveys surface.', records: '—', shots: [s('WF-23-S01-surveys-empty-desktop.png', 'Drone surveys — empty; worker blocked.', 'desktop', 'OBSERVED — READ ONLY')] }],
  },
  {
    id: 'WF-24', name: 'Global search and calendar', priority: 3,
    actor: 'OrgAdmin', supporting: '—', startRoute: 'top bar', endState: 'Results / events',
    cls: 'PARTIALLY OBSERVED', capabilities: ['V1-SRCH-01', 'V1-CAL-01'], pds: ['PDS-DSH', 'PDS-CAL'],
    outcome: 'A global command-palette search and an Outlook-syncable calendar. Outlook connect was BLOCKED locally.',
    external: 'None.',
    v2Questions: ['Are search and calendar within the V2 workspace scope?'],
    steps: [{ n: 1, action: 'Open the Calendar.', sees: 'A calendar surface; Outlook connect requires OAuth.', records: '—', shots: [s('WF-24-S02-calendar-desktop.png', 'Calendar (Outlook connect blocked).', 'desktop', 'PARTIALLY OBSERVED')] }],
  },
];

// ---- Screen Atlas groups (every meaningful accessible screen) ----
export interface AtlasEntry { name: string; route: string; pds: string; role: string; cls: string; file?: string; note?: string; }
export interface AtlasGroup { title: string; entries: AtlasEntry[]; }
const a = (name: string, route: string, pds: string, role: string, cls: string, file?: string, note?: string): AtlasEntry =>
  ({ name, route, pds, role, cls, file: file ? `${SHOT}/${file}` : undefined, note });

export const atlas: AtlasGroup[] = [
  { title: 'Authentication', entries: [
    a('Login', '/login', 'PDS-AUTH', 'Public', 'OBSERVED', 'WF-01-S01-login-desktop.png'),
    a('Register', '/register', 'PDS-AUTH', 'Public', 'OBSERVED', 'ATLAS-PDS-AUTH-register-desktop.png'),
    a('Forgot password', '/forgot-password', 'PDS-AUTH', 'Public', 'OBSERVED', 'ATLAS-PDS-AUTH-forgot-password-desktop.png'),
    a('Request access', '/request-access', 'PDS-AUTH', 'Public', 'OBSERVED', 'ATLAS-PDS-AUTH-request-access-desktop.png'),
  ] },
  { title: 'Dashboard', entries: [
    a('Dashboard (OrgAdmin)', '/', 'PDS-DSH', 'OrgAdmin', 'OBSERVED — TEST DATA', 'WF-01-S02-dashboard-admin-desktop.png'),
    a('Dashboard (Field)', '/', 'PDS-DSH', 'FieldTech', 'OBSERVED', 'WF-01-S04-dashboard-field-desktop.png'),
    a('Dashboard (Viewer)', '/', 'PDS-DSH', 'ClientViewer', 'OBSERVED', 'WF-01-S04b-dashboard-viewer-desktop.png'),
    a('Dashboard (mobile)', '/', 'PDS-DSH', 'FieldTech', 'OBSERVED', 'WF-01-S05-dashboard-field-mobile.png'),
  ] },
  { title: 'Projects & setup', entries: [
    a('Projects list', '/projects', 'PDS-PRJ', 'Management', 'OBSERVED — TEST DATA', 'WF-02-S01-projects-list-desktop.png'),
    a('Project overview', '/projects/:id', 'PDS-PRJD', 'Management', 'OBSERVED — TEST DATA', 'WF-02-S02-project-overview-desktop.png'),
    a('Specifications', '/projects/:id', 'PDS-PRJD', 'Management', 'OBSERVED — TEST DATA', 'WF-02-S03-specifications-desktop.png'),
    a('Anchor Plan', '/projects/:id', 'PDS-PRJD', 'Management', 'OBSERVED — TEST DATA', 'WF-03-S01-anchor-plan-desktop.png'),
    a('DAS specs', '/projects/:id', 'PDS-PRJD', 'Management', 'OBSERVED', 'WF-10-S00-project-das-specs-desktop.png'),
  ] },
  { title: 'Field capture', entries: [
    a('Drill — project select', '/drill', 'PDS-DRL', 'Field', 'OBSERVED', 'WF-04-S00-drill-project-select-desktop.png'),
    a('Drill grid', '/drill', 'PDS-DRL', 'Field', 'OBSERVED — TEST DATA', 'WF-04-S01b-drill-grid-selected-desktop.png'),
    a('Driller Quick Fill', '/drill', 'PDS-DRL', 'Field', 'OBSERVED — TEST DATA', 'WF-05-S03-drill-capture-dialog-desktop.png'),
    a('Drill grid (mobile)', '/drill', 'PDS-DRL', 'Field', 'OBSERVED', 'WF-04-S01-drill-grid-mobile.png'),
  ] },
  { title: 'Testing', entries: [
    a('Anchor Testing list', '/anchor-testing', 'PDS-TST', 'Management', 'OBSERVED — TEST DATA', 'WF-07-S01-anchor-testing-list-desktop.png'),
    a('Test detail / results', '/anchor-testing', 'PDS-TST', 'Management', 'OBSERVED — TEST DATA', 'WF-07-S02-test-detail-desktop.png'),
  ] },
  { title: 'Review & reporting', entries: [
    a('Drill Summary', '/anchor-logs', 'PDS-ALG', 'Management', 'OBSERVED — TEST DATA', 'WF-08-S01-drill-summary-desktop.png'),
    a('Drill-log XLSX (content)', '/api/…/drill-log/xlsx', 'PDS-ALG', 'Management', 'OBSERVED — TEST DATA', 'WF-09-S01-drill-log-xlsx-content.png'),
    a('Report Builder', '/reports/:id', 'PDS-RPT', 'Management', 'OBSERVED — TEST DATA', 'WF-09-S04-report-builder-desktop.png'),
    a('Project reports', '/projects/:id/reports', 'PDS-RPT', 'Management', 'OBSERVED', 'WF-09-S03-project-reports-desktop.png'),
  ] },
  { title: 'Daily activity', entries: [
    a('DAS list', '/daily-activity', 'PDS-DAS', 'Supervisor', 'OBSERVED', 'WF-10-S01-das-list-desktop.png'),
    a('New DAS sheet', '/daily-activity', 'PDS-DAS', 'Supervisor', 'OBSERVED — TEST DATA', 'WF-10-S02-das-new-sheet-desktop.png'),
  ] },
  { title: 'Safety', entries: [
    a('Incidents', '/incidents', 'PDS-SAF', 'Safety', 'OBSERVED', 'WF-12-S01-incidents-list-desktop.png'),
    a('Near misses', '/near-misses', 'PDS-SAF', 'Safety', 'OBSERVED', 'ATLAS-PDS-SAF-near-misses-desktop.png'),
    a('Site inspections', '/site-inspections', 'PDS-SAF', 'Management', 'OBSERVED', 'ATLAS-PDS-SAF-site-inspections-desktop.png'),
    a('Asset assessments', '/asset-assessments', 'PDS-SAF', 'Management', 'OBSERVED', 'ATLAS-PDS-SAF-asset-assessments-desktop.png'),
    a('JSA fill (mobile)', '/forms/:id', 'PDS-FRM', 'Field', 'OBSERVED — TEST DATA', 'WF-11-S02-jsa-fill-mobile.png'),
    a('Voice report', '__voice__', 'PDS-DSH', 'Field', 'PARTIALLY OBSERVED', 'WF-13-S01-voice-dialog-desktop.png'),
  ] },
  { title: 'Meetings', entries: [
    a('Meetings list', '/meetings', 'PDS-MTG', 'All', 'OBSERVED — TEST DATA', 'WF-14-S01-meetings-list-desktop.png'),
    a('Meeting detail', '/meetings/:id', 'PDS-MTGD', 'All', 'PARTIALLY OBSERVED', 'WF-14-S03-meeting-detail-desktop.png'),
  ] },
  { title: 'Forms', entries: [
    a('Forms gallery', '/forms', 'PDS-FRM', 'All', 'OBSERVED — TEST DATA', 'WF-15-S01-forms-gallery-desktop.png'),
    a('Form Builder', '/form-builder', 'PDS-FB', 'Management', 'OBSERVED', 'WF-15-S02-form-builder-desktop.png'),
    a('Submissions inbox', '/submissions', 'PDS-SUB', 'All', 'OBSERVED', 'WF-15-S04-submissions-desktop.png'),
  ] },
  { title: 'Mapping & survey', entries: [
    a('Site Map', '/projects/:id', 'PDS-PRJD', 'Management', 'PARTIALLY OBSERVED', 'WF-16-S01-site-map-desktop.png', 'No tiles (no LINZ key)'),
    a('Drone surveys', '/projects/:id', 'PDS-PRJD', 'Management', 'OBSERVED — READ ONLY', 'WF-23-S01-surveys-empty-desktop.png', 'Worker blocked'),
  ] },
  { title: 'Administration & integrations', entries: [
    a('Settings — users', '/settings', 'PDS-SET', 'OrgAdmin', 'OBSERVED — TEST DATA', 'WF-18-S01-settings-users-desktop.png'),
    a('Settings — branding', '/settings', 'PDS-SET', 'OrgAdmin', 'PARTIALLY OBSERVED', 'WF-19-S01-branding-desktop.png'),
    a('Asset Register', '/assets', 'PDS-AST', 'Management', 'OBSERVED — TEST DATA', 'WF-17-S01-asset-register-desktop.png'),
    a('Documents (SharePoint)', '/documents', 'PDS-DOC', 'Management', 'OBSERVED — READ ONLY', 'WF-20-S01-documents-desktop.png', 'SharePoint absent'),
    a('Calendar', '/calendar', 'PDS-CAL', 'Management', 'PARTIALLY OBSERVED', 'WF-24-S02-calendar-desktop.png', 'Outlook blocked'),
    a('Notes', '/notes', 'PDS-NTS', 'Field', 'OBSERVED — TEST DATA', 'ATLAS-PDS-NTS-notes-desktop.png'),
    a('Variations', '/variations', 'PDS-VAR', 'Management', 'OBSERVED', 'ATLAS-PDS-VAR-variations-list-desktop.png'),
    a('Profile + PWA', '/profile', 'PDS-PRF', 'Field', 'OBSERVED', 'ATLAS-PDS-PRF-profile-mobile.png'),
    a('Help', '/help', 'PDS-PRF', 'All', 'OBSERVED', 'ATLAS-PDS-PRF-help-desktop.png'),
  ] },
  { title: 'Tenant-specific & legacy', entries: [
    a('TACEDGE brand shell', '/ (host)', 'PDS-MKT', 'Public', 'PARTIALLY OBSERVED', 'WF-01-S06-tacedge-brand-landing-desktop.png', 'Host-fallback brand'),
    a('TACEDGE marketing (geotech)', '/geotech', 'PDS-MKT', 'Public', 'PARTIALLY OBSERVED', 'ATLAS-PDS-MKT-marketing-geotech-desktop.png'),
    a('Jobs (semi-legacy)', '/jobs', 'PDS-JOB', 'Management', 'OBSERVED — READ ONLY', 'ATLAS-PDS-JOB-jobs-desktop.png'),
    a('Sites (semi-legacy)', '/sites', 'PDS-SIT', 'Management', 'OBSERVED — READ ONLY', 'ATLAS-PDS-SIT-sites-desktop.png'),
    a('Not found', '*', '—', 'All', 'OBSERVED', 'ATLAS-not-found-desktop.png'),
    a('LPC port experience', '—', '—', 'LPC', 'BLOCKED', undefined, 'No LPC tenant/domain in local runtime'),
  ] },
];

export const wfClsCount = () => {
  const c: Record<string, number> = {};
  for (const w of workflows) c[w.cls] = (c[w.cls] || 0) + 1;
  return c;
};
