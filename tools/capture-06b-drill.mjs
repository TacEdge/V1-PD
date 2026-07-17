import { launch, newPage, login, shot, goto, apiLogin, api } from './capture-lib.mjs';
const admin = await apiLogin('admin');
const browser = await launch();
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const p = await newPage(browser, 'desktop');
await login(p, 'field');
await goto(p, '/drill', { settle: 2500 });
// Open the combobox
await p.click('[role="combobox"], button');
await pause(900);
// Click the option by its accessible text using Puppeteer locator
try {
  await p.locator('::-p-text(Riverview Cutting Stabilisation)').click();
} catch {
  // fallback: press ArrowDown + Enter
  await p.keyboard.press('ArrowDown');
  await p.keyboard.press('Enter');
}
await pause(2200);
await shot(p, 'WF-04-S01b-drill-grid-selected-desktop');
await shot(p, 'WF-04-S01b-drill-grid-selected-full', { fullPage: true });

// Open a planned/drilled anchor tile
const opened = await p.evaluate(() => {
  const els = [...document.querySelectorAll('button,[role="button"],td,div,span')];
  const el = els.find((e) => e.childElementCount === 0 && ['B3', 'B4', 'A8', 'B1'].includes(e.textContent?.trim()));
  if (el) { el.click(); return el.textContent.trim(); }
  return null;
});
await pause(1800);
await shot(p, 'WF-05-S03-drill-capture-dialog-desktop');
await shot(p, 'WF-05-S03b-drill-capture-dialog-full', { fullPage: true });
console.log('opened:', opened);
await p.close();
await browser.close();
console.log('done');
