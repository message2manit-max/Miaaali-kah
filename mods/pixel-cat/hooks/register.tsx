import type { Register, Timer } from 'claude-code'

import { ROWS, TICK_MS, frame, sceneWidth } from './cat'
import { catSvg } from './svg'

type Mode = 'requesting' | 'responding' | 'thinking' | 'tool-input' | 'tool-use'

const MODE_LABEL: Record<Mode, string> = {
  requesting: 'asking',
  responding: 'writing',
  thinking: 'thinking',
  'tool-input': 'getting tools ready',
  'tool-use': 'using tools',
}

const ALT = 'A pixel cat prowling, grooming, stretching, pouncing on a butterfly and napping'
const PANE = 'pixel-cat'

// One drawn spinner (the main agent's, or a subagent's), by its requestId.
type Live = { start: number; width: number; label: string; misses: number }

export const register: Register = on => {
  const live = new Map<string, Live>()
  let ticker: Timer | undefined

  const status = (s: Live, now: number) => `${s.label} \u00b7 ${Math.floor((now - s.start) / 1000)}s`
  const stop = () => {
    ticker?.cancel()
    ticker = undefined
  }

  // The phone and the editor draw no spinner a mod can reach, so there she
  // gets a little pane of her own for as long as the turn runs.
  on('prompt.submit', async ($, e, next) => {
    const surfaces = await $.session.surfaces()
    if (surfaces.some(s => s === 'mobile' || s === 'vscode')) await $.ui.open({ id: PANE, title: 'Pixel Cat' })
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    live.clear()
    stop()
    await $.ui.close({ id: PANE })
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, ($, e, next) => {
    if (e.surface === 'terminal') {
      const { Text } = $.ui.resolve(e)
      return <Text dimColor>The cat is in the spinner below.</Text>
    }
    const { Svg } = $.ui.resolve(e)
    return <Svg source={catSvg()} alt={ALT} width={320} isInteractive />
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if (e.surface === 'desktop') {
      const { Box, Svg, Text } = $.ui.resolve(e)
      return (
        <Box flexDirection="column">
          <Svg source={catSvg()} alt={ALT} width={320} isInteractive />
          <Text dimColor>
            {e.props.message ?? e.props.word}
            {e.props.suffix}
          </Text>
        </Box>
      )
    }
    if (e.surface !== 'terminal') return next(e)

    const now = await $.clock.now()
    const width = sceneWidth(e.viewport?.columns)
    const label = e.props.message ?? MODE_LABEL[e.props.mode]
    let s = live.get(e.requestId)
    if (s) Object.assign(s, { width, label, misses: 0 })
    else live.set(e.requestId, (s = { start: now, width, label, misses: 0 }))

    // One ticker repaints every live cat, and stops once none is left.
    ticker ??= $.clock.every(TICK_MS, async () => {
      const t = await $.clock.now()
      for (const [requestId, c] of live) {
        const cells = frame(Math.floor((t - c.start) / TICK_MS), c.width, status(c, t))
        const { deny } = await $.ui.blit({ requestId, key: 'cat', cells, columns: c.width, rows: ROWS })
        // A deny while the spinner resizes is brief; a run of them means it is gone.
        c.misses = deny ? c.misses + 1 : 0
        if (c.misses > 20) live.delete(requestId)
      }
      if (live.size === 0) stop()
    })

    const { Raster } = $.ui.resolve(e)
    return (
      <Raster
        key="cat"
        columns={width}
        rows={ROWS}
        cells={frame(Math.floor((now - s.start) / TICK_MS), width, status(s, now))}
      />
    )
  })
}
