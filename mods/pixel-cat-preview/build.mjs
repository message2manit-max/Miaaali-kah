// Builds preview.html: every animation for every coat, in the light and dark
// themes, with the nightcap, the reduced-motion still, and the terminal's
// half-block drawing played from the very cells the mod sends.
//
//   node --import ./ts-loader.mjs build.mjs
//
// The page carries the mod's own drawing code (hooks/lib and sprites,
// transpiled, wired with an import map) and builds every SVG in the browser,
// so it stays small and always matches the mod.
//
// The desktop draws each Svg isolated, as an image; so does this page (<img>).
// An image cannot be told which theme to use, so the dark and reduced-motion
// columns turn that media query on (`@media all`): the rules shown are the
// SVG's own. verify.mjs checks the real media queries.

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const modRoot = path.join(here, '../pixel-cat')
const require = createRequire(import.meta.url)

function typescript() {
  try {
    return require('typescript')
  } catch {
    return require('/opt/node22/lib/node_modules/typescript')
  }
}

/** Every module the drawing needs, keyed by its path in the mod without extension. */
function modules() {
  const files = [
    ...fs.readdirSync(path.join(modRoot, 'hooks/lib')).map(f => `hooks/lib/${f}`),
    ...fs.readdirSync(path.join(modRoot, 'sprites')).map(f => `sprites/${f}`),
  ].filter(f => f.endsWith('.ts'))
  const ts = typescript()
  const out = {}
  for (const file of files) {
    const id = file.replace(/\.ts$/, '')
    const source = fs.readFileSync(path.join(modRoot, file), 'utf8')
    let js = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText
    js = js.replace(/from '(\.{1,2}\/[^']+)'/g, (_, spec) => {
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(id), spec))
      return `from 'pc:${target}'`
    })
    out[`pc:${id}`] = js
  }
  return out
}

export function buildPage() {
  const imports = Object.fromEntries(
    Object.entries(modules()).map(([id, js]) => [
      id,
      `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`,
    ]),
  )
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pixel Cat Preview</title>
<script type="importmap">${JSON.stringify({ imports })}</script>
<style>
  :root { --ink: #1d1b19; --muted: #6b665f; --line: #e3dfd8; --page: #f6f4ef; --light: #ffffff; --dark: #1f1e1d; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px 16px 48px; background: var(--page); color: var(--ink);
    font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 880px; margin: 0 auto; }
  h1 { font-size: 26px; margin: 0 0 4px; }
  h2 { font: 600 18px/1.3 ui-monospace, "DejaVu Sans Mono", monospace; margin: 32px 0 2px; }
  p { margin: 4px 0 12px; color: var(--muted); }
  code { font-family: ui-monospace, "DejaVu Sans Mono", monospace; font-size: 0.92em; }
  .scroll { overflow-x: auto; }
  table { border-collapse: separate; border-spacing: 4px; }
  th { font-weight: 600; font-size: 12px; color: var(--muted); text-align: left; padding: 0 4px; }
  th[scope=row] { font-family: ui-monospace, "DejaVu Sans Mono", monospace; }
  td { padding: 6px; border-radius: 6px; line-height: 0; border: 1px solid var(--line); }
  td.light { background: var(--light); }
  td.dark { background: var(--dark); border-color: #3a3835; }
  img { display: block; }
  .term-grid { display: flex; flex-wrap: wrap; gap: 12px; }
  figure { margin: 0; }
  figcaption { font: 12px ui-monospace, "DejaVu Sans Mono", monospace; color: var(--muted); margin-top: 4px; }
  pre.term { margin: 0; padding: 8px 10px; background: #1b1b1f; border-radius: 6px;
    font: 14px/1 "DejaVu Sans Mono", ui-monospace, monospace; color: #ddd; }
  nav a { margin-right: 12px; font: 13px ui-monospace, "DejaVu Sans Mono", monospace; color: #8a4b17; }
  button { font: 13px system-ui, sans-serif; margin-left: 8px; }
</style>
</head>
<body>
<main>
<h1>Pixel Cat Preview</h1>
<p>Every animation of the <code>pixel-cat</code> mod for every coat (plus the rare golden cat), each tile the same SVG the desktop app gets: 16×16 sprites on a 32×18 stage, drawn 3× with <code>shape-rendering="crispEdges"</code> and played by CSS <code>steps()</code>.</p>
<nav id="nav"></nav>
<div id="sections" class="scroll"></div>
<section id="terminal"><h2>terminal</h2>
<p>The terminal surface: half blocks (▀ ▄), two pixel rows per text row, frames swapped every 150 ms, decoded from the exact Raster cells the mod sends (tabby, dark terminal).</p>
<div class="term-grid" id="terms"></div>
</section>
</main>
<script type="module">
import { animation, ANIMS, STAGE_W, STAGE_H } from 'pc:hooks/lib/stage'
import { palette, themed, COATS } from 'pc:hooks/lib/palette'
import { svgFor, SVG_WIDTH, SVG_HEIGHT } from 'pc:hooks/lib/svg'
import { cellsFor, gridAt } from 'pc:hooks/lib/raster'
import { FRAME_MS } from 'pc:hooks/lib/mood'

const SKINS = [...COATS, 'golden']
const lookOf = (skin, isNight) => ({ skin, isNight, variants: isNight ? ['yawn', 'yawn'] : ['yawn', 'lick'] })
const svgOf = (id, skin, o = {}) => {
  let s = svgFor(animation(id, lookOf(skin, !!o.isNight)), palette(skin), 1, FRAME_MS)
  if (o.isDark) s = s.replace('@media (prefers-color-scheme:dark){', '@media all{')
  if (o.isReduced) s = s.replace('@media (prefers-reduced-motion:reduce){', '@media all{')
  return s
}
const COLUMNS = [
  { label: 'Light', o: {}, bg: 'light' },
  { label: 'Dark', o: { isDark: true }, bg: 'dark' },
  { label: 'After 11 pm', o: { isNight: true }, bg: 'light' },
  { label: 'Reduced motion', o: { isReduced: true }, bg: 'light' },
  { label: 'Reduced motion, dark', o: { isReduced: true, isDark: true }, bg: 'dark' },
]
const TITLES = {
  sit: 'Thinking, first 10 s: sits, swishes its tail, blinks, with a yawn, ear twitch or paw lick swapped in',
  chase: 'Thinking past 10 s: chases the yarn left and right',
  sleep: 'Extended thinking past 40 s: curled up asleep, z letters float up and fade',
  typing: 'A tool running: at the tiny desk, pawing the keyboard',
  stretch: 'Turn complete: big stretch, a heart pops, the band fades out (plays once)',
  startle: 'Interrupted or error: a startled hop with the ears flat, then it sits back down (plays once)',
}
const url = svg => URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
// Sources are set once the whole page is built, so 180 animated images do not
// slow the building down.
const pending = []
const later = (img, svg) => { pending.push([img, svg]); return img }
const el = (tag, props = {}, kids = []) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n }

document.getElementById('nav').append(...[...ANIMS, 'terminal'].map(id => el('a', { href: '#' + id, textContent: id })))
const sections = document.getElementById('sections')
for (const id of ANIMS) {
  const replay = el('button', { textContent: 'Replay', onclick: () => { draw(); flush() } })
  const table = el('table')
  const draw = () => {
    table.replaceChildren(
      el('thead', {}, [el('tr', {}, [el('th'), ...COLUMNS.map(c => el('th', { scope: 'col', textContent: c.label }))])]),
      el('tbody', {}, SKINS.map(skin => el('tr', {}, [
        el('th', { scope: 'row', textContent: skin }),
        ...COLUMNS.map(c => el('td', { className: c.bg }, [later(el('img', {
          width: SVG_WIDTH, height: SVG_HEIGHT, alt: id + ' ' + skin + ' ' + c.label,
        }), svgOf(id, skin, c.o))]))
      ]))),
    )
  }
  draw()
  const once = id === 'stretch' || id === 'startle'
  sections.append(el('section', { id }, [el('h2', { textContent: id }, once ? [replay] : []), el('p', { textContent: TITLES[id] }), table]))
}

const COLS = STAGE_W, ROWS = STAGE_H / 2
const decode = b64 => { const bin = atob(b64), w = new Uint32Array(bin.length / 4); for (let i = 0; i < w.length; i++) w[i] = (bin.charCodeAt(i*4) | bin.charCodeAt(i*4+1) << 8 | bin.charCodeAt(i*4+2) << 16 | bin.charCodeAt(i*4+3) << 24) >>> 0; return w }
const css = c => c === 0x01000000 ? 'transparent' : '#' + c.toString(16).padStart(6, '0')
const html = b64 => {
  const w = decode(b64); let out = ''
  for (let r = 0; r < ROWS; r++) {
    for (let x = 0; x < COLS; x++) {
      const i = (r * COLS + x) * 3, g = String.fromCodePoint(w[i])
      out += '<span style="color:' + css(w[i+1]) + ';background:' + css(w[i+2]) + '">' + (g === ' ' ? '&nbsp;' : g) + '</span>'
    }
    out += '\\n'
  }
  return out
}
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const terms = document.getElementById('terms')
for (const id of ANIMS) {
  const anim = animation(id, lookOf('tabby', false)), colors = themed(palette('tabby'), true)
  const n = anim.frames.length
  const ticks = Math.max(n, Math.ceil(anim.durationMs / FRAME_MS))
  const frames = Array.from({ length: ticks }, (_, t) =>
    html(cellsFor(gridAt(anim, anim.isLooping ? t % n : Math.min(t, n - 1), t * FRAME_MS, true), colors)))
  const pre = el('pre', { className: 'term', id: 'term-' + id })
  pre.innerHTML = reduce ? html(cellsFor(gridAt(anim, anim.still, 0, false), colors)) : frames[0]
  terms.append(el('figure', {}, [pre, el('figcaption', { textContent: id })]))
  let tick = 0
  if (!reduce) setInterval(() => { tick = anim.isLooping ? (tick + 1) % ticks : Math.min(tick + 1, ticks - 1); pre.innerHTML = frames[tick] }, FRAME_MS)
}
function flush() {
  const imgs = pending.splice(0).map(([img, svg]) => { img.src = url(svg); return img })
  return Promise.all(imgs.map(img => img.decode().catch(() => {})))
}
flush().then(() => { document.body.dataset.ready = 'yes' })
</script>
</body>
</html>
`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = path.join(here, 'preview.html')
  fs.writeFileSync(out, buildPage())
  console.log(`wrote ${out} (${(fs.statSync(out).size / 1e3).toFixed(0)} kB)`)
}
