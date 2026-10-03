// Assemble src/ into a single self-contained index.html (fonts embedded, scripts inlined).
// Usage: node tools/build.mjs [--out path] [--chars path/to/characters.js]
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const out = path.resolve(root, arg('--out', 'index.html'));
const charsFile = path.resolve(root, arg('--chars', 'src/characters.js'));
const read = f => fs.readFileSync(path.resolve(root, f), 'utf8');
const font = (fam, w, file) => `@font-face { font-family: "${fam}"; font-style: normal; font-weight: ${w}; font-display: block; src: url(data:font/woff2;base64,${fs.readFileSync(path.resolve(root, 'src/fonts', file)).toString('base64')}) format("woff2"); }`;
const fonts = [
  '/* Dela Gothic One and M PLUS Rounded 1c (SIL Open Font License), latin subsets, embedded so the titles never fall back. */',
  font('Dela Gothic One', 400, 'DelaGothicOne-400.woff2'),
  font('M PLUS Rounded 1c', 500, 'MPLUSRounded1c-500.woff2'),
  font('M PLUS Rounded 1c', 800, 'MPLUSRounded1c-800.woff2'),
].join('\n');
const sceneDir = path.resolve(root, 'src/scenes');
const scenes = fs.existsSync(sceneDir) ? fs.readdirSync(sceneDir).filter(f => f.endsWith('.js')).sort() : [];
const only = arg('--only', null); // comma list of scene file prefixes for quick tests
const picked = only ? scenes.filter(f => only.split(',').some(p => f.startsWith(p))) : scenes;
const parts = ['src/kit.js'];
if (fs.existsSync(charsFile)) parts.push(path.relative(root, charsFile));
for (const f of picked) parts.push('src/scenes/' + f);
parts.push('src/player.js');
// Scene files get their own function scope so their helper names never collide.
const body = p => p.startsWith('src/scenes/') ? '(function () {\n' + read(p) + '\n})();' : read(p);
const script = '(function () {\n\'use strict\';\n' + parts.map(p => `/* ---- ${p} ---- */\n` + body(p)).join('\n') + '\n})();';
let html = read('src/shell.html');
const notes = fs.existsSync(path.resolve(root, 'src/notes.html')) ? read('src/notes.html') : '';
html = html.replace('/*FONTS*/', () => fonts).replace('<!--NOTES-->', () => notes).replace('/*SCRIPT*/', () => script);
fs.writeFileSync(out, html);
console.log(`built ${path.relative(root, out)}: ${picked.length} scenes, ${(html.length / 1024).toFixed(0)} KB`);
