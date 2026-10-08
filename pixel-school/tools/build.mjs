// Assemble src/ into one self-contained page.
//   node tools/build.mjs            -> index.html (full document)
//   node tools/build.mjs --fragment -> .build/artifact.html (no html/head/body tags, for publishing)
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = f => fs.readFileSync(path.join(root, 'src', f), 'utf8');
const parts = ['core.js', 'sprites.js', 'world.js', 'fx.js', 'audio.js', 'story.js', 'player.js'];
const script = '(function () {\n\'use strict\';\n' + parts.map(p => `/* ==== ${p} ==== */\n` + read(p)).join('\n') + '\n})();';
const shell = read('shell.html').replace('/*SCRIPT*/', () => script);
const [head, body] = shell.split('<!--BODY-->');
const fragment = process.argv.includes('--fragment');
let out, html;
if (fragment) {
  out = path.join(root, '.build', 'artifact.html');
  html = head.trim() + '\n' + body.trim() + '\n';
} else {
  out = path.join(root, 'index.html');
  html = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + head.trim() + '\n</head>\n<body>\n' + body.trim() + '\n</body>\n</html>\n';
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`built ${path.relative(root, out)} (${(html.length / 1024).toFixed(0)} KB)`);
