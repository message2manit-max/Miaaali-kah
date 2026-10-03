// Render a free-form test drawing (e.g. a character sheet) with kit.js + a characters file.
// The test file must define:  function sheet(t) { ...draw with the kit... }
// Usage: node tools/sheet.mjs --chars src/characters.js --test path/to/test.js --t 0,1.2 --out .shots/x/sheet
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const chars = path.resolve(root, arg('--chars', 'src/characters.js'));
const test = path.resolve(root, arg('--test'));
const outPrefix = path.resolve(root, arg('--out', '.shots/sheet/sheet'));
fs.mkdirSync(path.dirname(outPrefix), { recursive: true });
const font = (fam, w, file) => `@font-face { font-family: "${fam}"; font-weight: ${w}; src: url(data:font/woff2;base64,${fs.readFileSync(path.join(root, 'src/fonts', file)).toString('base64')}) format("woff2"); }`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${font('Dela Gothic One', 400, 'DelaGothicOne-400.woff2')}${font('M PLUS Rounded 1c', 500, 'MPLUSRounded1c-500.woff2')}${font('M PLUS Rounded 1c', 800, 'MPLUSRounded1c-800.woff2')} body{margin:0;background:#000}</style></head><body><canvas id="cv" width="1280" height="720"></canvas><script>
${fs.readFileSync(path.join(root, 'src/kit.js'), 'utf8')}
${fs.existsSync(chars) ? fs.readFileSync(chars, 'utf8') : ''}
${fs.readFileSync(test, 'utf8')}
window.renderAt = function (t) { ctx = document.getElementById('cv').getContext('2d'); ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha = 1; ctx.clearRect(0,0,W,H); NOW = t; sheet(t); };
</script></body></html>`;
const tmp = path.join(root, '.build', 'sheet-' + path.basename(outPrefix) + '.html');
fs.mkdirSync(path.dirname(tmp), { recursive: true });
fs.writeFileSync(tmp, html);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + tmp);
  await page.evaluate(() => loadFonts());
  for (const t of (arg('--t', '0') || '0').split(',').map(Number)) {
    await page.evaluate(t => window.renderAt(t), t);
    const file = `${outPrefix}-t${t}.png`;
    await (await page.$('#cv')).screenshot({ path: file });
    console.log('wrote', path.relative(root, file));
  }
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await browser.close();
})();
