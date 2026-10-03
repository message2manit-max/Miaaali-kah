// The app version: the same routine baked into one self-animating SVG.
// Every distinct sprite (a cat pose, a butterfly flap, a mark) is drawn once
// in <defs>; one <use> per sprite moves and shows it with discrete SMIL.

import { Canvas, NONE, PX_H, TICK_MS, cycleLength, drawGround, stage } from './cat'

export const SVG_W = 64 // scene width in pixels
const CAPTION_H = 5

// Pixel shapes for the marks the terminal draws as characters.
const MARKS: Record<string, string[]> = {
  z: ['##.', '.#.', '.##'],
  Z: ['####', '..#.', '.#..', '####'],
  '?': ['##.', '..#', '.#.', '...', '.#.'],
  '!': ['#', '#', '#', '.', '#'],
}

const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`

/** Draws `cv`'s glyphs as little pixel marks onto its own pixels. */
function inkGlyphs(cv: Canvas) {
  for (const [cell, [cp, fg]] of cv.glyphs) {
    const shape = MARKS[String.fromCharCode(cp)] ?? ['#']
    const x0 = cell % cv.w
    const y0 = Math.floor(cell / cv.w) * 2
    shape.forEach((row, j) => [...row].forEach((ch, i) => ch === '#' && cv.set(x0 + i, y0 + j, fg)))
  }
}

type Crop = { key: string; x: number; y: number; w: number; h: number; px: number[] }

function crop(cv: Canvas): Crop | null {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1
  for (let y = 0; y < PX_H; y++) {
    for (let x = 0; x < cv.w; x++) {
      if (cv.px[y * cv.w + x] === NONE) continue
      x0 = Math.min(x0, x)
      y0 = Math.min(y0, y)
      x1 = Math.max(x1, x)
      y1 = Math.max(y1, y)
    }
  }
  if (x1 < 0) return null
  const w = x1 - x0 + 1
  const h = y1 - y0 + 1
  const px: number[] = []
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) px.push(cv.px[y * cv.w + x]!)
  return { key: `${w}x${h}:${px.join(',')}`, x: x0, y: y0, w, h, px }
}

/** Paths, one per color, of horizontal runs: the compact way to say pixels. */
function paths(px: number[], w: number, dx = 0, dy = 0): string {
  const runs = new Map<number, string>()
  for (let i = 0; i < px.length; ) {
    const c = px[i]!
    const x = i % w
    let n = 1
    while (x + n < w && px[i + n] === c) n++
    if (c !== NONE) runs.set(c, `${runs.get(c) ?? ''}M${x + dx} ${Math.floor(i / w) + dy}h${n}v1h-${n}z`)
    i += n
  }
  return [...runs].map(([c, d]) => `<path fill="${hex(c)}" d="${d}"/>`).join('')
}

/** One discrete SMIL track over the loop: the value from each change point. */
function track(attr: string, points: [number, string][], total: number, dur: string): string {
  if (points.length < 2) return ''
  const keyTimes = points.map(([t]) => +(t / total).toFixed(5)).join(';')
  const values = points.map(([, v]) => v).join(';')
  return `<animate attributeName="${attr}" values="${values}" keyTimes="${keyTimes}" dur="${dur}" calcMode="discrete" repeatCount="indefinite"/>`
}

/** Change points of a per-tick series, dropping repeats. */
function changes(series: string[]): [number, string][] {
  const out: [number, string][] = []
  series.forEach((v, t) => {
    if (out.length === 0 || out[out.length - 1]![1] !== v) out.push([t, v])
  })
  return out
}

let cached: string | undefined

/** The whole routine as one looping SVG; built once, then reused. */
export function catSvg(): string {
  if (cached) return cached
  const w = SVG_W
  const total = cycleLength(w)
  const dur = `${(total * TICK_MS) / 1000}s`

  const sprites = new Map<string, { id: number; crop: Crop; at: (string | null)[] }>()
  const verbs: string[] = []
  for (let t = 0; t < total; t++) {
    const cat = new Canvas(w)
    const fx = new Canvas(w)
    verbs.push(stage(t, w, cat, fx))
    inkGlyphs(fx)
    for (const c of [crop(cat), crop(fx)]) {
      if (!c) continue
      let s = sprites.get(c.key)
      if (!s) sprites.set(c.key, (s = { id: sprites.size, crop: c, at: new Array(total).fill(null) }))
      s.at[t] = `${c.x},${c.y}`
    }
  }

  const ground = new Canvas(w)
  drawGround(ground)
  let defs = ''
  let uses = ''
  for (const { id, crop: c, at } of sprites.values()) {
    defs += `<g id="s${id}">${paths(c.px, c.w)}</g>`
    // Hidden ticks keep the last place, so x and y only change while shown.
    let last = at.find(v => v !== null)!
    const place = at.map(v => (last = v ?? last))
    const [x0, y0] = place[0]!.split(',')
    uses +=
      `<use href="#s${id}" x="${x0}" y="${y0}" visibility="${at[0] ? 'visible' : 'hidden'}">` +
      track('visibility', changes(at.map(v => (v ? 'visible' : 'hidden'))), total, dur) +
      track('x', changes(place.map(v => v.split(',')[0]!)), total, dur) +
      track('y', changes(place.map(v => v.split(',')[1]!)), total, dur) +
      `</use>`
  }

  let captions = ''
  for (const verb of new Set(verbs)) {
    const shown = verbs.map(v => (v === verb ? 'visible' : 'hidden'))
    captions +=
      `<text x="1" y="${PX_H + 3.8}" visibility="${shown[0]}">${verb}…` +
      track('visibility', changes(shown), total, dur) +
      `</text>`
  }

  cached =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${PX_H + CAPTION_H}" shape-rendering="crispEdges">` +
    `<defs>${defs}</defs>` +
    paths(ground.px, w) +
    uses +
    `<g fill="#e8913a" font-family="ui-monospace,Menlo,Consolas,monospace" font-size="3.4" font-weight="700">${captions}</g>` +
    `</svg>`
  return cached
}
