// Record the short to MP4: every frame is rendered deterministically, the sound is rendered offline.
//   node tools/record.mjs [--fps 60] [--out film.mp4] [--audio-only]
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const fps = +arg('--fps', 60);
const out = path.resolve(root, arg('--out', 'the-5.5-family-builds-a-school.mp4'));
const tmp = path.join(root, '.build'); fs.mkdirSync(tmp, { recursive: true });
const wav = path.join(tmp, 'sfx.wav');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await page.goto('file://' + path.join(root, 'index.html'));
await page.evaluate(() => window.STORY.capture(1));
const dur = await page.evaluate(() => window.STORY.duration);
console.log(`duration ${dur.toFixed(2)}s`);
const b64 = await page.evaluate(() => window.STORY.audio(48000));
fs.writeFileSync(wav, Buffer.from(b64, 'base64'));
console.log('wrote', path.relative(root, wav));
if (process.argv.includes('--audio-only')) { await browser.close(); process.exit(0); }
const frames = Math.ceil(dur * fps);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
  '-i', wav,
  '-vf', 'scale=1920:1080:flags=neighbor,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-tune', 'animation', '-profile:v', 'high', '-r', String(fps),
  '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));
const t0 = Date.now();
for (let i = 0; i < frames; i++) {
  const url = await page.evaluate(t => window.STORY.frame(t), (i + 0.5) / fps);
  const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % (fps * 10) === 0) console.log(`frame ${i}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
ff.stdin.end();
await done;
await browser.close();
if (errors.length) console.log('page errors:', errors);
console.log('wrote', path.relative(root, out), (fs.statSync(out).size / 1e6).toFixed(1) + ' MB');
