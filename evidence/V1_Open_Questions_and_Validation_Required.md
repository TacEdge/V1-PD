# V1 Open Questions and Validation Required

Questions that materially affect understanding of V1 or the V2 scoping decision.
Each was raised only after inspecting the repository; static inspection could not
resolve them. Directed to Mike / Dan unless noted.

## Product intent

1. **What is the intended relationship between projects, sites and jobs?** Three
   grouping units coexist (projects/zones for geotech; sites and jobs from an earlier
   model). Is the long-term model project-centric, with sites/jobs to be retired?
2. **Which incident store is authoritative?** A dedicated `incidents` table exists
   alongside form-based incident reports (`forms.type = 'incident-report'`). Both are
   routed. Which one does the business actually run on?
3. **Was the aviation vertical abandoned permanently**, or does TACEDGE intend to
   revisit it? The module was fully built (0005–0012) then dropped (0055) within about
   five months; its roles, org types and nav config remain.
4. **What was Co-Pilot ("the brain") meant to become?** Trigger-based event streaming
   was built and dropped within weeks (0047–0049 → 0055).

## Customer use

5. **Which tenants are commercially active today**, and at what usage volume?
   Four domains are configured (RockControl, TacEdge, LPC, SteepWorks). The repo cannot
   show live usage.
6. **Is the LPC engagement ongoing?** A large amount of port-specific behaviour
   (bespoke dashboard, marine relabelling, voice agent, webhook secrets) is carried in
   the core codebase.
7. **What is the status of the SteepWorks pilot** ("pilot starts 25 May 2026" appears in
   a CSP comment)? Did it convert?
8. **Is Groundline Civil (the V2 beachhead partner) a V1 user?** No Groundline-specific
   configuration was found in V1.

## User roles

9. **Are ClientViewer accounts actually issued to engineers/clients today?** The role
   exists with read-only capabilities, but no dedicated engineer-facing surface
   (the V2 "engineer view" concept has no V1 equivalent).
10. **Who uses the Subcontractor role**, and how does it differ from FieldTech in
    practice? The capability matrix treats them identically.

## Production behaviour

11. **Was the application verified end-to-end offline in the field?** The IndexedDB
    sync queue exists, but no test covers offline replay, and runtime behaviour is
    UNVERIFIED in this inspection.
12. **Is the point-cloud worker machine deployed?** The worker self-starts on a
    separate machine; nothing in the repo confirms one exists, so the drone
    point-cloud pipeline may be dormant in production.
13. **What are real voice-call completion rates?** The Twilio/ElevenLabs pipeline is
    substantial; only production logs can show whether callers complete reports.
14. **How often do AI extractions (voice forms, test-sheet OCR, anchor-plan import)
    require correction?** Accuracy governs whether these are trusted capabilities or
    assisted drafts.

## Reporting

15. **Are Report Builder reports being issued to clients?** The revision/signatory
    model implies formal issue; production data would confirm.
16. **Which export (XLSX drill log, test PDF, DAS invoice) is the commercially
    load-bearing deliverable** for each tenant?

## Data

17. **How much production data sits in the semi-legacy tables** (sites, jobs,
    take-5-era forms)? This affects any V2 migration.
18. **Are inline data-URL attachments (notes, test photos) materially large?**
    They bloat rows and bypass the storage model.
19. **What backup/recovery arrangements exist beyond Supabase defaults?** No backup
    evidence exists in the repository.

## Security

20. **Are all webhook secrets and `TWILIO_AUTH_TOKEN` set in production?** The
    validators fail open when unset — a misconfigured deploy silently accepts
    unauthenticated webhooks.
21. **Has `attached_assets/` been reviewed for sensitive content?** It contains 107
    files of pasted debug logs and customer documents.
22. **What is the intent of the `@rockcontrol.app` email-verification bypass**
    (server/routes/auth.ts:146)?
23. **Is the single private Supabase bucket ('Storage 1') confirmed private**, and are
    legacy public-URL callers gone?

## Infrastructure

24. **Is one shared 1 GB VM adequate** for current load, including 5-minute AI request
    timeouts? No metrics exist to answer this.
25. **What is the environment story?** No staging environment is evident. How are
    changes verified before production?
26. **Where do secrets live and how are they rotated?** `docs/secret-rotation.md`
    describes a procedure; confirm it reflects practice.

## Technical debt

27. **Is the 500-line rule and hook-extraction rule still policy?** Violations have
    regrown past documented refactors (FacePhotoCanvas 1753 lines; 124 inline
    query/mutation call sites) with suppressed lint rules.
28. **Should the e2e harness be revived?** Playwright config exists but the dependency
    was never declared.

## Customer-specific logic

29. **Which port/LPC behaviours should be treated as product capabilities vs one-off
    customisation** when scoping V2? (Bespoke dashboard, marine copy, port bottom nav,
    LPC voice agent.)
30. **Should the TacEdge marketing site live inside the product SPA** going forward?

## V1-to-V2 scoping implications

31. **Which V1 capabilities are contractually load-bearing for existing customers**
    during any V2 transition (voice intake, DAS invoicing, SharePoint sync)?
32. **Is the V2 "Configure · Capture · Confirm" review model** (submit-for-QA →
    confirmed → engineer visibility) **intended to replace V1's lighter
    status/needsPmReview model?** V1 has no confirmed-only-outward gate today.
33. **Does V2 inherit V1's Supabase/Fly/Express stack** or is the platform choice open?
    This determines how much of V1's repository/service layer is reusable.
34. **Which tenants must migrate to V2, and which can stay on V1?** The multi-tenant
    coupling (port + geotech in one codebase) is the single largest structural
    difference from the V2 single-workspace definition.
