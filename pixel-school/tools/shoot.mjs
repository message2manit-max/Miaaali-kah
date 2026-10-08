// Render chosen moments of the short to PNG for review.
//   node tools/shoot.mjs 5.8 12 30.5 ...      (global seconds)
//   node tools/shoot.mjs --scene walls 0.5 3 ...  (seconds inside a scene)
//   add --k 2 for 1920x1080 frames, --page for a full-page screenshot
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const sceneId = opt('--scene'), k = +(opt('--k') || 2), outDir = path.join(root, '.shots');
const pageShot = args.includes('--page'); if (pageShot) args.splice(args.indexOf('--page'), 1);
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await page.goto('file://' + path.join(root, 'index.html'));
await page.waitForTimeout(300);
if (pageShot) { await page.screenshot({ path: path.join(outDir, 'page.png'), fullPage: true }); console.log('wrote .shots/page.png'); }
const info = await page.evaluate(() => window.STORY && { d: window.STORY.duration, s: window.STORY.scenes });
if (!info) { console.log('STORY missing', errors); process.exit(1); }
console.log('duration', info.d.toFixed(2), info.s.map(s => `${s.id}@${s.start.toFixed(1)}`).join(' '));
await page.evaluate(k => window.STORY.capture(k), k);
const base = sceneId ? info.s.find(s => s.id === sceneId).start : 0;
for (const a of args) {
  const t = base + +a;
  const url = await page.evaluate(t => window.STORY.frame(t), t);
  const f = path.join(outDir, `${sceneId ? sceneId + '-' : ''}${(+a).toFixed(2)}.png`);
  fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote', path.relative(root, f));
}
if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
await browser.close();
