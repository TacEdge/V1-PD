// Focused WF-05 drill capture sequence: project select -> grid -> capture dialog.
import { launch, newPage, login, shot, goto, apiLogin, api } from './capture-lib.mjs';
const admin = await apiLogin('admin');
const project = (await api(admin, 'GET', '/api/projects')).json[0];
const browser = await launch();
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = [];
const step = async (n, fn) => { try { await fn(); } catch (e) { fails.push(n); console.log('  ✗', n, e.message); } };

// Desktop for legibility of the capture dialog
const p = await newPage(browser, 'desktop');
await login(p, 'field');
await step('drill project-select', async () => {
  await goto(p, '/drill', { settle: 2200 });
  await shot(p, 'WF-04-S00-drill-project-select-desktop');
});
await step('select project', async () => {
  // open the select and choose the seeded project
  await p.evaluate(() => {
    const trigger = [...document.querySelectorAll('button,[role="combobox"]')].find((e) => /choose project/i.test(e.textContent || ''));
    trigger?.click();
  });
  await pause(700);
  await p.evaluate((pname) => {
    const opt = [...document.querySelectorAll('[role="option"],li,div')].find((e) => e.textContent?.includes(pname));
    opt?.click();
  }, 'Riverview Cutting');
  await pause(1800);
  await shot(p, 'WF-04-S01b-drill-grid-selected-desktop');
});
await step('open planned anchor', async () => {
  const opened = await p.evaluate(() => {
    const els = [...document.querySelectorAll('button,[role="button"],td,div,span')];
    const el = els.find((e) => e.childElementCount === 0 && ['B3', 'B4', 'A8'].includes(e.textContent?.trim()));
    if (el) { el.click(); return el.textContent.trim(); }
    return null;
  });
  await pause(1600);
  await shot(p, 'WF-05-S03-drill-capture-dialog-desktop');
  await shot(p, 'WF-05-S03b-drill-capture-dialog-full', { fullPage: true });
  console.log('  opened anchor:', opened);
});
await p.close();

// Mobile equivalent (project preselected via localStorage active zone won't persist; select again)
const m = await newPage(browser, 'mobile');
await login(m, 'field');
await step('drill mobile select', async () => {
  await goto(m, '/drill', { settle: 2000 });
  await m.evaluate(() => {
    const t = [...document.querySelectorAll('button,[role="combobox"]')].find((e) => /choose project/i.test(e.textContent || ''));
    t?.click();
  });
  await pause(700);
  await m.evaluate(() => {
    const opt = [...document.querySelectorAll('[role="option"],li,div')].find((e) => e.textContent?.includes('Riverview Cutting'));
    opt?.click();
  });
  await pause(1800);
  await shot(m, 'WF-04-S01-drill-grid-mobile');
});
await m.close();

await browser.close();
console.log(fails.length ? `FAILURES: ${fails.join(', ')}` : 'drill batch complete');
