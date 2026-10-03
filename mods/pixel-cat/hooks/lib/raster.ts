// The terminal drawing: two pixel rows per text row with half blocks. A cell
// whose upper pixel shows is '▀' in that color over the lower pixel's color
// (or the terminal's own background); one with only the lower pixel is '▄'.

import { base64 } from './base64'
import type { Animation } from './stage'
import { floaterAt, STAGE_H, STAGE_W } from './stage'

export const RASTER_COLUMNS = STAGE_W
export const RASTER_ROWS = STAGE_H / 2

const UPPER = 0x2580
const LOWER = 0x2584
const SPACE = 0x20
/** The terminal's own color (bit 24 alone). */
const DEFAULT = 0x01000000

export type Cell = { glyph: string; fg: number; bg: number }

function rgb(hex: string | undefined): number | undefined {
  if (hex === undefined) return undefined
  return parseInt(hex.slice(1, 7), 16)
}

/** One half-block cell for an upper and a lower pixel color. */
export function cellFor(top: number | undefined, bottom: number | undefined): [number, number, number] {
  if (top !== undefined) return [UPPER, top, bottom ?? DEFAULT]
  if (bottom !== undefined) return [LOWER, bottom, DEFAULT]
  return [SPACE, DEFAULT, DEFAULT]
}

/** The stage at `t` ms into the animation: its frame with the visible floaters laid on. */
export function gridAt(anim: Animation, frameIndex: number, t: number, withFloaters: boolean): string[] {
  const frame = anim.frames[frameIndex] ?? anim.frames[0] ?? []
  if (!withFloaters || anim.floaters.length === 0) return [...frame]
  const grid = frame.map(row => [...row])
  for (const f of anim.floaters) {
    const at = floaterAt(f, t)
    // A terminal cannot fade: a floater shows while at least half opaque.
    if (at === undefined || at.opacity < 0.5) continue
    f.sprite.forEach((row, y) => {
      const line = grid[at.y + y]
      if (line === undefined) return
      for (let x = 0; x < row.length; x++) {
        const c = row[x]
        if (c !== undefined && c !== '.' && at.x + x >= 0 && at.x + x < STAGE_W) line[at.x + x] = c
      }
    })
  }
  return grid.map(row => row.join(''))
}

/** Packs a stage grid as Raster cells: u32 triplets, little-endian, base64. */
export function cellsFor(grid: readonly string[], colors: Readonly<Record<string, string>>): string {
  const words = new Uint32Array(RASTER_COLUMNS * RASTER_ROWS * 3)
  for (let row = 0; row < RASTER_ROWS; row++) {
    const upper = grid[row * 2] ?? ''
    const lower = grid[row * 2 + 1] ?? ''
    for (let x = 0; x < RASTER_COLUMNS; x++) {
      const top = upper[x]
      const bottom = lower[x]
      const cell = cellFor(
        top === undefined || top === '.' ? undefined : rgb(colors[top]),
        bottom === undefined || bottom === '.' ? undefined : rgb(colors[bottom]),
      )
      words.set(cell, (row * RASTER_COLUMNS + x) * 3)
    }
  }
  return base64(new Uint8Array(words.buffer))
}

/** Reads packed cells back (for tests): one string of glyphs per terminal row. */
export function decodeCells(cells: string, columns = RASTER_COLUMNS): { glyphs: string[]; words: number[] } {
  const bin = atobSafe(cells)
  const words: number[] = []
  for (let i = 0; i + 3 < bin.length; i += 4) {
    words.push(((bin[i] ?? 0) | ((bin[i + 1] ?? 0) << 8) | ((bin[i + 2] ?? 0) << 16) | ((bin[i + 3] ?? 0) << 24)) >>> 0)
  }
  const glyphs: string[] = []
  for (let i = 0; i < words.length; i += columns * 3) {
    let line = ''
    for (let x = 0; x < columns; x++) line += String.fromCodePoint(words[i + x * 3] ?? SPACE)
    glyphs.push(line)
  }
  return { glyphs, words }
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function atobSafe(text: string): number[] {
  const out: number[] = []
  for (let i = 0; i < text.length; i += 4) {
    const n =
      (ALPHABET.indexOf(text[i] ?? 'A') << 18) |
      (ALPHABET.indexOf(text[i + 1] ?? 'A') << 12) |
      (Math.max(0, ALPHABET.indexOf(text[i + 2] ?? 'A')) << 6) |
      Math.max(0, ALPHABET.indexOf(text[i + 3] ?? 'A'))
    out.push((n >> 16) & 255)
    if (text[i + 2] !== '=') out.push((n >> 8) & 255)
    if (text[i + 3] !== '=') out.push(n & 255)
  }
  return out
}
