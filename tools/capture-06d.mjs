import { launch, newPage, login, shot, goto, apiLogin } from './capture-lib.mjs';
await apiLogin('admin');
const browser = await launch();
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const p = await newPage(browser, 'desktop');
await login(p, 'field');
await goto(p, '/drill', { settle: 2500 });
await (await p.$('[role="combobox"]')).click();
await pause(800);
await p.evaluate(() => { const o=[...document.querySelectorAll('[role="option"]')].find(e=>/Riverview/.test(e.textContent||'')); o?.click(); });
await pause(2500);
// Click a "B" row planned anchor tile (row B, cols 3/4 are planned -> pale)
const opened = await p.evaluate(() => {
  // tiles are small buttons with a number; find those in the B row area
  const tiles = [...document.querySelectorAll('button')].filter(b => /^\d+$/.test(b.textContent.trim()) && b.getBoundingClientRect().width < 60);
  // click the last few (B row planned)
  const t = tiles[tiles.length-1];
  if (t) { t.click(); return t.textContent.trim(); }
  return null;
});
await pause(1800);
await shot(p, 'WF-05-S03-drill-capture-dialog-desktop');
await shot(p, 'WF-05-S03b-drill-capture-dialog-full', { fullPage: true });
console.log('opened tile:', opened);
await p.close();
await browser.close();
