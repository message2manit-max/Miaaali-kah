// The desktop drawing: one SVG per animation. Every pixel is a <rect>; each
// sprite is drawn once in <defs> and each frame is a <g> of the sprites it
// places. All frames stand at the same spot, hidden; one CSS keyframes rule
// with steps(1,end) shows each in its turn (offset by its animation-delay), so
// the app never re-renders per frame, the surface paints one frame at a time,
// and no frame can drift from another. Floaters (z letters, the heart, sparkles) have their
// own stepped keyframes; reduced motion shows one still frame and no floaters.

import type { Palette } from './palette'
import type { Animation, Floater } from './stage'
import { STAGE_H, STAGE_W } from './stage'

/** Each pixel is drawn this many CSS pixels wide. */
export const SCALE = 3
export const SVG_WIDTH = STAGE_W * SCALE
export const SVG_HEIGHT = STAGE_H * SCALE

/** The pixels of a sprite or frame as <rect>s, grouped by color class. */
function rects(grid: readonly string[], dx = 0, dy = 0): string {
  const byLetter = new Map<string, string[]>()
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x]
      if (c === undefined || c === '.' || c === ' ') continue
      const list = byLetter.get(c) ?? []
      list.push(`<rect x="${x + dx}" y="${y + dy}" width="1" height="1"/>`)
      byLetter.set(c, list)
    }
  })
  return [...byLetter].map(([c, list]) => `<g class="${c}">${list.join('')}</g>`).join('')
}

const pct = (t: number, total: number) => `${+((t / total) * 100).toFixed(3)}%`

function floaterCss(f: Floater, i: number, factor: number): string {
  const frames = f.keys
    .map(k => `${pct(k.t, f.periodMs)}{transform:translate(${k.x}px,${k.y}px);opacity:${k.opacity}}`)
    .join('')
  const last = f.keys[f.keys.length - 1]
  const hold = last === undefined
    ? ''
    : `100%{transform:translate(${last.x}px,${last.y}px);opacity:${last.opacity}}`
  // A looping floater starts mid-flight (a negative delay), as the terminal
  // samples it, so it never waits frozen at its first key.
  const delay = f.isLooping ? -((f.periodMs - (f.delayMs % f.periodMs)) % f.periodMs) : f.delayMs
  const count = f.isLooping ? 'infinite' : '1'
  return (
    `@keyframes fl${i}{${frames}${hold}}` +
    `.fl${i}{animation:fl${i} ${Math.round(f.periodMs * factor)}ms step-end ` +
    `${Math.round(delay * factor)}ms ${count} both}`
  )
}

/**
 * The SVG document for one animation in one palette. `factor` stretches every
 * duration (1.5 slow, 1 normal, 0.65 fast).
 */
export function svgFor(anim: Animation, pal: Palette, factor: number, frameMs: number): string {
  const spriteIds = new Map<string, number>()
  const spriteId = (sprite: readonly string[]) => {
    const key = sprite.join('\n')
    let id = spriteIds.get(key)
    if (id === undefined) {
      id = spriteIds.size
      spriteIds.set(key, id)
    }
    return id
  }
  const frameKeys = anim.layers.map(layers =>
    layers.map(l => `<use href="#s${spriteId(l.sprite)}" x="${l.x}" y="${l.y}"/>`).join(''),
  )
  const unique = [...new Set(frameKeys)]
  const idOf = new Map(unique.map((key, i) => [key, i]))
  const n = anim.frames.length
  const frameTime = Math.round(frameMs * factor)

  const used = new Set<string>()
  for (const f of anim.frames) for (const row of f) for (const c of row) used.add(c)
  for (const fl of anim.floaters) for (const row of fl.sprite) for (const c of row) used.add(c)
  used.delete('.')
  used.delete(' ')

  const fills = [...used].map(c => `.${c}{fill:${pal.light[c] ?? '#f0f'}}`).join('')
  const darkFills = Object.entries(pal.dark)
    .filter(([c]) => used.has(c))
    .map(([c, color]) => `.${c}{fill:${color}}`)
    .join('')

  // Frame i shows from i * frameTime for one frameTime. Looping: every frame
  // runs the same cycle, shifted by a negative delay. Once: each frame shows
  // in its slot and the last one stays.
  let frames = '.fr{visibility:hidden}'
  const delays: string[] = []
  if (n === 1) {
    frames = ''
    delays.push('')
  } else if (anim.isLooping) {
    const total = n * frameTime
    frames +=
      `@keyframes show{0%{visibility:visible}${pct(1, n)}{visibility:hidden}100%{visibility:hidden}}` +
      `.fr{animation:show ${total}ms steps(1,end) infinite}`
    for (let i = 0; i < n; i++) delays.push(` style="animation-delay:-${((n - i) % n) * frameTime}ms"`)
  } else {
    frames +=
      '@keyframes show{0%{visibility:visible}100%{visibility:hidden}}' +
      '@keyframes stay{0%,100%{visibility:visible}}' +
      `.fr{animation:show ${frameTime}ms steps(1,end) forwards}.fr.last{animation-name:stay}`
    for (let i = 0; i < n; i++) delays.push(` style="animation-delay:${i * frameTime}ms"`)
  }

  let fade = ''
  if (anim.fade !== undefined) {
    const total = anim.durationMs
    const { startMs, endMs } = anim.fade
    const span = endMs - startMs
    const stops = [0, 1, 2, 3, 4].map(
      i => `${pct(startMs + (span * i) / 4, total)}{opacity:${1 - i / 4}}`,
    )
    fade =
      `@keyframes fade{0%{opacity:1}${stops.join('')}}` +
      `.stage{animation:fade ${Math.round(total * factor)}ms step-end forwards}`
  }

  const css =
    fills +
    `@media (prefers-color-scheme:dark){${darkFills}}` +
    frames +
    fade +
    anim.floaters.map((f, i) => floaterCss(f, i, factor)).join('') +
    '.still{display:none}' +
    '@media (prefers-reduced-motion:reduce){' +
    '.strip,.fx{display:none}.still{display:inline}.stage{animation:none}}'

  const defs =
    [...spriteIds].map(([key, i]) => `<g id="s${i}">${rects(key.split('\n'))}</g>`).join('') +
    unique.map((key, i) => `<g id="f${i}">${key}</g>`).join('')
  const uses = frameKeys
    .map((key, i) => {
      const last = !anim.isLooping && i === n - 1 ? ' last' : ''
      const cls = n === 1 ? '' : ` class="fr${last}"`
      return `<use href="#f${idOf.get(key) ?? 0}"${cls}${delays[i] ?? ''}/>`
    })
    .join('')
  const stillKey = frameKeys[anim.still] ?? frameKeys[0] ?? ''
  const floaters = anim.floaters
    .map((f, i) => `<g class="fl${i}">${rects(f.sprite)}</g>`)
    .join('')

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" ` +
    `viewBox="0 0 ${STAGE_W} ${STAGE_H}" shape-rendering="crispEdges">` +
    `<style>${css}</style>` +
    `<defs>${defs}</defs>` +
    `<g class="stage">` +
    `<g class="strip">${uses}</g>` +
    `<use class="still" href="#f${idOf.get(stillKey) ?? 0}"/>` +
    `<g class="fx">${floaters}</g>` +
    `</g></svg>`
  )
}
