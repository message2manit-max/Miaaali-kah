// The scene: a blocky ginger cat on a strip of grass, drawn in half-block
// pixels (two square pixels per terminal cell), plus one caption row.

export const ROWS = 9 // 8 rows of picture (16 px tall) + 1 caption row
export const TICK_MS = 100

const PX_H = 16
const GROUND = 14 // first grass pixel row
const SPRITE_W = 22
const DEFAULT = 0x01000000 // the terminal's own color
const NONE = -1

const O = 0xe8913a // ginger fur
const D = 0xa85a24 // stripes, far legs
const C = 0xf8e0b8 // cream muzzle, chest, paws
const K = 0x1e1e1e // pupil
const EYE = 0x6ccb3c
const PINK = 0xf2879e
const GRASS = 0x5e9e34
const GRASS_HI = 0x7cbf45
const DIRT = 0x7a5230
const DIRT_LO = 0x5e3d22
const STEM = 0x3f7f2a
const POPPY = 0xe03c31
const DANDELION = 0xf5d33b
const WING = 0xc77dff
const WING_HI = 0xff9bd8
const SNORE = 0xa9c6ff
const MARK = 0xffffff
const TEXT = 0x9a9a9a

export class Canvas {
  readonly w: number
  readonly px: number[]
  readonly glyphs = new Map<number, [number, number]>() // cell index -> [codePoint, fg]

  constructor(w: number) {
    this.w = w
    this.px = new Array<number>(w * PX_H).fill(NONE)
  }

  set(x: number, y: number, c: number) {
    if (x >= 0 && x < this.w && y >= 0 && y < PX_H) this.px[y * this.w + x] = c
  }

  rect(x: number, y: number, w: number, h: number, c: number) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c)
  }

  glyph(col: number, row: number, ch: string, fg: number) {
    if (col >= 0 && col < this.w && row >= 0 && row < ROWS - 1) {
      this.glyphs.set(row * this.w + col, [ch.charCodeAt(0), fg])
    }
  }
}

// ---------------------------------------------------------------- the cat

export type Pose =
  | { kind: 'walk'; step: number }
  | { kind: 'sit'; eyesClosed: boolean; tail: number }
  | { kind: 'lick'; bob: number }
  | { kind: 'stretch'; tail: number }
  | { kind: 'crouch'; wiggle: number }
  | { kind: 'jump' }
  | { kind: 'loaf'; breath: number }

/** Draws the cat facing right, its sprite box's left edge at `x`. */
export function drawCat(cv: Canvas, pose: Pose, x: number, lift = 0) {
  const oy = GROUND - 11 - lift
  const p = (lx: number, ly: number, c: number) => cv.set(x + lx, oy + ly, c)
  const r = (lx: number, ly: number, w: number, h: number, c: number) => cv.rect(x + lx, oy + ly, w, h, c)
  const tail = (pts: [number, number][]) => pts.forEach(([lx, ly], i) => p(lx, ly, i % 2 ? D : O))

  const head = (hx: number, hy: number, eyesClosed: boolean) => {
    r(hx, hy, 6, 5, O)
    p(hx + 1, hy - 1, O) // ears
    p(hx + 4, hy - 1, O)
    p(hx + 2, hy, D) // forehead stripes
    p(hx + 3, hy, D)
    p(hx, hy + 1, D)
    if (eyesClosed) {
      p(hx + 3, hy + 1, D)
      p(hx + 4, hy + 1, D)
    } else {
      p(hx + 3, hy + 1, EYE)
      p(hx + 4, hy + 1, K)
    }
    r(hx + 2, hy + 3, 4, 2, C) // muzzle
    p(hx + 6, hy + 2, PINK) // nose
    p(hx + 6, hy + 3, C)
  }
  const leg = (lx: number, top: number, near: boolean) => {
    r(lx, top, 1, 10 - top, near ? O : D)
    p(lx, 10, C)
  }
  const stripes = (ly: number, ...cols: number[]) => cols.forEach(lx => p(lx, ly, D))

  switch (pose.kind) {
    case 'walk': {
      const s = [0, 1, 2, 1][pose.step % 4]!
      leg(6 - s, 8, false)
      leg(13 - s, 8, false)
      tail([[2, 4], [1, 3], [1, 2], [0, 1], [pose.step % 4 < 2 ? 0 : 1, 0]])
      r(3, 4, 12, 4, O)
      r(5, 7, 8, 1, C)
      stripes(4, 6, 9, 12)
      stripes(5, 6, 9)
      leg(3 + s, 8, true)
      leg(11 + s, 8, true)
      head(14, 1 + (s === 2 ? 1 : 0), false)
      return
    }
    case 'sit': {
      tail(pose.tail ? [[5, 10], [4, 10], [3, 10], [2, 9], [1, 8]] : [[5, 10], [4, 10], [3, 10], [2, 9], [2, 8]])
      r(6, 6, 7, 5, O) // haunch
      p(6, 6, NONE)
      r(9, 5, 2, 1, O) // back curving up to the shoulders
      p(10, 4, O)
      stripes(7, 8, 10)
      r(11, 3, 4, 6, O) // chest
      r(13, 5, 2, 3, C)
      p(11, 10, C) // back paw
      p(12, 10, C)
      leg(13, 9, false)
      leg(14, 9, true)
      head(12, 0, pose.eyesClosed)
      return
    }
    case 'lick': {
      tail([[5, 10], [4, 10], [3, 10], [2, 9], [2, 8]])
      r(6, 6, 7, 5, O)
      p(6, 6, NONE)
      r(9, 5, 2, 1, O)
      p(10, 4, O)
      stripes(7, 8, 10)
      r(11, 3, 4, 6, O)
      r(13, 5, 2, 3, C)
      p(11, 10, C)
      p(12, 10, C)
      leg(13, 9, false)
      const hy = pose.bob ? 1 : 0
      head(12, hy, true)
      p(15, 7, O) // the raised paw, up at the mouth
      p(16, 6, O)
      p(17, 5, O)
      p(18, 4, C)
      p(18, 5, C)
      if (pose.bob) p(19, 3, PINK) // tongue
      return
    }
    case 'stretch': {
      tail(pose.tail ? [[2, 2], [2, 1], [1, 0], [0, 0]] : [[2, 2], [2, 1], [1, 0], [1, -1]])
      leg(4, 7, false)
      r(3, 3, 6, 4, O) // rear up high
      stripes(3, 5, 7)
      r(8, 5, 4, 3, O)
      stripes(5, 10)
      r(11, 7, 4, 2, O)
      leg(6, 7, true)
      r(13, 9, 7, 1, D) // front legs out flat
      p(20, 9, C)
      r(12, 10, 9, 1, O)
      p(21, 10, C)
      head(14, 4, true)
      return
    }
    case 'crouch': {
      const w = pose.wiggle
      tail([[2, 7], [1, 7], [0, w ? 6 : 8]])
      leg(5, 9, false)
      leg(12, 9, false)
      r(3, 6, 12, 3, O)
      r(5, 8, 8, 1, C)
      stripes(6, 6, 9)
      if (w) p(3, 5, O) // butt wiggle
      else p(4, 5, O)
      leg(4, 9, true)
      leg(13, 9, true)
      head(14, 4, false)
      return
    }
    case 'jump': {
      tail([[2, 4], [1, 4], [0, 3]])
      p(2, 7, D) // back legs kicked out
      p(1, 8, D)
      r(3, 3, 13, 4, O)
      r(5, 6, 9, 1, C)
      stripes(3, 6, 9, 12)
      p(3, 7, O)
      p(2, 8, O)
      p(1, 9, C)
      p(16, 6, D) // front legs reaching
      p(17, 7, D)
      p(17, 6, O)
      p(18, 7, O)
      p(19, 8, C)
      head(15, 1, false)
      return
    }
    case 'loaf': {
      tail([[3, 10], [2, 10], [1, 10], [0, 9]])
      if (pose.breath) r(6, 5, 6, 1, O)
      r(4, 6, 11, 5, O)
      p(4, 6, NONE)
      stripes(6, 7, 10)
      stripes(7, 7, 10)
      r(12, 10, 3, 1, C) // tucked paws
      head(13, 6, true)
      return
    }
  }
}

function drawButterfly(cv: Canvas, x: number, y: number, flap: number) {
  cv.set(x + 1, y, K)
  cv.set(x + 1, y + 1, K)
  const wy = flap ? y : y + 1
  cv.set(x, wy, WING)
  cv.set(x + 2, wy, WING)
  cv.set(x, flap ? y + 1 : y, WING_HI)
}

function drawGround(cv: Canvas) {
  for (let x = 0; x < cv.w; x++) {
    const h = (x * 2654435761) >>> 0
    cv.set(x, GROUND, h % 5 === 0 ? GRASS_HI : GRASS)
    cv.set(x, GROUND + 1, h % 7 === 0 ? DIRT_LO : DIRT)
  }
  const flower = (x: number, c: number) => {
    cv.set(x, GROUND - 1, STEM)
    cv.set(x, GROUND - 2, c)
  }
  flower(Math.floor(cv.w * 0.12), POPPY)
  flower(Math.floor(cv.w * 0.86), DANDELION)
  flower(Math.floor(cv.w * 0.9), POPPY)
}

// --------------------------------------------------------------- the plan

/** What she does at `tick`: a looping little routine sized to the width. */
export function stage(tick: number, w: number, cv: Canvas): string {
  const cx = Math.max(1, Math.floor((w - SPRITE_W) / 2) - 4) // where she sits
  const lx = cx + 10 // where she lands after the pounce
  const segs: [string, number][] = [
    ['walkIn', cx + SPRITE_W],
    ['sit', 24],
    ['lick', 30],
    ['stretch', 22],
    ['hunt', 74],
    ['nap', 64],
    ['walkOut', Math.max(1, w + 1 - lx)],
  ]
  const total = segs.reduce((n, [, len]) => n + len, 0)
  let t = ((tick % total) + total) % total
  let seg = segs[0]![0]
  for (const [name, len] of segs) {
    if (t < len) {
      seg = name
      break
    }
    t -= len
  }

  switch (seg) {
    case 'walkIn':
      drawCat(cv, { kind: 'walk', step: t >> 1 }, t - SPRITE_W)
      return 'Prowling'
    case 'sit':
      drawCat(cv, { kind: 'sit', eyesClosed: t === 10 || t === 11 || t === 20, tail: (t >> 2) & 1 }, cx)
      return 'Pondering'
    case 'lick':
      drawCat(cv, { kind: 'lick', bob: (t >> 1) & 1 }, cx)
      return 'Grooming'
    case 'stretch':
      if (t < 3 || t >= 19) drawCat(cv, { kind: 'sit', eyesClosed: false, tail: 0 }, cx)
      else drawCat(cv, { kind: 'stretch', tail: (t >> 2) & 1 }, cx)
      return 'Stretching'
    case 'hunt': {
      const bx = cx + 24
      if (t < 24) {
        drawButterfly(cv, Math.round(w + 2 - ((w + 2 - bx) * t) / 24), 5 + Math.round(2 * Math.sin(t * 0.6)), t & 1)
        drawCat(cv, { kind: 'sit', eyesClosed: false, tail: (t >> 1) & 1 }, cx)
        return 'Watching'
      }
      if (t < 44) drawButterfly(cv, bx, 6 + Math.round(Math.sin(t * 0.7)), t & 1)
      else drawButterfly(cv, bx + (t - 44), 6 - (t - 44), t & 1)
      if (t < 40) {
        drawCat(cv, { kind: 'crouch', wiggle: t & 1 }, cx)
        return 'Stalking'
      }
      if (t < 52) {
        const u = (t - 40) / 12
        drawCat(cv, { kind: 'jump' }, cx + Math.round(u * 10), Math.round(Math.sin(u * Math.PI) * 3))
        return 'Pouncing'
      }
      drawCat(cv, { kind: 'sit', eyesClosed: false, tail: (t >> 2) & 1 }, lx)
      if (t >= 54) cv.glyph(lx + 15, 0, '?', MARK)
      return 'Reconsidering'
    }
    case 'nap': {
      if (t < 4) {
        drawCat(cv, { kind: 'sit', eyesClosed: true, tail: 0 }, lx)
        return 'Yawning'
      }
      if (t >= 56) {
        drawCat(cv, { kind: 'sit', eyesClosed: false, tail: 1 }, lx)
        cv.glyph(lx + 15, 0, '!', MARK)
        return 'Eureka'
      }
      drawCat(cv, { kind: 'loaf', breath: (t >> 3) & 1 }, lx)
      for (let k = 0; k < 3; k++) {
        const ph = (t + k * 6) % 18
        const up = Math.floor(ph / 6)
        cv.glyph(lx + 19 + up, 3 - up, up === 2 ? 'Z' : 'z', SNORE)
      }
      return 'Dreaming'
    }
    default:
      drawCat(cv, { kind: 'walk', step: t >> 1 }, lx + t)
      return 'Prowling'
  }
}

// -------------------------------------------------------------- encoding

const UPPER = 0x2580 // ▀
const LOWER = 0x2584 // ▄

/** Keeps a caption to characters a Raster cell takes: printable ASCII, … and ·. */
export function clean(text: string): string {
  let out = ''
  for (const ch of text) {
    const c = ch.codePointAt(0)!
    if ((c >= 0x20 && c <= 0x7e) || c === 0x2026 || c === 0xb7) out += ch
  }
  return out
}

/** One frame's cells, packed as a Raster's `cells`. */
export function frame(tick: number, w: number, status: string): string {
  const cv = new Canvas(w)
  drawGround(cv)
  const verb = stage(tick, w, cv)
  const words = new Uint32Array(w * ROWS * 3)
  let i = 0
  const put = (cp: number, fg: number, bg: number) => {
    words[i++] = cp
    words[i++] = fg
    words[i++] = bg
  }
  for (let row = 0; row < ROWS - 1; row++) {
    for (let x = 0; x < w; x++) {
      const g = cv.glyphs.get(row * w + x)
      const top = cv.px[2 * row * w + x]!
      const bot = cv.px[(2 * row + 1) * w + x]!
      if (g) put(g[0], g[1], DEFAULT)
      else if (top === NONE && bot === NONE) put(0x20, DEFAULT, DEFAULT)
      else if (top === NONE) put(LOWER, bot, DEFAULT)
      else put(UPPER, top, bot === NONE ? DEFAULT : bot)
    }
  }
  const head = clean(`${verb}… `)
  const caption = (head + clean(status)).padEnd(w).slice(0, w)
  let x = 0
  for (const ch of caption) put(ch.charCodeAt(0), x++ < head.length ? O : TEXT, DEFAULT)
  return base64(new Uint8Array(words.buffer))
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function base64(bytes: Uint8Array): string {
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!
    const b = bytes[i + 1] ?? 0
    const c = bytes[i + 2] ?? 0
    const n = (a << 16) | (b << 8) | c
    out += B64[(n >> 18) & 63]! + B64[(n >> 12) & 63]!
    out += i + 1 < bytes.length ? B64[(n >> 6) & 63]! : '='
    out += i + 2 < bytes.length ? B64[n & 63]! : '='
  }
  return out
}

export function sceneWidth(columns: number | undefined): number {
  return Math.max(30, Math.min(72, (columns ?? 80) - 2))
}
