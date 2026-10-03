// At a tiny desk, pawing at a keyboard: the cat sits side-on, facing right.

import { over } from '../hooks/lib/sprite'

export const sideSit = [
  '................',
  '................',
  '........oo....oo',
  '........oLo..oRo',
  '........oLLooRRo',
  '........ofsfsaao',
  '........obffeefo',
  '......ooofffeefo',
  '.....offffffmmno',
  '.oo.oaasffffmmmo',
  'ottoaasffffflooo',
  'orrabbsfffffllo.',
  '.otbbsfffffffo..',
  '.otfsfffffffo...',
  '..offfffwwfo....',
  '..ooooooooooo...',
]

const pawUp = [
  '', '', '', '', '', '', '', '', '', '',
  '            oooo',
  '           lwwwo',
  '           oooo ',
]

const pawDown = [
  '', '', '', '', '', '', '', '', '', '', '',
  '           loooo',
  '           lwwwo',
  '            ooo ',
]

export const typeUp = over(sideSit, pawUp)
export const typeDown = over(sideSit, pawDown)
export const tap = [typeUp, typeDown, typeUp, typeDown, typeDown, typeUp]

/** Desk, keyboard and a little monitor; drawn behind the cat. */
export const desk = [
  '.......ooooooo.',
  '.......oMMMMMo.',
  '.......oMGGMMo.',
  '.......oMMGGMo.',
  '.......ooooooo.',
  'ooooooo..oJo...',
  'oKJKJKo..oJo...',
  'ooooooooooooooo',
  'oDDDDDDDDDDDDDo',
  'oEoooooooooooEo',
  'oEo.........oEo',
]

/** The screen's text scrolls as the cat types. */
export const deskScroll = over(desk, [
  '',
  '        GMGGM  ',
  '        MMGGM  ',
  '        MGGMM  ',
])
