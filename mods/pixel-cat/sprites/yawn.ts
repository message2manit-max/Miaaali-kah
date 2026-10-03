// Idle variety: a big yawn.

import { over } from '../hooks/lib/sprite'
import { closedEyes, sitUp } from './sit'

export const yawnSmall = over(sitUp, closedEyes, [
  '', '', '', '', '', '', '', '', '',
  '     oo         ',
])

export const yawnWide = over(sitUp, closedEyes, [
  '', '', '', '', '', '', '', '', '',
  '    oppo        ',
  '    oooo        ',
])

export const yawn = [yawnSmall, yawnWide, yawnWide, yawnWide, yawnWide, yawnSmall]
