import { expect, mock, test } from 'claude-code/testing'

import { ROWS, frame } from './cat'

const SPINNER = {
  component: 'Spinner',
  requestId: 'main',
  viewport: { columns: 80, rows: 30 },
  props: { word: 'Sauteing', message: null, suffix: '…', mode: 'thinking' },
} as const

test('the spinner becomes a pixel cat on the terminal, and keeps moving', async ($, on) => {
  const clock = mock.clock(on, { now: 1000 })
  const ui = await $.ui.mount({ plugin: 'pixel-cat', surface: 'terminal', ...SPINNER })
  const cat = await ui.find({ key: 'cat' })
  expect(cat).toBeDefined()
  await clock.advance(2000) // twenty frames of blits
  expect(await ui.find({ key: 'cat' })).toBeDefined()
  await ui.unmount()
  await clock.advance(5000) // the ticker gives up on a cat nobody draws
})

test('other surfaces keep their own spinner', async ($, on) => {
  mock.clock(on)
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>Sauteing</Text>
  })
  const ui = await $.ui.mount({ plugin: 'pixel-cat', surface: 'desktop', ...SPINNER })
  expect(await ui.find({ key: 'cat' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /Sauteing/ })).toBeDefined()
  await ui.unmount()
})

test('every frame of the routine packs the full grid', async () => {
  for (const width of [30, 52, 72]) {
    for (let tick = 0; tick < 400; tick += 7) {
      const cells = frame(tick, width, 'thinking · 3s 😀')
      expect(cells.length).toBe((Math.ceil((width * ROWS * 12) / 3) * 4))
    }
  }
})
