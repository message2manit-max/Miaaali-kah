// Idle variety: licking a paw.

import { over } from '../hooks/lib/sprite'
import { closedEyes, sitUp } from './sit'

// The right forepaw leaves the ground...
const pawTucked = [
  '', '', '', '', '', '', '', '', '', '', '', '', '',
  '        f       ',
  '       ff       ',
]

export const pawRaised = over(sitUp, pawTucked, [
  '', '', '', '', '', '', '', '', '',
  '      oooo      ',
  '      owwo      ',
  '      offo      ',
  '      offo      ',
])

export const pawLick = over(sitUp, pawTucked, closedEyes, [
  '', '', '', '', '', '', '', '',
  '      owwo      ',
  '     powwo      ',
  '      offo      ',
  '      offo      ',
])

export const pawRest = over(sitUp, pawTucked, closedEyes, [
  '', '', '', '', '', '', '', '',
  '      owwo      ',
  '      owwo      ',
  '      offo      ',
  '      offo      ',
])

export const lick = [pawRaised, pawLick, pawRest, pawLick, pawRest, pawRaised]
