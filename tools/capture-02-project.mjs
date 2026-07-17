// Batch 1b: project detail tabs (direct URL), WF-02/03/16/23/09 project-side shots.
import { launch, newPage, login, shot, goto, clickText, apiLogin, api } from './capture-lib.mjs';

const admin = await apiLogin('admin');
const project = (await api(admin, 'GET', '/api/projects')).json[0];
const PID = project.id;
console.log('project', PID);

const browser = await launch();
const fails = [];
const step = async (name, fn) => {
  try { await fn(); } catch (e) { fails.push(name); console.log('  ✗', name, e.message); }
};

const page = await newPage(browser, 'desktop');
await login(page, 'admin');
await step('project overview', async () => {
  await goto(page, `/projects/${PID}`, { settle: 2000 });
  await shot(page, 'WF-02-S02-project-overview-desktop');
});
const tab = async (id, name, settle = 1600) => {
  await page.click(`[data-testid="tab-${id}"]`);
  await new Promise((r) => setTimeout(r, settle));
  await shot(page, name);
};
await step('specifications', () => tab('specifications', 'WF-02-S03-specifications-desktop'));
await step('anchor plan', () => tab('design', 'WF-03-S01-anchor-plan-desktop', 2200));
await step('site map', () => tab('site-map', 'WF-16-S01-site-map-desktop', 3000));
await step('das specs', () => tab('das-specs', 'WF-10-S00-project-das-specs-desktop'));
await step('records — meetings', () => tab('records', 'WF-02-S07-records-meetings-desktop'));
await step('records — documents', async () => {
  await clickText(page, '[role="tab"]', 'Documents');
  await new Promise((r) => setTimeout(r, 1200));
  await shot(page, 'WF-02-S08-project-documents-desktop');
});
await step('records — variations', async () => {
  await clickText(page, '[role="tab"]', 'Variations');
  await new Promise((r) => setTimeout(r, 1200));
  await shot(page, 'ATLAS-PDS-VAR-project-variations-desktop');
});
await step('surveys', () => tab('surveys', 'WF-23-S01-surveys-empty-desktop', 2200));
await step('reports', () => tab('reports', 'WF-09-S03-project-reports-desktop'));
await step('job brief', () => tab('job-brief', 'WF-03-S03-job-brief-blocked-desktop'));

await page.close();
await browser.close();
console.log(fails.length ? `FAILURES: ${fails.join(', ')}` : 'batch 1b complete');
