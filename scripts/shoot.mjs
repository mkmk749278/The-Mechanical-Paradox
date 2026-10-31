// Shoot an SVG or HTML file to PNG/JPG with the pre-installed Playwright Chromium (PLAYBOOK §15).
// Usage: node scripts/shoot.mjs IN.(svg|html) OUT.(png|jpg) WIDTH HEIGHT [deviceScale]
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright'); // pre-installed in the cloud image (resolved globally)
import {resolve} from 'node:path';
const [input, out, w, h, dpr = '1'] = process.argv.slice(2);
if (!input || !out || !w || !h) { console.error('usage: shoot.mjs IN OUT W H [dpr]'); process.exit(2); }
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: +w, height: +h}, deviceScaleFactor: +dpr});
await page.goto('file://' + resolve(input));
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.waitForTimeout(150);
await page.screenshot({path: out, type: out.endsWith('.jpg') ? 'jpeg' : 'png', quality: out.endsWith('.jpg') ? 92 : undefined,
  clip: {x: 0, y: 0, width: +w, height: +h}});
await browser.close();
console.log('shot', out);
