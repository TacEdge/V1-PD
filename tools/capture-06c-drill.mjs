import { launch, newPage, login, shot, goto, apiLogin } from './capture-lib.mjs';
await apiLogin('admin');
const browser = await launch();
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const p = await newPage(browser, 'desktop');
await login(p, 'field');
await goto(p, '/drill', { settle: 2500 });
// Radix Select trigger has role="combobox"
const trigger = await p.$('[role="combobox"]');
await trigger.click();
await pause(900);
// Radix options are role="option" in a portal
await p.evaluate(() => {
  const opt = [...document.querySelectorAll('[role="option"]')].find((e) => /Riverview/.test(e.textContent || ''));
  opt?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  opt?.click();
});
await pause(2500);
await shot(p, 'WF-04-S01b-drill-grid-selected-desktop');
await shot(p, 'WF-04-S01b-drill-grid-selected-full', { fullPage: true });
const opened = await p.evaluate(() => {
  const els = [...document.querySelectorAll('button,[role="button"],td,div,span')];
  const el = els.find((e) => e.childElementCount === 0 && ['B3', 'B4', 'A8', 'B1', 'A7'].includes(e.textContent?.trim()));
  if (el) { el.scrollIntoView({ block: 'center' }); el.click(); return el.textContent.trim(); }
  return null;
});
await pause(1800);
await shot(p, 'WF-05-S03-drill-capture-dialog-desktop');
await shot(p, 'WF-05-S03b-drill-capture-dialog-full', { fullPage: true });
console.log('opened:', opened);
await p.close();
await browser.close();
console.log('done');
