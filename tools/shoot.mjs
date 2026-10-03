// Render frames of the story to PNG for visual review.
// Usage:
//   node tools/shoot.mjs --label me --ids title,dario [--at 0.2,0.6,1] [--t 1.5,4] [--chars src/characters.js] [--only 03,04]
//   node tools/shoot.mjs --label me --all            (every scene at --at fractions)
//   add --hold 1.8 to stay on the scene past its end with a slow-voice factor (use --t 30 etc.)
// Fractions in --at are of each scene's simulated length (1 = last frame). Output: .shots/<label>/<id>-<tag>.png
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const label = arg('--label', 'default');
const out = path.join(root, '.build', label + '.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
const buildArgs = ['tools/build.mjs', '--out', out];
if (arg('--chars')) buildArgs.push('--chars', arg('--chars'));
if (arg('--only')) buildArgs.push('--only', arg('--only'));
execFileSync('node', buildArgs, { cwd: root, stdio: 'inherit' });
const shotDir = path.join(root, '.shots', label);
fs.mkdirSync(shotDir, { recursive: true });
const width = +arg('--width', 1280);
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: width + 40, height: Math.round(width * 9 / 16) + 400 }, deviceScaleFactor: 1, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.goto('file://' + out);
  await page.waitForTimeout(600);
  await page.evaluate(() => window.storyFontsReady);
  const scenes = await page.evaluate(() => window.storyScenes());
  const lens = await page.evaluate(() => window.storySceneLengths());
  console.log('scenes:', scenes.map((s, i) => `${i}:${s.id}(${lens[i]}s)`).join(' '));
  if (process.argv.includes('--total')) console.log('total seconds (no voice):', await page.evaluate(() => window.storyLength()));
  const ids = process.argv.includes('--all') ? scenes.map(s => s.id) : (arg('--ids', '') || '').split(',').filter(Boolean);
  const fr = (arg('--at', '') || '').split(',').filter(Boolean).map(Number);
  const ts = (arg('--t', '') || '').split(',').filter(Boolean).map(Number);
  if (!fr.length && !ts.length) fr.push(0.35, 0.7, 1);
  await page.evaluate(() => { document.getElementById('bigplay').hidden = true; });
  const stage = await page.$('#stage');
  for (const id of ids) {
    const i = scenes.findIndex(s => s.id === id);
    if (i < 0) { console.log('no scene with id', id); continue; }
    const shots = fr.map(f => ['f' + f, Math.max(0.05, lens[i] * f - (f >= 1 ? 0.15 : 0))]).concat(ts.map(t => ['t' + t, t]));
    for (const [tag, t] of shots) {
      const hold = arg('--hold', null);
      if (hold) await page.evaluate(([i, t, r]) => window.storyHold(i, t, r), [i, t, +hold]);
      else await page.evaluate(([i, t]) => window.storyFrame(i, t), [i, t]);
      await page.waitForTimeout(40);
      const file = path.join(shotDir, `${String(i).padStart(2, '0')}-${id}-${tag}.png`);
      await stage.screenshot({ path: file });
      console.log('wrote', path.relative(root, file), `(t=${t.toFixed(2)}s)`);
    }
  }
  if (process.argv.includes('--poster')) { await page.evaluate(() => { document.getElementById('bigplay').hidden = false; }); }
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
  await browser.close();
})();
