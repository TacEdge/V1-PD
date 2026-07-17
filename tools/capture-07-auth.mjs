// Re-capture public auth pages in a CLEAN context (no cookies) so they render
// the real unauthenticated screens, not NotFound.
import puppeteer from 'puppeteer';
const b = await puppeteer.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--disable-setuid-sandbox']});
const RAW='/home/user/V1-PD/working/screenshots-raw/';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function clean(){ const ctx = await b.createBrowserContext(); const p = await ctx.newPage(); await p.setViewport({width:1440,height:900}); return {ctx,p}; }
for (const [route,name] of [
  ['/login','WF-01-S01-login-desktop'],
  ['/register','ATLAS-PDS-AUTH-register-desktop'],
  ['/forgot-password','ATLAS-PDS-AUTH-forgot-password-desktop'],
  ['/request-access','ATLAS-PDS-AUTH-request-access-desktop'],
]) {
  const {ctx,p} = await clean();
  await p.goto('http://localhost:5000'+route,{waitUntil:'networkidle2',timeout:45000});
  await pause(1200);
  await p.screenshot({path:RAW+name+'.png'});
  console.log('📸',name);
  await ctx.close();
}
await b.close(); console.log('auth recapture done');
