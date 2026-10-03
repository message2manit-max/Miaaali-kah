// pixel-cat: the thinking indicator (the Spinner) becomes an animated pixel
// cat. It sits, chases yarn, naps, types at a desk while tools run, and closes
// each turn with a stretch (or a startled hop) in the band above the prompt.
// /meow shows and changes its settings.

import { atom, read } from 'claude-code'
import type { EngineInterface, Register, RenderElement, ResolveInput, Timer } from 'claude-code'

import type { PixelCatCoat, PixelCatFinale, PixelCatGolden, PixelCatSpeed, PixelCatTurn } from '../types'
import {
  chooseAnim,
  FRAME_MS,
  isGoldenRoll,
  isNightHour,
  phaseOf,
  pickVariants,
  pickVerb,
  SPEED_FACTOR,
  SPEEDS,
  VERBS,
} from './lib/mood'
import type { SpinnerMode } from './lib/mood'
import { COATS, palette, themed } from './lib/palette'
import { cellsFor, gridAt, RASTER_COLUMNS, RASTER_ROWS } from './lib/raster'
import { animation, lookKey } from './lib/stage'
import type { AnimId, Animation, Look } from './lib/stage'
import { SVG_HEIGHT, SVG_WIDTH, svgFor } from './lib/svg'

const COAT = { plugin: 'pixel-cat', key: 'coat' } as const
const SPEED = { plugin: 'pixel-cat', key: 'speed' } as const
const QUIET = { plugin: 'pixel-cat', key: 'isQuiet' } as const
const ENABLED = { plugin: 'pixel-cat', key: 'isEnabled' } as const
const GOLDEN = { plugin: 'pixel-cat', key: 'golden' } as const
const TURN = { plugin: 'pixel-cat', key: 'turn' } as const
const FINALE = { plugin: 'pixel-cat', key: 'finale' } as const

const coat = atom(COAT, 'tabby')
const speed = atom(SPEED, 'normal')
const isQuiet = atom(QUIET, false)
const isEnabled = atom(ENABLED, true)
const golden = atom(GOLDEN, { turns: 0, golden: 0 })
const turn = atom(TURN, null)
const finale = atom(FINALE, null)

type Settings = { coat: PixelCatCoat; speed: PixelCatSpeed; isQuiet: boolean; isEnabled: boolean }

const STORE_SETTINGS = 'settings'
const STORE_GOLDEN = 'golden'

const isCoat = (v: unknown): v is PixelCatCoat => (COATS as readonly unknown[]).includes(v)
const isSpeed = (v: unknown): v is PixelCatSpeed => (SPEEDS as readonly unknown[]).includes(v)

// ---------------------------------------------------------------------------
// State helpers. A write only happens when the value changes, so the drawings
// that read it redraw exactly when there is something new to draw.

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

async function changeTurn($: EngineInterface, fn: (t: PixelCatTurn) => PixelCatTurn): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const held = await $.state.get(TURN)
    const current = held.value ?? null
    if (current === null) return
    const next = fn(current)
    if (same(next, current)) return
    const done = await $.state.set(TURN, next, { ifVersion: held.version })
    if (done.isSet) return
  }
}

async function settingsOf($: EngineInterface): Promise<Settings> {
  return {
    coat: await read($, coat),
    speed: await read($, speed),
    isQuiet: await read($, isQuiet),
    isEnabled: await read($, isEnabled),
  }
}

async function saveSettings($: EngineInterface, patch: Partial<Settings>): Promise<Settings> {
  if (patch.coat !== undefined) await $.state.set(COAT, patch.coat)
  if (patch.speed !== undefined) await $.state.set(SPEED, patch.speed)
  if (patch.isQuiet !== undefined) await $.state.set(QUIET, patch.isQuiet)
  if (patch.isEnabled !== undefined) await $.state.set(ENABLED, patch.isEnabled)
  const all = await settingsOf($)
  await $.store.set(STORE_SETTINGS, all)
  return all
}

async function loadSettings($: EngineInterface): Promise<void> {
  const saved = (await $.store.get(STORE_SETTINGS)) as Partial<Record<keyof Settings, unknown>> | undefined
  if (saved !== undefined && saved !== null && typeof saved === 'object') {
    if (isCoat(saved.coat)) await $.state.set(COAT, saved.coat)
    if (isSpeed(saved.speed)) await $.state.set(SPEED, saved.speed)
    if (typeof saved.isQuiet === 'boolean') await $.state.set(QUIET, saved.isQuiet)
    if (typeof saved.isEnabled === 'boolean') await $.state.set(ENABLED, saved.isEnabled)
  }
  const counter = (await $.store.get(STORE_GOLDEN)) as Partial<PixelCatGolden> | undefined
  if (counter !== undefined && counter !== null && typeof counter.turns === 'number' && typeof counter.golden === 'number') {
    await $.state.set(GOLDEN, { turns: counter.turns, golden: counter.golden })
  }
}

// ---------------------------------------------------------------------------
// Time: a heartbeat while a turn runs moves the phase on (sit, chase, sleep).

let heartbeat: Timer | undefined

function startHeartbeat($: EngineInterface): void {
  heartbeat?.cancel()
  heartbeat = $.clock.every(1000, () => {
    void (async () => {
      const now = await $.clock.now()
      await changeTurn($, t => {
        const phase = phaseOf(now - t.thinkingSince)
        return phase === t.phase ? t : { ...t, phase, verb: pickVerb(Math.random, t.verb) }
      })
    })()
  })
}

function stopHeartbeat(): void {
  heartbeat?.cancel()
  heartbeat = undefined
}

async function isNightNow($: EngineInterface): Promise<boolean> {
  return isNightHour(new Date(await $.clock.now()).getHours())
}

// ---------------------------------------------------------------------------
// Drawing.

const svgCache = new Map<string, string>()

function svgOf(anim: Animation, look: Look, factor: number): string {
  const key = `${anim.id}|${lookKey(look)}|${factor}`
  let source = svgCache.get(key)
  if (source === undefined) {
    source = svgFor(anim, palette(look.skin), factor, FRAME_MS)
    svgCache.set(key, source)
  }
  return source
}

type TerminalPrefs = { isDark: boolean; isReducedMotion: boolean; readAt: number }
let terminalPrefs: TerminalPrefs | undefined

/** The terminal's theme (for the outline) and any reduced-motion setting, read from /config. */
async function prefsOf($: EngineInterface): Promise<TerminalPrefs> {
  const now = await $.clock.now()
  if (terminalPrefs !== undefined && now - terminalPrefs.readAt < 30_000) return terminalPrefs
  let isDark = true
  let isReducedMotion = false
  try {
    const rows = await $.config.list()
    const theme = rows.find(row => row.key === 'theme')?.value
    if (typeof theme === 'string') isDark = !theme.toLowerCase().includes('light')
    isReducedMotion = rows.some(row => /reduce.?motion/i.test(row.key) && row.value === true)
  } catch {
    // Keep the defaults: a dark terminal that animates.
  }
  terminalPrefs = { isDark, isReducedMotion, readAt: now }
  return terminalPrefs
}

/** One terminal animation playing in one site, swapped frame by frame with blits. */
type Player = {
  requestId: string
  key: string
  anim: Animation
  colors: Readonly<Record<string, string>>
  tick: number
  timer?: Timer
  /** Builds the next pass (new idle moves for the sitting loop). */
  renew?: () => Animation
}

const players = new Map<string, Player>()

function stopPlayer(requestId: string): void {
  players.get(requestId)?.timer?.cancel()
  players.delete(requestId)
}

function playerCells(p: Player): string {
  const n = p.anim.frames.length
  const index = p.anim.isLooping ? p.tick % n : Math.min(p.tick, n - 1)
  return cellsFor(gridAt(p.anim, index, p.tick * FRAME_MS, true), p.colors)
}

/**
 * The cells to draw now for `requestId`, starting (or keeping) the clock that
 * blits the next frames. A blit the surface refuses means the Raster is gone
 * (the spinner or band unmounted): the clock stops there.
 */
function play(
  $: EngineInterface,
  requestId: string,
  key: string,
  anim: Animation,
  colors: Readonly<Record<string, string>>,
  factor: number,
  renew?: () => Animation,
): string {
  const playing = players.get(requestId)
  if (playing !== undefined && playing.key === key) return playerCells(playing)
  stopPlayer(requestId)
  const p: Player = { requestId, key, anim, colors, tick: 0, renew }
  players.set(requestId, p)
  p.timer = $.clock.every(Math.round(FRAME_MS * factor), () => {
    p.tick += 1
    if (p.anim.isLooping && p.tick % p.anim.frames.length === 0 && p.renew !== undefined) {
      p.anim = p.renew()
      p.tick = 0
    }
    if (!p.anim.isLooping && p.tick * FRAME_MS >= p.anim.durationMs) {
      p.timer?.cancel()
      return
    }
    $.ui.blit({ requestId, key: 'cat', cells: playerCells(p) }).then(
      done => {
        if (done.deny !== undefined) stopPlayer(requestId)
      },
      () => stopPlayer(requestId),
    )
  })
  return playerCells(p)
}

function stillCells(anim: Animation, colors: Readonly<Record<string, string>>): string {
  return cellsFor(gridAt(anim, anim.still, 0, false), colors)
}

/** A site the cat is drawn into: the spinner or the band, on the terminal or the desktop. */
type Site = ResolveInput<'Spinner' | 'AbovePrompt', 'terminal' | 'desktop'> & { requestId: string }

/** The cat for one site: an Svg on the desktop, a half-block Raster on the terminal. */
async function catElement(
  $: EngineInterface,
  e: Site,
  id: AnimId,
  look: Look,
  factor: number,
  playKey: string,
): Promise<RenderElement | undefined> {
  const anim = animation(id, look)
  if (e.surface === 'desktop') {
    const { Svg } = $.ui.resolve(e)
    return (
      <Svg
        source={svgOf(anim, look, factor)}
        alt={anim.label}
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        isInteractive
      />
    )
  }
  if (e.surface === 'terminal') {
    const { Raster } = $.ui.resolve(e)
    const prefs = await prefsOf($)
    const colors = themed(palette(look.skin), prefs.isDark)
    const renew =
      id === 'sit'
        ? () => animation('sit', { ...look, variants: pickVariants(look.isNight, Math.random) })
        : undefined
    const cells = prefs.isReducedMotion
      ? (stopPlayer(e.requestId), stillCells(anim, colors))
      : play($, e.requestId, `${playKey}|${prefs.isDark}`, anim, colors, factor, renew)
    return <Raster key="cat" columns={RASTER_COLUMNS} rows={RASTER_ROWS} cells={cells} />
  }
  return undefined
}

function lookFor(skin: PixelCatCoat | 'golden', isNight: boolean, variants: Look['variants']): Look {
  return { skin, isNight, variants }
}

function settingsLine(s: Settings, counter: PixelCatGolden): string {
  return (
    `pixel-cat: ${s.isEnabled ? 'on' : 'off'} · coat ${s.coat} · speed ${s.speed} · ` +
    `quiet ${s.isQuiet ? 'on' : 'off'} · golden cats ${counter.golden} in ${counter.turns} turns`
  )
}

const USAGE =
  'Usage: /meow · /meow coat <tabby|black|grey|calico|siamese> · /meow speed <slow|normal|fast> · ' +
  '/meow quiet [on|off] · /meow on · /meow off'

// ---------------------------------------------------------------------------

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'meow',
      description: 'pixel-cat: show or change the thinking cat (coat, speed, quiet, on/off)',
      argumentHint: '[coat <name> | speed <slow|normal|fast> | quiet | on | off]',
      immediate: true,
    })
    await loadSettings($)
    // A reload mid-turn keeps the turn's state: keep its clock going too.
    if ((await read($, turn)) !== null) startHeartbeat($)
    return next(e)
  })

  on('command.run', { command: 'meow' }, async ($, e) => {
    const [verb = '', value = ''] = e.args.trim().toLowerCase().split(/\s+/)
    const counter = await read($, golden)
    switch (verb) {
      case '':
        return { text: settingsLine(await settingsOf($), counter) }
      case 'coat': {
        const name = value === 'gray' ? 'grey' : value
        if (!isCoat(name)) return { text: `Unknown coat "${value}". ${USAGE}` }
        return { text: settingsLine(await saveSettings($, { coat: name }), counter) }
      }
      case 'speed':
        if (!isSpeed(value)) return { text: `Unknown speed "${value}". ${USAGE}` }
        return { text: settingsLine(await saveSettings($, { speed: value }), counter) }
      case 'quiet': {
        const quiet = value === 'on' ? true : value === 'off' ? false : !(await read($, isQuiet))
        return { text: settingsLine(await saveSettings($, { isQuiet: quiet }), counter) }
      }
      case 'on':
      case 'off':
        if (verb === 'off') {
          for (const id of [...players.keys()]) stopPlayer(id)
          await $.state.set(FINALE, null)
        }
        return { text: settingsLine(await saveSettings($, { isEnabled: verb === 'on' }), counter) }
      default:
        return { text: USAGE }
    }
  })

  on('turn.start', async ($, e, next) => {
    const now = await $.clock.now()
    const isNight = await isNightNow($)
    const isGolden = isGoldenRoll(Math.random)
    const counter = await read($, golden)
    const nextCounter = { turns: counter.turns + 1, golden: counter.golden + (isGolden ? 1 : 0) }
    await $.state.set(GOLDEN, nextCounter)
    await $.store.set(STORE_GOLDEN, nextCounter)
    await $.state.set(FINALE, null)
    await $.state.set(TURN, {
      id: e.turnId,
      startedAt: now,
      thinkingSince: now,
      phase: 'early',
      toolsRunning: 0,
      verb: pickVerb(Math.random),
      isGolden,
      isNight,
      variants: pickVariants(isNight, Math.random),
    })
    startHeartbeat($)
    return next(e)
  })

  // A tool running puts the cat at its desk; when it ends, thinking starts over.
  on('tool.call', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e)
    await changeTurn($, t => ({ ...t, toolsRunning: t.toolsRunning + 1, verb: pickVerb(Math.random, t.verb) }))
    try {
      return await next(e)
    } finally {
      const now = await $.clock.now()
      await changeTurn($, t => ({
        ...t,
        toolsRunning: Math.max(0, t.toolsRunning - 1),
        thinkingSince: now,
        phase: 'early',
      }))
    }
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e)
    stopHeartbeat()
    const ended = await read($, turn)
    await $.state.set(TURN, null)
    if (await read($, isEnabled)) {
      const kind = e.reason === 'answer' ? 'stretch' : 'startle'
      const now = await $.clock.now()
      const closing: PixelCatFinale = {
        id: e.turnId,
        kind,
        startedAt: now,
        isGolden: ended?.isGolden ?? false,
        isNight: ended?.isNight ?? (await isNightNow($)),
      }
      await $.state.set(FINALE, closing)
      const factor = SPEED_FACTOR[await read($, speed)]
      const look = lookFor(closing.isGolden ? 'golden' : await read($, coat), closing.isNight, ['yawn', 'twitch'])
      const lasts = animation(kind, look).durationMs * factor + 250
      $.clock.after(lasts, () => {
        void (async () => {
          const held = await $.state.get(FINALE)
          if (held.value?.id === closing.id) {
            await $.state.set(FINALE, null, { ifVersion: held.version })
          }
        })()
      })
    }
    return next(e)
  })

  // The indicator itself: the cat, then the engine's own line (elapsed time,
  // tokens, the interrupt hint) with a cat verb in place of its word.
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if (!(await read($, isEnabled))) return next(e)
    if (e.surface !== 'terminal' && e.surface !== 'desktop') return next(e)

    const t = await read($, turn)
    const settings = await settingsOf($)
    const mode: SpinnerMode = e.props.mode
    const id = chooseAnim({ phase: t?.phase ?? 'early', toolsRunning: t?.toolsRunning ?? 0, mode })
    const isNight = t?.isNight ?? false
    const variants = t?.variants ?? ['twitch', 'yawn']
    const look = lookFor(t?.isGolden === true ? 'golden' : settings.coat, isNight, variants)
    const factor = SPEED_FACTOR[settings.speed]
    const cat = await catElement($, e, id, look, factor, `${id}|${lookKey(look)}|${factor}`)
    if (cat === undefined) return next(e)

    const { Box } = $.ui.resolve(e)
    if (settings.isQuiet) return <Box flexDirection="row">{cat}</Box>

    const verb = t?.verb ?? VERBS[0]
    // On the desktop the word names the step ("Creating notes.md"): keep it after the verb.
    const step = e.surface === 'desktop' && e.props.word !== '' && e.props.word !== 'Working' ? e.props.word : undefined
    const line = await next({ ...e, props: { ...e.props, word: step === undefined ? verb : `${verb} · ${step}` } })
    return (
      <Box flexDirection="row" alignItems="center" gap={1}>
        {cat}
        {line}
      </Box>
    )
  })

  // The closing animation, in the band above the prompt; it fades, then the
  // band empties when the finale is cleared.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || !(await read($, isEnabled))) return next(e)
    const f = await read($, finale)
    if (f === null) return next(e)
    if (e.surface !== 'terminal' && e.surface !== 'desktop') return next(e)
    const settings = await settingsOf($)
    const look = lookFor(f.isGolden ? 'golden' : settings.coat, f.isNight, ['yawn', 'twitch'])
    const factor = SPEED_FACTOR[settings.speed]
    const cat = await catElement($, e, f.kind, look, factor, `${f.id}|${f.kind}|${lookKey(look)}|${factor}`)
    if (cat === undefined) return next(e)
    const { Box } = $.ui.resolve(e)
    return <Box flexDirection="row">{cat}</Box>
  })
}
