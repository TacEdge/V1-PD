// Renders the ACTUAL exported drill-log.xlsx cell values as a clean table image,
// for print legibility. This is the real content of the V1 XLSX export
// (LibreOffice headless could not rasterise the file directly in this env).
import { launch } from './capture-lib.mjs';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const rows = JSON.parse(execSync(`python3 -c "
from openpyxl import load_workbook
import json
wb = load_workbook('working/screenshots-raw/export-drill-log.xlsx', data_only=True)
ws = wb['Drill log table']
out=[]
for r in ws.iter_rows(min_row=3, max_row=60, values_only=True):
    cells=r[:9]
    if any(c is not None for c in cells):
        out.append([('' if c is None else (c.strftime('%Y-%m-%d') if hasattr(c,'strftime') else str(c))) for c in cells])
print(json.dumps(out))
"`).toString());

const header = rows[0];
const body = rows.slice(1, 26);
const cell = (v) => `<td>${(v ?? '').toString().replace(/</g, '&lt;')}</td>`;
const th = (v) => `<th>${(v ?? '').toString().replace(/</g, '&lt;')}</th>`;
const gtitle = 'Drill and Grout Log — Riverview Cutting Stabilisation (RVC-2026)';

const htmlDoc = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;font-family:'JetBrains Mono',monospace;background:#fff;padding:28px}
  h2{font-family:Georgia,serif;color:#112411;margin:0 0 4px}
  .sub{color:#646a5a;font-size:12px;margin:0 0 16px}
  table{border-collapse:collapse;font-size:11px;width:100%}
  th{background:#112411;color:#f7f5ec;padding:6px 8px;text-align:left;font-size:9px;letter-spacing:.05em;text-transform:uppercase;border:1px solid #0c1a0c}
  td{border:1px solid #e0ddd0;padding:5px 8px;color:#242a1f}
  tr:nth-child(even) td{background:#f7f5ec}
  .tag{display:inline-block;font-family:Georgia,serif;font-size:10px;color:#646a5a;margin-top:12px}
</style></head><body>
  <h2>${gtitle}</h2>
  <p class="sub">Actual content of the V1 drill-log XLSX export (sheet "Drill log table"), rendered as a table for legibility.</p>
  <table><thead><tr>${header.map(th).join('')}</tr></thead>
  <tbody>${body.map((r) => `<tr>${r.map(cell).join('')}</tr>`).join('')}</tbody></table>
  <p class="tag">Source: GET /api/projects/:id/drill-log/xlsx · openpyxl-built template · 5 sheets (Drill log table, Totals, Anchor Map, Grouting Summary, Drop Down Lists)</p>
</body></html>`;

const browser = await launch();
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 700 });
await page.setContent(htmlDoc, { waitUntil: 'networkidle0' });
const el = await page.$('body');
await el.screenshot({ path: 'working/screenshots-raw/WF-09-S01-drill-log-xlsx-content.png' });
console.log('rendered xlsx content image');
await browser.close();
