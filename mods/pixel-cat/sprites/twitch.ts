// Idle variety: one ear flicks.

import { over } from '../hooks/lib/sprite'
import { sitUp } from './sit'

export const earFlick = over(sitUp, [
  '',
  ' ..             ',
  'oo..            ',
  'oLLL            ',
])

export const twitch = [earFlick, sitUp, earFlick, earFlick, sitUp]
