// Model sheet: node tools/sheet.mjs '<json poses>' out.png
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const poses = JSON.parse(process.argv[2] || '{}'), out = process.argv[3] || '.shots/sheet.png';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await page.goto('file://' + path.join(root, 'index.html'));
await page.evaluate(() => window.STORY.capture(1));
const url = await page.evaluate(p => window.STORY.sheet(8, p), poses);
fs.mkdirSync(path.dirname(path.join(root, out)), { recursive: true });
fs.writeFileSync(path.join(root, out), Buffer.from(url.split(',')[1], 'base64'));
console.log('wrote', out);
await browser.close();
