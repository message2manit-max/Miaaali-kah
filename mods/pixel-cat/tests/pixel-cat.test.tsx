import { describe, expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On, RenderPropsOf } from 'claude-code'

import { VERBS } from '../hooks/lib/mood'
import { palette, themed } from '../hooks/lib/palette'
import { cellsFor, decodeCells, gridAt, RASTER_COLUMNS, RASTER_ROWS } from '../hooks/lib/raster'
import { animation, STAGE_H, STAGE_W } from '../hooks/lib/stage'

const THINKING: RenderPropsOf['Spinner'] = { word: 'Sauteing', message: null, suffix: '…', mode: 'thinking' }
const SPINNER = { plugin: 'pixel-cat', component: 'Spinner', requestId: 'main' } as const
const BAND: RenderPropsOf['AbovePrompt'] = {
  hasSurvey: false,
  isWorking: false,
  maxRows: 12,
  bodyColumns: 100,
  scroll: { offset: 0, bodyRows: 12 },
  view: {},
}

/** The engine beneath the plugin: its own spinner line, a session, tools that answer. */
function engine(on: On, words: string[], options: { blit?: boolean } = {}) {
  on('ui.render', { component: 'Spinner' }, ($, e) => {
    words.push(e.props.word)
    const { Text } = $.ui.resolve(e)
    return <Text>{e.props.word}… (12s · 300 tokens · esc to interrupt)</Text>
  })
  on('ui.render', { component: 'AbovePrompt' }, $ => {
    void $
    return { type: 'Box', props: {}, children: [] }
  })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('turn.complete', () => ({ text: '' }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  if (options.blit !== false) on('ui.blit', () => ({ value: {} }))
}

const ENGINE_LINE = { type: 'Text', text: /esc to interrupt/ } as const

const meow = ($: Engine, args: string) =>
  $.command.run({
    command: 'meow',
    args,
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 120 },
  })

async function start($: Engine): Promise<void> {
  await $.session.start({ cwd: '/work', surface: 'terminal', isInteractive: true })
}

describe('terminal', () => {
  test('the cat is half blocks that line up with its pixels', async ($, on) => {
    mock.clock(on)
    mock.store(on)
    engine(on, [])
    await start($)
    const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal', props: THINKING })
    const raster = await ui.find({ type: 'Raster', key: 'cat' })
    expect(raster).toBeDefined()
    expect(raster?.props.columns).toBe(RASTER_COLUMNS)
    expect(raster?.props.rows).toBe(RASTER_ROWS)

    // What it should be: the sitting cat's first frame, the dark theme's colors.
    const anim = animation('sit', { skin: 'tabby', isNight: false, variants: ['twitch', 'yawn'] })
    const colors = themed(palette('tabby'), true)
    const grid = gridAt(anim, 0, 0, true)
    expect(raster?.props.cells).toBe(cellsFor(grid, colors))

    // And cell by cell: two pixel rows per text row, the right glyph and colors.
    const { glyphs, words } = decodeCells(String(raster?.props.cells))
    expect(glyphs).toHaveLength(STAGE_H / 2)
    for (let row = 0; row < RASTER_ROWS; row++) {
      expect([...(glyphs[row] ?? '')]).toHaveLength(STAGE_W)
      for (let x = 0; x < STAGE_W; x++) {
        const top = grid[row * 2]?.[x] ?? '.'
        const bottom = grid[row * 2 + 1]?.[x] ?? '.'
        const glyph = glyphs[row]?.[x]
        const at = (row * STAGE_W + x) * 3
        const color = (c: string) => parseInt((colors[c] ?? '#000000').slice(1), 16)
        if (top !== '.') {
          expect(glyph).toBe('▀')
          expect(words[at + 1]).toBe(color(top))
          expect(words[at + 2]).toBe(bottom === '.' ? 0x01000000 : color(bottom))
        } else if (bottom !== '.') {
          expect(glyph).toBe('▄')
          expect(words[at + 1]).toBe(color(bottom))
        } else {
          expect(glyph).toBe(' ')
        }
      }
    }
    // The ears' tips are the top of the head: outline on the second text row.
    expect(glyphs[1]?.slice(8, 20)).toContain('▄')
    await ui.unmount()
  })

  test('frames swap on the clock and the clock stops once the cat unmounts', async ($, on) => {
    const clock = mock.clock(on)
    mock.store(on)
    let blits = 0
    let isMounted = true
    engine(on, [], { blit: false })
    on('ui.blit', () => {
      blits += 1
      return { value: isMounted ? {} : { deny: 'not mounted' } }
    })
    await start($)
    const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal', props: THINKING })
    await clock.advance(150 * 4)
    expect(blits).toBe(4)
    await ui.unmount()
    isMounted = false
    await clock.advance(150)
    const afterUnmount = blits
    await clock.advance(150 * 10)
    expect(blits).toBe(afterUnmount)
  })

  test('the engine line keeps its time and tokens with a cat verb', async ($, on) => {
    mock.clock(on)
    mock.store(on)
    const words: string[] = []
    engine(on, words)
    await start($)
    const ui = await $.ui.mount({ ...SPINNER, surface: 'terminal', props: THINKING })
    const line = await ui.find(ENGINE_LINE)
    expect(line?.text).toContain('12s · 300 tokens · esc to interrupt')
    expect(VERBS as readonly string[]).toContain(words[words.length - 1] ?? '')
    await ui.unmount()
  })
})

describe('desktop', () => {
  test('one SVG per animation: rects, crisp edges, steps(), dark outline, reduced motion', async ($, on) => {
    mock.clock(on)
    mock.store(on)
    engine(on, [])
    await start($)
    const ui = await $.ui.mount({ ...SPINNER, surface: 'desktop', props: THINKING })
    const svg = await ui.find({ type: 'Svg' })
    const source = String(svg?.props.source)
    expect(svg?.props.width).toBe(STAGE_W * 3)
    expect(svg?.props.height).toBe(STAGE_H * 3)
    expect(source).toContain('shape-rendering="crispEdges"')
    expect(source).toContain('<rect ')
    expect(source).toMatch(/\.fr\{animation:show \d+ms steps\(1,end\) infinite\}/)
    expect(source).toContain('animation-delay:-')
    expect(source).toContain('@media (prefers-color-scheme:dark){')
    expect(source).toContain('@media (prefers-reduced-motion:reduce){')
    expect(source.length).toBeLessThan(131072)
    expect(String(svg?.props.alt)).toContain('sits')
    await ui.unmount()
  })
})

describe('what the cat does', () => {
  const altOf = async ($: Engine, mode: RenderPropsOf['Spinner']['mode'] = 'thinking') => {
    const ui = await $.ui.mount({ ...SPINNER, surface: 'desktop', props: { ...THINKING, mode } })
    const alt = String((await ui.find({ type: 'Svg' }))?.props.alt)
    await ui.unmount()
    return alt
  }

  test('sits, chases after 10 s, sleeps after 40 s of thinking, types while a tool runs', async ($, on) => {
    const clock = mock.clock(on)
    mock.store(on)
    engine(on, [])
    let finishTool: () => void = () => {}
    on('tool.call', () => new Promise(resolve => {
      finishTool = () => resolve({ result: 'ok' })
    }))
    await start($)
    await $.turn.start({ text: 'hi', turnId: 't1' })
    expect(await altOf($)).toContain('sits')
    await clock.advance(11_000)
    expect(await altOf($)).toContain('yarn')
    await clock.advance(30_000)
    expect(await altOf($, 'thinking')).toContain('sleeps')
    expect(await altOf($, 'responding')).toContain('yarn')

    const running = $.tool.call({ tool: 'Bash', command: 'ls' })
    await clock.settle()
    expect(await altOf($, 'tool-use')).toContain('desk')
    finishTool()
    await running
    expect(await altOf($, 'thinking')).toContain('sits')
  })

  test('a finished turn stretches in the band, then the band empties', async ($, on) => {
    const clock = mock.clock(on)
    mock.store(on)
    engine(on, [])
    await start($)
    await $.turn.start({ text: 'hi', turnId: 't2' })
    await $.turn.complete({ answer: 'done', durationMs: 900, isAborted: false, turnId: 't2', reason: 'answer' })
    const band = await $.ui.mount({ plugin: 'pixel-cat', component: 'AbovePrompt', surface: 'desktop', props: BAND })
    const svg = await band.find({ type: 'Svg' })
    expect(String(svg?.props.alt)).toContain('stretches')
    expect(String(svg?.props.source)).toContain('@keyframes fade')
    await band.unmount()
    await clock.advance(3_500)
    const later = await $.ui.mount({ plugin: 'pixel-cat', component: 'AbovePrompt', surface: 'desktop', props: BAND })
    expect(await later.find({ type: 'Svg' })).toBeUndefined()
    await later.unmount()
  })

  test('an interrupted turn makes it hop, startled', async ($, on) => {
    mock.clock(on)
    mock.store(on)
    engine(on, [])
    await start($)
    await $.turn.start({ text: 'hi', turnId: 't3' })
    await $.turn.complete({ answer: '', durationMs: 400, isAborted: true, turnId: 't3', reason: 'aborted' })
    const band = await $.ui.mount({ plugin: 'pixel-cat', component: 'AbovePrompt', surface: 'terminal', props: BAND })
    expect(await band.find({ type: 'Raster' })).toBeDefined()
    await band.unmount()
    const desk = await $.ui.mount({ plugin: 'pixel-cat', component: 'AbovePrompt', surface: 'desktop', props: BAND })
    expect(String((await desk.find({ type: 'Svg' }))?.props.alt)).toContain('startled')
    await desk.unmount()
  })
})

describe('/meow', () => {
  test('shows the settings in one line and changes them', async ($, on) => {
    mock.clock(on)
    mock.store(on)
    const words: string[] = []
    engine(on, words)
    await start($)
    const shown = await meow($, '')
    expect(shown.text).toBe('pixel-cat: on · coat tabby · speed normal · quiet off · golden cats 0 in 0 turns')
    expect((await meow($, 'coat calico')).text).toContain('coat calico')
    expect((await meow($, 'coat zebra')).text).toContain('Unknown coat')
    expect((await meow($, 'speed fast')).text).toContain('speed fast')

    // quiet: only the cat, no status text.
    await meow($, 'quiet')
    words.length = 0
    const quiet = await $.ui.mount({ ...SPINNER, surface: 'terminal', props: THINKING })
    expect(await quiet.find({ type: 'Raster' })).toBeDefined()
    expect(await quiet.find(ENGINE_LINE)).toBeUndefined()
    await quiet.unmount()

    // off: the engine's own indicator, untouched; on: the cat again.
    await meow($, 'off')
    const off = await $.ui.mount({ ...SPINNER, surface: 'terminal', props: THINKING })
    expect(await off.find({ type: 'Raster' })).toBeUndefined()
    expect((await off.find(ENGINE_LINE))?.text).toContain('Sauteing')
    await off.unmount()
    await meow($, 'on')
    await meow($, 'quiet off')
    const back = await $.ui.mount({ ...SPINNER, surface: 'terminal', props: THINKING })
    expect(await back.find({ type: 'Raster' })).toBeDefined()
    expect(await back.find(ENGINE_LINE)).toBeDefined()
    await back.unmount()
  })
})
