# TACEDGE Ground Engineering — V1 Product Definition

An evidence-based, as-built product definition of TACEDGE Ground Engineering V1
(the production application known internally as RockControl), prepared for the
incoming Interim Development Technical Lead ahead of the V2 technical scoping sprint.

**This is documentation of what exists — not a redesign, a V2 build, or a roadmap.**

## Repository boundary

- **tacedge-v1-PD** (this repository) is the only writable repository.
- **TACEDGE Geotech** was inspected as a **read-only** evidence source at commit
  `975a2ea352f1e1ab260c622a66ab59291d8b81b1` (2026-07-05). No changes were made to it.
- The application was **not run** during inspection; all runtime behaviour is marked
  INFERRED or UNVERIFIED, and no screenshots exist in this package.

## What's here

```
├── src/                  Astro documentation site (sections 00–10 + /print)
│   ├── components/       Layout + section content components
│   ├── data/             Capability register, screen sheets, inventories (TS data)
│   ├── layouts/          Base layout (nav, print footer, search)
│   ├── pages/            One page per section + /print
│   └── styles/           Tokens, global styles, print stylesheet
├── diagrams/             Editable Mermaid sources + render script
├── public/diagrams/      Rendered SVGs (d01–d13)
├── evidence/             Machine-readable registers (CSV/MD)
│   ├── V1_Evidence_Register.csv
│   ├── V1_Route_and_Screen_Inventory.csv
│   ├── V1_Database_Object_Inventory.csv
│   ├── V1_Dependency_Inventory.csv
│   ├── V1_Legacy_and_Dormant_Register.csv
│   ├── V1_Open_Questions_and_Validation_Required.md
│   └── V1_Repository_and_Runtime_Inspection_Notes.md
└── reference/            V2 Product Definition PDF (format reference only)
```

## Commands

```bash
npm install        # once
npm run dev        # local dev server (http://localhost:4321)
npm run build      # static production build into dist/ (+ Pagefind search index)
npm run preview    # serve the production build locally
```

The site is fully static: no database, no backend, deployable to any static host.
It is also an installable PWA (manifest + minimal service worker) — a convenience,
never a dependency.

## Printing to PDF

1. Open `/print` (or use the "Print Product Definition" button on any page).
2. Browser print dialog → A4 portrait → enable background graphics → Save as PDF.
3. The route renders cover, contents and all sections 00–10 in order with a
   dedicated print stylesheet (page breaks, repeated table headers, expanded
   evidence panels, footers with classification marking).

## Editing diagrams

Diagram sources are Mermaid files in `diagrams/*.mmd`. After editing, re-render:

```bash
./diagrams/render.sh   # writes SVGs into public/diagrams/
```

(Requires Chromium; the render script is configured for this environment via
`diagrams/puppeteer-config.json` — adjust `executablePath` for other machines.)

## Trust model

Every material claim carries an evidence classification
(IMPLEMENTED / PARTIAL / DORMANT / INFERRED / UNVERIFIED / NOT IMPLEMENTED / LEGACY)
and a confidence level. Start at section 00 ("Read First") before relying on anything.
