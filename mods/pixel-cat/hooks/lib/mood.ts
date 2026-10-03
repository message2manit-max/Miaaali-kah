// What the cat does, from what Claude is doing. Pure functions: the hooks
// module feeds them the turn's state and the spinner's mode.

import type { AnimId, Variant } from './stage'

export const VERBS = [
  'Purr-cessing',
  'Kneading the context',
  'Chasing the cursor',
  'Herding thoughts',
  'Pawing through files',
  'Napping on the problem',
  'Batting at bugs',
] as const

export const SPEEDS = ['slow', 'normal', 'fast'] as const
export type Speed = (typeof SPEEDS)[number]

/** How much longer each frame lasts than at normal speed. */
export const SPEED_FACTOR: Readonly<Record<Speed, number>> = { slow: 1.5, normal: 1, fast: 0.65 }

/** The terminal swaps frames on this clock (and every SVG frame lasts as long). */
export const FRAME_MS = 150

/** How long the cat has been thinking since the turn began or a tool last finished. */
export type Phase = 'early' | 'mid' | 'late'

export const MID_AFTER_MS = 10_000
export const LATE_AFTER_MS = 40_000

export function phaseOf(elapsedMs: number): Phase {
  if (elapsedMs >= LATE_AFTER_MS) return 'late'
  if (elapsedMs >= MID_AFTER_MS) return 'mid'
  return 'early'
}

export type SpinnerMode = 'requesting' | 'responding' | 'thinking' | 'tool-input' | 'tool-use'

/**
 * A tool running wins (the desk); otherwise the time spent thinking: sit for
 * the first 10 s, chase the yarn after that, and past 40 s of extended
 * thinking curl up asleep.
 */
export function chooseAnim(input: { phase: Phase; toolsRunning: number; mode: SpinnerMode }): AnimId {
  if (input.toolsRunning > 0 || input.mode === 'tool-use' || input.mode === 'tool-input') {
    return 'typing'
  }
  if (input.phase === 'late' && input.mode === 'thinking') return 'sleep'
  if (input.phase === 'early') return 'sit'
  return 'chase'
}

/** After 11 pm (and until 6 am) the cat wears its nightcap. */
export function isNightHour(hour: number): boolean {
  return hour >= 23 || hour < 6
}

const pick = <T>(list: readonly T[], random: () => number): T => {
  const one = list[Math.floor(random() * list.length) % list.length]
  if (one === undefined) throw new Error('pick from an empty list')
  return one
}

/** The two idle moves of a sitting loop; at night, mostly yawns. */
export function pickVariants(isNight: boolean, random: () => number): [Variant, Variant] {
  if (isNight) {
    return ['yawn', random() < 0.6 ? 'yawn' : pick(['twitch', 'lick'] as const, random)]
  }
  const first = pick(['yawn', 'twitch', 'lick'] as const, random)
  const rest = (['yawn', 'twitch', 'lick'] as const).filter(v => v !== first)
  return [first, pick(rest, random)]
}

/** A cat verb, never the same one twice in a row. */
export function pickVerb(random: () => number, previous?: string): string {
  const choices = VERBS.filter(v => v !== previous)
  return pick(choices, random)
}

/** About one turn in fifty brings the golden cat. */
export const GOLDEN_ODDS = 1 / 50

export function isGoldenRoll(random: () => number): boolean {
  return random() < GOLDEN_ODDS
}
