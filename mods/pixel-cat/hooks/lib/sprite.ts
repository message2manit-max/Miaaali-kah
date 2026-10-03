// Sprites are arrays of strings, one character per pixel (legend in sprites/sit.ts).

export type Sprite = readonly string[]

/**
 * Lays `layers` over `base`, top to bottom: ' ' keeps what is beneath, any
 * other character replaces it ('.' erases). The result is as wide and tall as
 * the largest input.
 */
export function over(base: Sprite, ...layers: readonly Sprite[]): string[] {
  const all = [base, ...layers]
  const rows = Math.max(...all.map(s => s.length))
  const cols = Math.max(...all.flatMap(s => s.map(r => r.length)))
  const out: string[] = []
  for (let y = 0; y < rows; y++) {
    let row = ''
    for (let x = 0; x < cols; x++) {
      let c = base[y]?.[x] ?? ' '
      for (const layer of layers) {
        const ch = layer[y]?.[x]
        if (ch !== undefined && ch !== ' ') c = ch
      }
      row += c
    }
    out.push(row)
  }
  return out
}

/** Mirrors a sprite left to right. */
export function flip(sprite: Sprite): string[] {
  return sprite.map(row => [...row].reverse().join(''))
}

/** Moves a sprite up by `dy` rows inside its own box (rows fall off the top). */
export function raise(sprite: Sprite, dy: number): string[] {
  const width = sprite[0]?.length ?? 0
  return [...sprite.slice(dy), ...Array<string>(dy).fill('.'.repeat(width))]
}
