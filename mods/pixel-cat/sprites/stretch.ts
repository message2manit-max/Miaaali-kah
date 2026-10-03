// The big stretch when a turn completes: side view, front paws out, rump up,
// then a pixel heart pops above.

import { stand } from './chase'

export { stand }

export const halfStretch = [
  '................',
  '................',
  '.oo.............',
  'otto............',
  'orro....oo....oo',
  'otto....oLo..oRo',
  'ottooooooLLooRRo',
  'oaasffsfofsfsaao',
  'oaaffsfffbffeefo',
  'offsfffffbffeefo',
  'offfffffffffmmno',
  'offfffffffmmmmoo',
  'owwooooooooowwo.',
  'owwo.......owwo.',
  'owwo........owwo',
  'oooo........oooo',
]

export const fullStretch = [
  '................',
  '.oo.............',
  'otto............',
  'orro............',
  'otto............',
  'ottoooo.........',
  'oaasffsooo....oo',
  'oaaffsffoLo..oRo',
  'offsffsfoLLooRRo',
  'offffsffofsfsaao',
  'offsfffffbffoofo',
  'offfffffffffffff'.slice(0, 15) + 'o',
  'owwoooooofffmmno',
  'owwo....oooooooo',
  'owwo...owwwwwwwo',
  'oooo...ooooooooo',
]

export const heart = [
  '.oo.oo.',
  'ohHohho',
  'ohhhhho',
  '.ohhho.',
  '..oho..',
  '...o...',
]
