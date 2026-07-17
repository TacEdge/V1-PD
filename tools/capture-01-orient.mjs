// Batch 1: WF-01 sign-in/orientation, WF-02 project configuration, WF-03 planning,
// plus authentication atlas shots. Local disposable runtime only.
import { launch, newPage, login, shot, goto, clickText, BASE } from './capture-lib.mjs';

const browser = await launch();
const fails = [];
const step = async (name, fn) => {
  try { await fn(); } catch (e) { fails.push(`${name}: ${e.message}`); console.log('  ✗', name, e.message); }
};

// ---------- WF-01 ----------
{
  const page = await newPage(browser, 'desktop');
  await step('login page', async () => {
    await goto(page, '/login', { settle: 800 });
    await shot(page, 'WF-01-S01-login-desktop');
  });
  await step('admin dashboard', async () => {
    await login(page, 'admin');
    await goto(page, '/', { settle: 1200 });
    await shot(page, 'WF-01-S02-dashboard-admin-desktop');
  });
  await step('field dashboard', async () => {
    const p2 = await newPage(browser, 'desktop');
    await login(p2, 'field');
    await goto(p2, '/', { settle: 1200 });
    await shot(p2, 'WF-01-S04-dashboard-field-desktop');
    await p2.close();
  });
  await step('register', async () => {
    const p = await newPage(browser, 'desktop');
    await goto(p, '/register', { settle: 600 });
    await shot(p, 'ATLAS-PDS-AUTH-register-desktop');
    await goto(p, '/forgot-password', { settle: 600 });
    await shot(p, 'ATLAS-PDS-AUTH-forgot-password-desktop');
    await goto(p, '/request-access', { settle: 600 });
    await shot(p, 'ATLAS-PDS-AUTH-request-access-desktop');
    await p.close();
  });
  await page.close();
}
// Mobile: field dashboard + bottom nav + sidebar drawer
{
  const m = await newPage(browser, 'mobile');
  await step('mobile field home', async () => {
    await login(m, 'field');
    await goto(m, '/', { settle: 1200 });
    await shot(m, 'WF-01-S05-dashboard-field-mobile');
  });
  await m.close();
}
// TACEDGE brand fallback via 127.0.0.1
{
  const t = await newPage(browser, 'desktop');
  await step('tacedge brand landing', async () => {
    await t.goto('http://127.0.0.1:5000/', { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1500));
    await shot(t, 'WF-01-S06-tacedge-brand-landing-desktop');
  });
  await step('tacedge marketing geotech', async () => {
    await t.goto('http://127.0.0.1:5000/geotech', { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1200));
    await shot(t, 'ATLAS-PDS-MKT-marketing-geotech-desktop');
  });
  await t.close();
}

// ---------- WF-02 / WF-03 ----------
{
  const page = await newPage(browser, 'desktop');
  await login(page, 'admin');
  let projectUrl = '';
  await step('projects list', async () => {
    await goto(page, '/projects', { settle: 1000 });
    await shot(page, 'WF-02-S01-projects-list-desktop');
  });
  await step('open project', async () => {
    await page.evaluate(() => {
      const el = [...document.querySelectorAll('a,button,[role="link"],div')].find((e) => e.textContent?.includes('Riverview Cutting'));
      el?.click();
    });
    await new Promise((r) => setTimeout(r, 1800));
    projectUrl = page.url();
    await shot(page, 'WF-02-S02-project-overview-desktop');
  });
  const tab = async (id, name, settle = 1400) => {
    await page.click(`[data-testid="tab-${id}"]`);
    await new Promise((r) => setTimeout(r, settle));
    await shot(page, name);
  };
  await step('specifications tab', () => tab('specifications', 'WF-02-S03-specifications-desktop'));
  await step('anchor plan tab', () => tab('design', 'WF-03-S01-anchor-plan-desktop'));
  await step('site map tab', () => tab('site-map', 'WF-16-S01-site-map-desktop', 2500));
  await step('das specs tab', () => tab('das-specs', 'WF-10-S00-project-das-specs-desktop'));
  await step('records tab', () => tab('records', 'WF-02-S07-records-meetings-desktop'));
  await step('records documents', async () => {
    await clickText(page, '[role="tab"],button', 'Documents');
    await new Promise((r) => setTimeout(r, 1200));
    await shot(page, 'WF-02-S08-project-documents-desktop');
  });
  await step('records variations', async () => {
    await clickText(page, '[role="tab"],button', 'Variations');
    await new Promise((r) => setTimeout(r, 1200));
    await shot(page, 'ATLAS-PDS-VAR-project-variations-desktop');
  });
  await step('surveys tab', () => tab('surveys', 'WF-23-S01-surveys-empty-desktop'));
  await step('reports tab', () => tab('reports', 'WF-09-S03-project-reports-desktop'));
  console.log('project url:', projectUrl);
  await page.close();
}

await browser.close();
console.log(fails.length ? `FAILURES:\n${fails.join('\n')}` : 'batch 1 complete, no failures');
