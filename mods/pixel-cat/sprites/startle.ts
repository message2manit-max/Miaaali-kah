// Interrupted or an error: a startled hop with the ears flattened, then the
// cat sits back down.

import { over } from '../hooks/lib/sprite'
import { body, sitUp } from './sit'

export { sitUp }

const flatEars = [
  '................',
  '................',
  '................',
  'ooooooooooooo...',
  'oLLofssfsoRRo...',
]

const wideEyes = [
  '', '', '', '',
  '',
  '   ee  ee       ',
  '   eo  oe       ',
  '   ee  ee       ',
  '',
  '     oo         ',
]

const puffedTail = [
  '', '', '', '',
  '           ooo  ',
  '          ottto ',
  '         otrrrto',
  '         ottttto',
  '         ottttto',
  '         otrrrto',
  '         ottttto',
  '         ottttto',
  '          otrro ',
  '          ottto ',
  '           tto  ',
  '           o    ',
]

export const startled = over(body, flatEars, wideEyes, puffedTail)
