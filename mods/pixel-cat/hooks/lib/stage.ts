// The animations: sprites placed on one shared stage, frame by frame, plus
// the "floaters" (z letters, the heart, sparkles) that drift over the frames.
// Both surfaces draw from what this file builds: the desktop as one SVG per
// animation, the terminal as half-block cells.

import * as chase from '../../sprites/chase'
import * as extras from '../../sprites/extras'
import * as lick from '../../sprites/lick'
import * as sit from '../../sprites/sit'
import * as sleep from '../../sprites/sleep'
import * as startle from '../../sprites/startle'
import * as stretch from '../../sprites/stretch'
import * as twitch from '../../sprites/twitch'
import * as typing from '../../sprites/typing'
import * as yawn from '../../sprites/yawn'
import type { Skin } from './palette'
import type { Sprite } from './sprite'
import { flip } from './sprite'

export const STAGE_W = 32
export const STAGE_H = 18
export const BASE_FRAME_MS = 150

export const ANIMS = ['sit', 'chase', 'sleep', 'typing', 'stretch', 'startle'] as const
export type AnimId = (typeof ANIMS)[number]

export const VARIANTS = ['yawn', 'twitch', 'lick'] as const
export type Variant = (typeof VARIANTS)[number]

/** What changes how an animation looks, besides which one it is. */
export type Look = {
  skin: Skin
  /** After 11 pm: the nightcap, and more yawns. */
  isNight: boolean
  /** The two idle moves the sitting loop swaps in. */
  variants: readonly [Variant, Variant]
}

/** A floater's place and opacity from `t` ms into its period until the next key. */
export type Key = { t: number; x: number; y: number; opacity: number }

export type Floater = {
  sprite: Sprite
  keys: readonly Key[]
  periodMs: number
  delayMs: number
  isLooping: boolean
}

/** One sprite as placed in a frame (already mirrored, cap included). */
export type Layer = { sprite: readonly string[]; x: number; y: number }

export type Animation = {
  id: AnimId
  /** What the drawing shows, for a reader that cannot see it. */
  label: string
  /** Stage grids (STAGE_H rows of STAGE_W letters), in play order. */
  frames: readonly (readonly string[])[]
  /** The same frames as the sprites they are made of, bottom first. */
  layers: readonly (readonly Layer[])[]
  isLooping: boolean
  /** The frame that stands for the whole animation under reduced motion. */
  still: number
  floaters: readonly Floater[]
  /** The whole stage fades out over this window of one pass (the finales). */
  fade?: { startMs: number; endMs: number }
  /** How long one pass lasts at normal speed, floaters and fade included. */
  durationMs: number
}

type Cap = 'front' | 'side'
type Placed = { sprite: Sprite; x: number; y: number; isFlipped?: boolean; cap?: Cap }

const EMPTY_ROW = '.'.repeat(STAGE_W)

function paint(grid: string[][], sprite: Sprite, x0: number, y0: number): void {
  sprite.forEach((row, y) => {
    const line = grid[y0 + y]
    if (line === undefined) return
    for (let x = 0; x < row.length; x++) {
      const c = row[x]
      if (c === undefined || c === '.' || c === ' ') continue
      if (x0 + x >= 0 && x0 + x < STAGE_W) line[x0 + x] = c
    }
  })
}

/** Where the ears are ('L' and 'R'), to seat the nightcap on them. */
function ears(sprite: Sprite): { x: number; y: number; isFacingLeft: boolean } | undefined {
  let minX = Infinity
  let minY = Infinity
  let lx = 0
  let rx = 0
  sprite.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x]
      if (c !== 'L' && c !== 'R') continue
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      if (c === 'L') lx = x
      else rx = x
    }
  })
  return minX === Infinity ? undefined : { x: minX, y: minY, isFacingLeft: lx > rx }
}

type Composed = { grid: string[]; layers: Layer[] }

function compose(placed: readonly Placed[], look: Look): Composed {
  const layers: Layer[] = []
  for (const item of placed) {
    const sprite = item.isFlipped ? flip(item.sprite) : item.sprite
    layers.push({ sprite, x: item.x, y: item.y })
    if (look.isNight && item.cap !== undefined) {
      const at = ears(sprite)
      if (at === undefined) continue
      if (item.cap === 'front') {
        layers.push({ sprite: extras.capFront, x: item.x + at.x + extras.CAP_FRONT_AT.x, y: item.y + at.y + extras.CAP_FRONT_AT.y })
      } else if (at.isFacingLeft) {
        const cap = flip(extras.capSide)
        const width = cap[0]?.length ?? 0
        layers.push({ sprite: cap, x: item.x + at.x + 6 - width - extras.CAP_SIDE_AT.x, y: item.y + at.y + extras.CAP_SIDE_AT.y })
      } else {
        layers.push({ sprite: extras.capSide, x: item.x + at.x + extras.CAP_SIDE_AT.x, y: item.y + at.y + extras.CAP_SIDE_AT.y })
      }
    }
  }
  const grid = Array.from({ length: STAGE_H }, () => [...EMPTY_ROW])
  for (const layer of layers) paint(grid, layer.sprite, layer.x, layer.y)
  return { grid: grid.map(row => row.join('')), layers }
}

/** Splits composed frames into the two views an Animation keeps. */
function framesOf(composed: readonly Composed[]): Pick<Animation, 'frames' | 'layers'> {
  return { frames: composed.map(c => c.grid), layers: composed.map(c => c.layers) }
}

const VARIANT_FRAMES: Readonly<Record<Variant, readonly Sprite[]>> = {
  yawn: yawn.yawn,
  twitch: twitch.twitch,
  lick: lick.lick,
}

const ms = (frames: number) => frames * BASE_FRAME_MS

/** z letters: drift up and right, a pixel at a time, fading. */
function zFloat(sprite: Sprite, x: number, y: number, delayMs: number): Floater {
  const keys: Key[] = [
    { t: 0, x, y, opacity: 1 },
    { t: 400, x, y: y - 1, opacity: 1 },
    { t: 800, x: x + 1, y: y - 2, opacity: 1 },
    { t: 1200, x: x + 1, y: y - 3, opacity: 0.75 },
    { t: 1600, x: x + 2, y: y - 4, opacity: 0.5 },
    { t: 2000, x: x + 2, y: y - 5, opacity: 0.25 },
    { t: 2400, x: x + 2, y: y - 5, opacity: 0 },
  ]
  return { sprite, keys, periodMs: 2400, delayMs, isLooping: true }
}

/** Golden cat: sparkles that twinkle on and off around it. */
function sparkles(points: readonly (readonly [number, number])[]): Floater[] {
  return points.map(([x, y], i) => ({
    sprite: i % 2 === 0 ? extras.sparkleA : extras.sparkleB,
    keys: [
      { t: 0, x, y, opacity: 1 },
      { t: 300, x, y, opacity: 0.5 },
      { t: 600, x, y, opacity: 0 },
      { t: 1500, x, y, opacity: 0 },
    ],
    periodMs: 1800,
    delayMs: i * 600,
    isLooping: true,
  }))
}

function withGold(look: Look, floaters: Floater[], points: readonly (readonly [number, number])[]): Floater[] {
  return look.skin === 'golden' ? [...floaters, ...sparkles(points)] : floaters
}

function buildSit(look: Look): Animation {
  const [first, second] = look.variants
  const sprites = [
    ...sit.swish, ...sit.swish, sit.blink, ...sit.swish,
    ...VARIANT_FRAMES[first],
    ...sit.swish, sit.blink, ...sit.swish,
    ...VARIANT_FRAMES[second],
  ]
  const composed = sprites.map(sprite => compose([{ sprite, x: 8, y: 2, cap: 'front' }], look))
  return {
    id: 'sit',
    label: 'A pixel cat sits and swishes its tail',
    ...framesOf(composed),
    isLooping: true,
    still: 0,
    floaters: withGold(look, [], [[4, 6], [26, 3], [22, 12]]),
    durationMs: ms(composed.length),
  }
}

function buildChase(look: Look): Animation {
  const g = chase.gallop
  const run = (i: number) => g[i % g.length] ?? chase.runMid
  const roll = (i: number) => chase.yarnRoll[i % chase.yarnRoll.length] ?? chase.yarnA
  const steps: { cat: Sprite; cx: number; left: boolean; yx: number; yy: number }[] = []
  // Run right, the ball rolling ahead.
  ;[0, 2, 4, 6, 8, 10].forEach((cx, i) => steps.push({ cat: run(i), cx, left: false, yx: 16 + 2 * i, yy: 13 }))
  // Bat it: the ball flies back over the cat, which turns.
  steps.push({ cat: chase.runTuck, cx: 11, left: false, yx: 27, yy: 12 })
  steps.push({ cat: chase.runMid, cx: 11, left: true, yx: 21, yy: 5 })
  steps.push({ cat: chase.runSpread, cx: 11, left: true, yx: 13, yy: 2 })
  steps.push({ cat: chase.runMid, cx: 11, left: true, yx: 6, yy: 8 })
  // Run left.
  ;[10, 8, 6, 4, 2, 1].forEach((cx, i) => steps.push({ cat: run(i), cx, left: true, yx: Math.max(0, 4 - i), yy: 13 }))
  // Bat it back.
  steps.push({ cat: chase.runTuck, cx: 0, left: true, yx: 5, yy: 6 })
  steps.push({ cat: chase.runMid, cx: 0, left: false, yx: 10, yy: 2 })
  steps.push({ cat: chase.runSpread, cx: 0, left: false, yx: 14, yy: 8 })
  const composed = steps.map((s, i) =>
    compose(
      [
        { sprite: s.cat, x: s.cx, y: 2, isFlipped: s.left, cap: 'side' },
        { sprite: roll(i), x: s.yx, y: s.yy },
      ],
      look,
    ),
  )
  return {
    id: 'chase',
    label: 'A pixel cat chases a ball of yarn back and forth',
    ...framesOf(composed),
    isLooping: true,
    still: 2,
    floaters: withGold(look, [], [[3, 2], [28, 1], [16, 0]]),
    durationMs: ms(composed.length),
  }
}

function buildSleep(look: Look): Animation {
  const sprites = [...Array<Sprite>(6).fill(sleep.curl), ...Array<Sprite>(6).fill(sleep.curlBreathe)]
  const composed = sprites.map(sprite => compose([{ sprite, x: 6, y: 2, cap: 'side' }], look))
  return {
    id: 'sleep',
    label: 'A pixel cat sleeps curled up; small z letters float up',
    ...framesOf(composed),
    isLooping: true,
    still: 0,
    floaters: withGold(
      look,
      [zFloat(sleep.zSmall, 22, 7, 0), zFloat(sleep.zBig, 25, 5, 1200)],
      [[4, 8], [16, 5]],
    ),
    durationMs: Math.max(ms(composed.length), 2400 + 1200),
  }
}

function buildTyping(look: Look): Animation {
  const composed = typing.tap.map((sprite, i) =>
    compose(
      [
        { sprite: i % 4 < 2 ? typing.desk : typing.deskScroll, x: 17, y: 7 },
        { sprite, x: 3, y: 2, cap: 'side' },
      ],
      look,
    ),
  )
  return {
    id: 'typing',
    label: 'A pixel cat sits at a tiny desk and paws at the keyboard',
    ...framesOf(composed),
    isLooping: true,
    still: 0,
    floaters: withGold(look, [], [[1, 3], [13, 0], [30, 2]]),
    durationMs: ms(composed.length),
  }
}

function buildStretch(look: Look): Animation {
  const sprites: Sprite[] = [
    stretch.stand, stretch.stand, stretch.halfStretch,
    ...Array<Sprite>(8).fill(stretch.fullStretch),
    stretch.halfStretch, stretch.stand, stretch.stand, stretch.stand,
  ]
  const composed = sprites.map(sprite => compose([{ sprite, x: 8, y: 2, cap: 'side' }], look))
  const popAt = ms(4)
  const heart: Floater = {
    sprite: stretch.heart,
    keys: [
      { t: 0, x: 18, y: 5, opacity: 0 },
      { t: popAt, x: 18, y: 4, opacity: 1 },
      { t: popAt + 100, x: 18, y: 3, opacity: 1 },
      { t: popAt + 200, x: 18, y: 2, opacity: 1 },
      { t: popAt + 300, x: 18, y: 1, opacity: 1 },
      { t: popAt + 400, x: 18, y: 0, opacity: 1 },
      { t: popAt + 700, x: 18, y: 1, opacity: 1 },
    ],
    periodMs: 3000,
    delayMs: 0,
    isLooping: false,
  }
  return {
    id: 'stretch',
    label: 'A pixel cat stretches, a heart pops above it, then it fades',
    ...framesOf(composed),
    isLooping: false,
    still: 6,
    floaters: withGold(look, [heart], [[5, 4], [28, 6]]),
    fade: { startMs: 2400, endMs: 3000 },
    durationMs: 3000,
  }
}

function buildStartle(look: Look): Animation {
  const placed: Placed[] = [
    { sprite: startle.sitUp, x: 8, y: 2 },
    { sprite: startle.startled, x: 8, y: 1 },
    { sprite: startle.startled, x: 8, y: 0 },
    { sprite: startle.startled, x: 8, y: 0 },
    { sprite: startle.startled, x: 8, y: 1 },
    { sprite: startle.startled, x: 8, y: 2 },
    { sprite: startle.startled, x: 8, y: 2 },
    { sprite: startle.startled, x: 8, y: 2 },
    { sprite: startle.startled, x: 8, y: 2 },
    { sprite: startle.sitUp, x: 8, y: 2 },
    { sprite: startle.sitUp, x: 8, y: 2 },
    { sprite: startle.sitUp, x: 8, y: 2 },
    { sprite: startle.sitUp, x: 8, y: 2 },
    { sprite: startle.sitUp, x: 8, y: 2 },
  ]
  const composed = placed.map(p => compose([{ ...p, cap: 'front' }], look))
  return {
    id: 'startle',
    label: 'A pixel cat hops, startled, ears flat, then sits back down',
    ...framesOf(composed),
    isLooping: false,
    still: 6,
    floaters: withGold(look, [], [[4, 3], [27, 5]]),
    fade: { startMs: 2600, endMs: 3000 },
    durationMs: 3000,
  }
}

const BUILDERS: Readonly<Record<AnimId, (look: Look) => Animation>> = {
  sit: buildSit,
  chase: buildChase,
  sleep: buildSleep,
  typing: buildTyping,
  stretch: buildStretch,
  startle: buildStartle,
}

const cache = new Map<string, Animation>()

export function lookKey(look: Look): string {
  return `${look.skin}|${look.isNight ? 'night' : 'day'}|${look.variants.join('+')}`
}

/** Builds (once per look) an animation's frames and floaters. */
export function animation(id: AnimId, look: Look): Animation {
  const key = `${id}|${lookKey(look)}`
  let built = cache.get(key)
  if (built === undefined) {
    built = BUILDERS[id](look)
    cache.set(key, built)
  }
  return built
}

/** Where a floater stands `t` ms into the animation, or undefined while hidden. */
export function floaterAt(f: Floater, t: number): Key | undefined {
  const local = t - f.delayMs
  if (!f.isLooping && local < 0) return undefined
  const at = f.isLooping
    ? ((local % f.periodMs) + f.periodMs) % f.periodMs
    : Math.min(local, f.periodMs)
  let current: Key | undefined
  for (const key of f.keys) {
    if (key.t <= at) current = key
  }
  return current
}
