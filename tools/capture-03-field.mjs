// Batch 2: WF-04/05/06 field capture (mobile + desktop), WF-08 Drill Summary,
// WF-07 testing, WF-09 exports, WF-10 DAS.
import { launch, newPage, login, shot, goto, clickText, apiLogin, api, RAW_DIR } from './capture-lib.mjs';
import fs from 'node:fs';

const admin = await apiLogin('admin');
const project = (await api(admin, 'GET', '/api/projects')).json[0];
const PID = project.id;

const browser = await launch();
const fails = [];
const step = async (name, fn) => {
  try { await fn(); } catch (e) { fails.push(name); console.log('  ✗', name, e.message); }
};
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- WF-04/05: drill capture, mobile (FieldTech) ----------
{
  const m = await newPage(browser, 'mobile');
  await login(m, 'field');
  await step('drill mobile grid', async () => {
    await goto(m, '/drill', { settle: 2200 });
    await shot(m, 'WF-04-S01-drill-grid-mobile');
  });
  await step('open planned anchor B3', async () => {
    await m.evaluate(() => {
      const el = [...document.querySelectorAll('button,div,td,span')].filter((e) => e.childElementCount === 0 && e.textContent?.trim() === 'B3').pop();
      el?.click();
    });
    await pause(1400);
    await shot(m, 'WF-05-S02-drill-dialog-planned-mobile');
  });
  await m.close();
}

// ---------- WF-05 desktop: drill grid + quick drill ----------
{
  const d = await newPage(browser, 'desktop');
  await login(d, 'field');
  await step('drill desktop grid', async () => {
    await goto(d, '/drill', { settle: 2200 });
    await shot(d, 'WF-05-S05-drill-grid-desktop');
  });
  await step('quick drill mode', async () => {
    const btn = await d.$('[data-testid="button-switch-quick-drill"], [data-testid="button-quick-drill"]');
    if (btn) { await btn.click(); await pause(1500); await shot(d, 'WF-05-S06-quick-drill-desktop'); }
    else throw new Error('quick drill button not found');
  });
  await d.close();
}

// ---------- WF-08: Drill Summary (PM, desktop) ----------
{
  const p = await newPage(browser, 'desktop');
  await login(p, 'pm');
  await step('drill summary', async () => {
    await goto(p, '/anchor-logs', { settle: 2200 });
    await shot(p, 'WF-08-S01-drill-summary-desktop');
  });
  await step('open log row', async () => {
    const row = await p.$('[data-testid^="anchor-row-"]');
    if (!row) throw new Error('no anchor rows');
    await row.click();
    await pause(1500);
    await shot(p, 'WF-08-S03-log-detail-dialog-desktop');
    await p.keyboard.press('Escape');
    await pause(600);
  });
  await step('email dialog (not sent)', async () => {
    await clickText(p, 'button', 'Email');
    await pause(1200);
    await shot(p, 'WF-09-S02-email-logs-dialog-desktop');
    await p.keyboard.press('Escape');
    await pause(500);
  });
  await p.close();
}

// ---------- WF-07: anchor testing ----------
{
  const p = await newPage(browser, 'desktop');
  await login(p, 'pm');
  await step('anchor testing list', async () => {
    await goto(p, '/anchor-testing', { settle: 2200 });
    await shot(p, 'WF-07-S01-anchor-testing-list-desktop');
  });
  await step('open test A1', async () => {
    await p.evaluate(() => {
      const el = [...document.querySelectorAll('tr,button,div')].find((e) => e.textContent?.includes('A1') && e.textContent.length < 400);
      el?.click();
    });
    await pause(1600);
    await shot(p, 'WF-07-S02-test-detail-desktop');
  });
  await p.close();
}

// ---------- WF-09: report builder ----------
{
  const p = await newPage(browser, 'desktop');
  await login(p, 'pm');
  await step('reports list', async () => {
    await goto(p, `/projects/${PID}/reports`, { settle: 1800 });
    await shot(p, 'WF-09-S03b-reports-list-desktop');
  });
  await step('open report builder', async () => {
    const reports = await api(admin, 'GET', `/api/projects/${PID}/reports`);
    const rid = reports.json?.[0]?.id;
    if (!rid) throw new Error('no seeded report');
    await goto(p, `/reports/${rid}`, { settle: 2600 });
    await shot(p, 'WF-09-S04-report-builder-desktop');
    await shot(p, 'WF-09-S04b-report-builder-full-desktop', { fullPage: true });
  });
  await p.close();
}

// ---------- WF-10: DAS ----------
{
  const p = await newPage(browser, 'desktop');
  await login(p, 'super');
  await step('das list', async () => {
    await goto(p, '/daily-activity', { settle: 2000 });
    await shot(p, 'WF-10-S01-das-list-desktop');
  });
  await step('new das sheet', async () => {
    await clickText(p, 'button', 'New');
    await pause(1600);
    await shot(p, 'WF-10-S02-das-new-sheet-desktop');
  });
  await p.close();
}

// ---------- Exports via API (files for the guide) ----------
await step('xlsx + pdf exports', async () => {
  const dl = async (path, out) => {
    const r = await fetch(`http://localhost:5000${path}`, { headers: { Cookie: admin } });
    if (!r.ok) throw new Error(`${path} -> ${r.status}`);
    fs.writeFileSync(`${RAW_DIR}${out}`, Buffer.from(await r.arrayBuffer()));
    console.log('  ⬇', out, fs.statSync(`${RAW_DIR}${out}`).size, 'bytes');
  };
  await dl(`/api/projects/${PID}/drill-log/xlsx`, 'export-drill-log.xlsx');
  const logs = (await api(admin, 'GET', `/api/projects/${PID}/anchor-logs`)).json;
  const tested = logs.find((l) => l.status === 'tested');
  if (tested) await dl(`/api/anchor-logs/${tested.id}/test-result/report-pdf`, 'export-test-report.pdf');
});

await browser.close();
console.log(fails.length ? `FAILURES: ${fails.join(', ')}` : 'batch 2 complete');
