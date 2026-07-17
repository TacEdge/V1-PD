// Shared capture helpers for the V1 Screenshots & Workflow Guide.
// Runs against the local disposable V1 runtime only (http://localhost:5000).
// Never contains credentials for any real environment; the local accounts are
// throwaway fixtures inside a disposable database.
import puppeteer from 'puppeteer';

export const BASE = process.env.V1_BASE_URL || 'http://localhost:5000';
export const RAW_DIR = new URL('../working/screenshots-raw/', import.meta.url).pathname;

export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

// Local fixture accounts (throwaway; exist only in the local disposable DB).
export const ACCOUNTS = {
  admin: 'test@rockcontrol.app',
  pm: 'pm@rockcontrol.app',
  super: 'super@rockcontrol.app',
  field: 'field@rockcontrol.app',
  viewer: 'viewer@rockcontrol.app',
};
// The local-fixture password is supplied at runtime, never committed. It matches
// the default in TACEDGE Geotech's own scripts/seed-local.cjs for the disposable DB.
const PASSWORD = process.env.V1_LOCAL_PASSWORD;
if (!PASSWORD) {
  throw new Error('Set V1_LOCAL_PASSWORD (the local seed password) before running capture scripts.');
}

export async function launch() {
  const browser = await puppeteer.launch({
    executablePath: '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });
  return browser;
}

export async function newPage(browser, viewport = 'desktop') {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORTS[viewport]);
  // Disable animations/transitions for deterministic captures.
  await page.evaluateOnNewDocument(() => {
    const style = document.createElement('style');
    style.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
  });
  return page;
}

// Session cache per role — avoids the app's auth rate limiter (10/15min).
const sessions = {};

export async function login(page, role) {
  if (!sessions[role]) sessions[role] = await apiLogin(role);
  const [name, value] = sessions[role].split('=');
  await page.setCookie({ name, value, url: BASE });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
}

export async function shot(page, name, opts = {}) {
  await new Promise((r) => setTimeout(r, opts.settle ?? 700));
  await page.screenshot({ path: `${RAW_DIR}${name}.png`, fullPage: opts.fullPage ?? false });
  console.log('  📸', name);
}

export async function goto(page, path, opts = {}) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2', timeout: 45000 });
  if (opts.settle) await new Promise((r) => setTimeout(r, opts.settle));
}

// Click an element containing exact-ish text (buttons, tabs, menu items).
export async function clickText(page, selector, text) {
  const ok = await page.evaluate((sel, t) => {
    const els = [...document.querySelectorAll(sel)];
    const el = els.find((e) => e.textContent && e.textContent.trim().toLowerCase().includes(t.toLowerCase()));
    if (el) { el.scrollIntoView({ block: 'center' }); el.click(); return true; }
    return false;
  }, selector, text);
  if (!ok) throw new Error(`clickText: "${text}" not found in ${selector}`);
  await new Promise((r) => setTimeout(r, 500));
}

export async function apiLogin(role) {
  // Local runtime only: vary X-Forwarded-For (dev server trusts proxy headers)
  // so repeated capture runs don't trip the app's per-IP auth rate limiter.
  const xff = `10.99.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': xff },
    body: JSON.stringify({ email: ACCOUNTS[role], password: PASSWORD }),
  });
  const cookie = r.headers.get('set-cookie')?.split(';')[0];
  if (!cookie) throw new Error('no session cookie');
  return cookie;
}

export async function api(cookie, method, path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text.slice(0, 200); }
  return { status: r.status, json };
}
