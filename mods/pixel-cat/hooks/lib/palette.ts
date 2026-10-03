// Flat colors. Each coat gives every cat letter one of at most five fur and
// eye colors, plus its outline; the props (yarn, desk, heart, cap) are shared.

export const COATS = ['tabby', 'black', 'grey', 'calico', 'siamese'] as const
export type Coat = (typeof COATS)[number]
export type Skin = Coat | 'golden'

export type Palette = {
  /** Letter to color for the light theme. */
  light: Readonly<Record<string, string>>
  /** The letters whose color changes in the dark theme. */
  dark: Readonly<Record<string, string>>
}

type CoatColors = {
  outline: string
  outlineDark: string
  base: string
  dark: string
  light: string
  eye: string
  nose: string
  tongue: string
}

// Which coat color each cat letter takes: f fur, s stripe, l light fur,
// m muzzle, e eye, n nose, p tongue, L/R ears, t tail, r tail ring, w paw,
// a/b calico patches.
type Role = Exclude<keyof CoatColors, 'outline' | 'outlineDark'>
type LetterRoles = Readonly<Record<string, Role>>

const STRIPED: LetterRoles = {
  f: 'base', s: 'dark', l: 'light', m: 'light', e: 'eye', n: 'nose', p: 'tongue',
  L: 'base', R: 'base', t: 'base', r: 'dark', w: 'light', a: 'base', b: 'base',
}

const ROLES: Readonly<Record<Skin, LetterRoles>> = {
  tabby: STRIPED,
  golden: STRIPED,
  grey: STRIPED,
  black: {
    f: 'base', s: 'base', l: 'dark', m: 'base', e: 'eye', n: 'dark', p: 'tongue',
    L: 'base', R: 'base', t: 'base', r: 'base', w: 'base', a: 'base', b: 'base',
  },
  // calico: base white, `dark` the black patches, `light` the orange ones
  calico: {
    f: 'base', s: 'base', l: 'base', m: 'base', e: 'eye', n: 'nose', p: 'tongue',
    L: 'dark', R: 'light', t: 'light', r: 'dark', w: 'base', a: 'light', b: 'dark',
  },
  // siamese: cream body, `dark` the points (ears, mask, paws, tail)
  siamese: {
    f: 'base', s: 'base', l: 'base', m: 'dark', e: 'eye', n: 'dark', p: 'tongue',
    L: 'dark', R: 'dark', t: 'dark', r: 'dark', w: 'dark', a: 'base', b: 'base',
  },
}

const COLORS: Readonly<Record<Skin, CoatColors>> = {
  tabby: {
    outline: '#2b1a10', outlineDark: '#d9c4b0',
    base: '#f0902c', dark: '#b4561a', light: '#ffe2b0', eye: '#62c43a', nose: '#f28a9a', tongue: '#f28a9a',
  },
  black: {
    outline: '#0b0b10', outlineDark: '#c8c8da',
    base: '#2a2a36', dark: '#4c4c60', light: '#4c4c60', eye: '#f5d327', nose: '#4c4c60', tongue: '#e88a9a',
  },
  grey: {
    outline: '#1d2028', outlineDark: '#d3d7df',
    base: '#8d95a3', dark: '#666d7a', light: '#f4f5f7', eye: '#e3a627', nose: '#f0a0ab', tongue: '#f0a0ab',
  },
  calico: {
    outline: '#2a1d18', outlineDark: '#dcc9bb',
    base: '#f8f3ea', dark: '#38312e', light: '#ec8a2e', eye: '#78c043', nose: '#f0a0ab', tongue: '#f0a0ab',
  },
  siamese: {
    outline: '#2a2018', outlineDark: '#dccdb8',
    base: '#f2e4c7', dark: '#5e4130', light: '#f2e4c7', eye: '#3d8fe0', nose: '#5e4130', tongue: '#f0a0ab',
  },
  golden: {
    outline: '#4f3300', outlineDark: '#f2dc9a',
    base: '#ffc933', dark: '#e09200', light: '#fff2b3', eye: '#2ec4b6', nose: '#ff9fb2', tongue: '#ff9fb2',
  },
}

/** Props: yarn (y Y), z, heart (h H), desk (D E), keyboard (K J), monitor (M G), cap (c C), sparkle (g k). */
const PROPS: Readonly<Record<string, string>> = {
  y: '#e2456a', Y: '#ff9ab2',
  z: '#5877d8',
  h: '#ff3d68', H: '#ffc2d0',
  D: '#a8743f', E: '#714a24',
  K: '#e3e6ea', J: '#7f8693',
  M: '#2e3a52', G: '#7cf29a',
  c: '#4a5ee0', C: '#f4f4ff',
  g: '#f2b200', k: '#ffd84a',
}

const PROPS_DARK: Readonly<Record<string, string>> = {
  z: '#a9bfff',
  g: '#ffe97a', k: '#fffbe0',
}

export function palette(skin: Skin): Palette {
  const colors = COLORS[skin]
  const light: Record<string, string> = { ...PROPS, o: colors.outline }
  for (const [letter, role] of Object.entries(ROLES[skin])) {
    light[letter] = colors[role]
  }
  return { light, dark: { ...PROPS_DARK, o: colors.outlineDark } }
}

/** The colors for one theme, `dark` laid over `light` when the theme is dark. */
export function themed(p: Palette, isDark: boolean): Readonly<Record<string, string>> {
  return isDark ? { ...p.light, ...p.dark } : p.light
}
