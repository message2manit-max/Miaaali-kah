// Curled up asleep, side view: the back rises and falls, small z letters float up.

import { over } from '../hooks/lib/sprite'

export const curl = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '........oo....oo',
  '...ooooooLo..oRo',
  '..obbsffoLLooRRo',
  '.obbffsfofsfsaao',
  'oaasffsfofffoofo',
  'oaafsffsofffmmno',
  'ooooooooooofmmmo',
  'otrttrttrtoowwo.',
  'ooooooooooooooo.',
]

export const curlBreathe = over(curl, [
  '', '', '', '', '', '', '',
  '    oooo        ',
  '...offffo       ',
])

export const breathe = [curl, curl, curlBreathe, curlBreathe]

export const zBig = [
  'zzzz',
  '..z.',
  '.z..',
  'zzzz',
]

export const zSmall = [
  'zzz',
  '.z.',
  'zzz',
]
