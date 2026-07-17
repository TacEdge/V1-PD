// Batch 4: interaction states — drill capture dialog with inputs, DAS filled,
// test detail, form validation, empty/loading. Local runtime only.
import { launch, newPage, login, shot, goto, clickText, apiLogin, api } from './capture-lib.mjs';
const admin = await apiLogin('admin');
const project = (await api(admin, 'GET', '/api/projects')).json[0];
const browser = await launch();
const fails = [];
const step = async (name, fn) => { try { await fn(); } catch (e) { fails.push(name); console.log('  ✗', name, e.message); } };
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// Drill capture: open a planned anchor from the grid on desktop for legibility
{
  const p = await newPage(browser, 'desktop');
  await login(p, 'field');
  await step('drill grid + open planned', async () => {
    await goto(p, '/drill', { settle: 2500 });
    // click a planned anchor (B3/B4) to open the capture dialog
    const opened = await p.evaluate(() => {
      const els = [...document.querySelectorAll('button,[role="button"],td,div,span')];
      const el = els.find((e) => e.childElementCount === 0 && ['B3', 'B4'].includes(e.textContent?.trim()));
      if (el) { el.click(); return true; }
      return false;
    });
    await pause(1600);
    await shot(p, 'WF-05-S03-drill-capture-dialog-desktop');
  });
  await step('drill dialog full', async () => {
    await shot(p, 'WF-05-S03b-drill-capture-dialog-full', { fullPage: true });
  });
  await p.close();
}

// Test detail: click the document icon on a test row
{
  const p = await newPage(browser, 'desktop');
  await login(p, 'pm');
  await step('test detail view', async () => {
    await goto(p, '/anchor-testing', { settle: 2200 });
    await p.evaluate(() => {
      const row = [...document.querySelectorAll('tr,div')].find((e) => /A6|A1/.test(e.textContent || '') && e.querySelector('button,a,svg'));
      const btn = row?.querySelector('button, a');
      btn?.click();
    });
    await pause(1600);
    await shot(p, 'WF-07-S02b-test-detail-open-desktop', { fullPage: true });
  });
  await p.close();
}

// DAS filled state: create a sheet via API then screenshot the list populated
{
  const p = await newPage(browser, 'desktop');
  await login(p, 'super');
  await step('das populated list', async () => {
    // Seed a DAS sheet through the form API if empty
    const sheets = (await api(admin, 'GET', '/api/daily-activity-sheets')).json;
    const arr = Array.isArray(sheets) ? sheets : sheets.forms || [];
    if (!arr.length) {
      await api(admin, 'POST', '/api/daily-activity-sheets', {
        projectId: project.id,
        formData: {
          site: 'Riverview Cutting', date: new Date().toISOString().slice(0, 10), shift: 'Day',
          weather: 'Fine, light wind', completedBy: 'Sam Keller',
          staff: [
            { name: 'Frankie Tane', role: 'Driller', start: '07:00', finish: '16:30', worked: 8.5, total: 8.5 },
            { name: 'Rangi Broome', role: 'Offsider', start: '07:00', finish: '16:30', worked: 8.5, total: 8.5 },
          ],
          plant: [{ name: 'Drill rig — DR-01', rego: 'FIC123', workingHrs: 7, unit: 'Day' }],
        },
      });
    }
    await goto(p, '/daily-activity', { settle: 1800 });
    await shot(p, 'WF-10-S01b-das-list-populated-desktop');
  });
  await p.close();
}

// Validation state: submit an empty incident form
{
  const m = await newPage(browser, 'mobile');
  await login(m, 'field');
  await step('form validation', async () => {
    const templates = (await api(admin, 'GET', '/api/form-templates')).json;
    const inc = templates.find((t) => t.type === 'incident-report');
    await goto(m, `/forms/${inc.id}`, { settle: 1600 });
    // try to submit without filling
    await m.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => /submit|save|send/i.test(b.textContent || ''));
      btn?.click();
    });
    await pause(1000);
    await shot(m, 'WF-12-S02b-incident-validation-mobile');
  });
  await m.close();
}

// Viewer role restricted dashboard
{
  const p = await newPage(browser, 'desktop');
  await login(p, 'viewer');
  await step('viewer dashboard', async () => { await goto(p, '/', { settle: 1500 }); await shot(p, 'WF-01-S04b-dashboard-viewer-desktop'); });
  await p.close();
}

await browser.close();
console.log(fails.length ? `FAILURES: ${fails.join(', ')}` : 'batch 4 complete');
