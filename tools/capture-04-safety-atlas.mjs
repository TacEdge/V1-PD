// Batch 3: safety & supporting workflows (WF-11..16), admin (WF-17..21),
// plus the remaining Screen Atlas routes.
import { launch, newPage, login, shot, goto, clickText, apiLogin, api } from './capture-lib.mjs';

const admin = await apiLogin('admin');
const project = (await api(admin, 'GET', '/api/projects')).json[0];
const templates = (await api(admin, 'GET', '/api/form-templates')).json;
const jsa = templates.find((t) => t.name.includes('JSA'));
const incident = templates.find((t) => t.type === 'incident-report');

const browser = await launch();
const fails = [];
const step = async (name, fn) => {
  try { await fn(); } catch (e) { fails.push(name); console.log('  ✗', name, e.message); }
};
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Forms & submissions (WF-15) ----------
{
  const p = await newPage(browser, 'desktop');
  await login(p, 'admin');
  await step('forms gallery', async () => { await goto(p, '/forms', { settle: 1500 }); await shot(p, 'WF-15-S01-forms-gallery-desktop'); });
  await step('form builder', async () => { await goto(p, '/form-builder', { settle: 1800 }); await shot(p, 'WF-15-S02-form-builder-desktop'); });
  await step('submissions', async () => { await goto(p, '/submissions', { settle: 1500 }); await shot(p, 'WF-15-S04-submissions-desktop'); });
  await p.close();
}
// Mobile form fill (WF-11 / WF-15)
{
  const m = await newPage(browser, 'mobile');
  await login(m, 'field');
  await step('jsa fill mobile', async () => {
    if (!jsa) throw new Error('no JSA template');
    await goto(m, `/forms/${jsa.id}`, { settle: 1800 });
    await shot(m, 'WF-11-S02-jsa-fill-mobile');
  });
  await step('incident fill mobile', async () => {
    if (!incident) throw new Error('no incident template');
    await goto(m, `/forms/${incident.id}`, { settle: 1800 });
    await shot(m, 'WF-12-S02-incident-fill-mobile');
  });
  await m.close();
}

// ---------- Safety lists (WF-12) ----------
{
  const p = await newPage(browser, 'desktop');
  await login(p, 'admin');
  for (const [route, name] of [
    ['/incidents', 'WF-12-S01-incidents-list-desktop'],
    ['/near-misses', 'ATLAS-PDS-SAF-near-misses-desktop'],
    ['/site-inspections', 'ATLAS-PDS-SAF-site-inspections-desktop'],
    ['/asset-assessments', 'ATLAS-PDS-SAF-asset-assessments-desktop'],
  ]) {
    await step(name, async () => { await goto(p, route, { settle: 1300 }); await shot(p, name); });
  }
  await p.close();
}

// ---------- Meetings (WF-14) ----------
{
  const p = await newPage(browser, 'desktop');
  await login(p, 'super');
  await step('meetings list', async () => { await goto(p, '/meetings', { settle: 1600 }); await shot(p, 'WF-14-S01-meetings-list-desktop'); });
  await step('meeting detail', async () => {
    const meetings = (await api(admin, 'GET', '/api/safety-meetings')).json;
    const mid = (Array.isArray(meetings) ? meetings : meetings.meetings || [])[0]?.id;
    if (!mid) throw new Error('no meeting');
    await goto(p, `/meetings/${mid}`, { settle: 2000 });
    await shot(p, 'WF-14-S03-meeting-detail-desktop');
  });
  await p.close();
}

// ---------- Voice dialog (WF-13) ----------
{
  const m = await newPage(browser, 'mobile');
  await login(m, 'field');
  await step('voice report dialog', async () => {
    await goto(m, '/', { settle: 1200 });
    // bottom-nav Voice button
    await m.evaluate(() => {
      const el = [...document.querySelectorAll('button,a,div')].find((e) => e.textContent?.trim() === 'Voice');
      el?.click();
    });
    await pause(1500);
    await shot(m, 'WF-13-S01-voice-dialog-mobile');
  });
  await m.close();
}

// ---------- Admin (WF-17..21) ----------
{
  const p = await newPage(browser, 'desktop');
  await login(p, 'admin');
  await step('assets', async () => { await goto(p, '/assets', { settle: 1500 }); await shot(p, 'WF-17-S01-asset-register-desktop'); });
  await step('settings/users', async () => { await goto(p, '/settings', { settle: 1800 }); await shot(p, 'WF-18-S01-settings-users-desktop'); });
  await step('settings tabs', async () => {
    // Try to open role-permissions and branding tabs by text
    for (const [label, name] of [['Roles', 'WF-18-S02-role-permissions-desktop'], ['Branding', 'WF-19-S01-branding-desktop']]) {
      try { await clickText(p, 'button,[role="tab"],a', label); await pause(1200); await shot(p, name); } catch { /* tab may differ */ }
    }
  });
  await step('documents (blocked)', async () => { await goto(p, '/documents', { settle: 1600 }); await shot(p, 'WF-20-S01-documents-desktop'); });
  await step('calendar', async () => { await goto(p, '/calendar', { settle: 1600 }); await shot(p, 'WF-24-S02-calendar-desktop'); });
  await p.close();
}

// ---------- Atlas leftovers ----------
{
  const p = await newPage(browser, 'desktop');
  await login(p, 'admin');
  for (const [route, name] of [
    ['/jobs', 'ATLAS-PDS-JOB-jobs-desktop'],
    ['/sites', 'ATLAS-PDS-SIT-sites-desktop'],
    ['/notes', 'ATLAS-PDS-NTS-notes-desktop'],
    ['/variations', 'ATLAS-PDS-VAR-variations-list-desktop'],
    ['/nonexistent-xyz', 'ATLAS-not-found-desktop'],
    ['/help', 'ATLAS-PDS-PRF-help-desktop'],
  ]) {
    await step(name, async () => { await goto(p, route, { settle: 1200 }); await shot(p, name); });
  }
  await p.close();
}
{
  const m = await newPage(browser, 'mobile');
  await login(m, 'field');
  await step('profile mobile', async () => { await goto(m, '/profile', { settle: 1400 }); await shot(m, 'ATLAS-PDS-PRF-profile-mobile'); });
  await step('mobile sidebar drawer', async () => {
    await goto(m, '/', { settle: 1000 });
    await m.evaluate(() => {
      const el = [...document.querySelectorAll('button')].find((b) => b.querySelector('svg') && /menu/i.test(b.getAttribute('aria-label') || b.className || ''));
      el?.click();
    });
    await pause(900);
    await shot(m, 'WF-01-S03b-mobile-drawer');
  });
  await m.close();
}

await browser.close();
console.log(fails.length ? `FAILURES: ${fails.join(', ')}` : 'batch 3 complete');
