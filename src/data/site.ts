// Shared site metadata — the repository baseline every page displays.
export const BASELINE = {
  siteTitle: 'TACEDGE Ground Engineering — V1 Product Definition',
  classification: 'INTERNAL',
  edition: 'V1.0 · As-built',
  inspectionDate: '2026-07-17',
  v1Repo: 'TACEDGE Geotech',
  v1Branch: 'claude/tacedge-v1-product-definition-bxrl5e',
  v1Sha: '975a2ea352f1e1ab260c622a66ab59291d8b81b1',
  v1ShaShort: '975a2ea',
  v1CommitDate: '2026-07-05',
  pdRepo: 'tacedge-v1-PD',
  pdBranch: 'claude/tacedge-v1-product-definition-bxrl5e',
  appName: 'RockControl',
  confidenceStatement:
    'Static-inspection baseline. The V1 application was not run during this inspection; ' +
    'runtime behaviour is classified INFERRED or UNVERIFIED throughout.',
};

export const SECTIONS = [
  { num: '00', slug: 'read-first', title: 'Read First' },
  { num: '01', slug: 'executive-summary', title: 'Executive Summary' },
  { num: '02', slug: 'product-brief', title: 'Product Brief' },
  { num: '03', slug: 'capability-register', title: 'Capability Register' },
  { num: '04', slug: 'functional-architecture', title: 'Functional Architecture' },
  { num: '05', slug: 'page-definitions', title: 'Page Definition Sheets' },
  { num: '06', slug: 'design-system', title: 'As-Built Design System' },
  { num: '07', slug: 'technical-architecture', title: 'Technical & Data Architecture' },
  { num: '08', slug: 'v1-v2-orientation', title: 'V1 → V2 Orientation' },
  { num: '09', slug: 'open-questions', title: 'Open Questions' },
  { num: '10', slug: 'appendices', title: 'Appendices' },
] as const;
