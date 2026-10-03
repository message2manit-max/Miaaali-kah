// Turn the built index.html into a body fragment for publishing as a claude.ai Artifact
// (the Artifact host adds its own doctype/html/head/body skeleton).
// Usage: node tools/fragment.mjs <in.html> <out.html>
import fs from 'node:fs';
const [, , input = 'index.html', output = '.build/artifact.html'] = process.argv;
const s = fs.readFileSync(input, 'utf8');
let head = s.split('<head>')[1].split('</head>')[0];
head = head.replace(/<meta charset="utf-8">\n?/, '').replace(/<meta name="viewport"[^>]*>\n?/, '');
head = head.replace('html, body { margin: 0; }', 'body { margin: 0; }');
const body = s.split('<body>')[1].split('</body>')[0];
const out = head.trim() + '\n' + body.trim() + '\n';
fs.writeFileSync(output, out);
console.log(`wrote ${output} (${(out.length / 1024).toFixed(0)} KB); <title> in first 8 KB: ${out.slice(0, 8192).includes('<title>')}`);
