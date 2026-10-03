// Chasing a yarn ball left and right: a side-view gallop (facing right; the
// animation mirrors it to run left) and the rolling yarn.

import { over, raise } from '../hooks/lib/sprite'

export const stand = [
  '................',
  '................',
  '........oo....oo',
  '.oo.....oLo..oRo',
  'otto....oLLooRRo',
  'orro....ofsfsaao',
  'otto....obffeefo',
  'ottoooooofffeefo',
  'ofsaasffbbffmmno',
  'oaasffsfbbfmmmmo',
  'oaaffffbbflllooo',
  'offffffffffllo..',
  'owwoooooooowwo..',
  'owwo......owwo..',
  'owwo......owwo..',
  'oooo......oooo..',
]

const legsSpread = [
  '', '', '', '', '', '', '', '', '', '', '', '',
  'owwoooooooowwoo.',
  'wwo........owwo.',
  'wo..........owwo',
  'o............oo.',
]

const legsMid = [
  '', '', '', '', '', '', '', '', '', '', '', '',
  'owwoooooooowwo..',
  '.owwo.....owwo..',
  '.owwo......owwo.',
  '.oooo......oooo.',
]

const legsTuck = [
  '', '', '', '', '', '', '', '', '', '', '', '',
  'oooowwooowwooo..',
  '...owwo.owwo....',
  '...oooo.oooo....',
  '................',
]

export const runSpread = over(stand, legsSpread)
export const runMid = over(stand, legsMid)
export const runTuck = raise(over(stand, legsTuck), 1)

/** One stride, facing right. */
export const gallop = [runSpread, runMid, runTuck, runMid]

export const yarnA = [
  '.ooo.',
  'oYyyo',
  'oyYyo',
  'oyyYo',
  '.ooo.',
]

export const yarnB = [
  '.ooo.',
  'oyyYo',
  'oyYyo',
  'oYyyo',
  '.ooo.',
]

export const yarnC = [
  '.ooo.',
  'oyYyo',
  'oYyYo',
  'oyYyo',
  '.ooo.',
]

/** The ball rolling: its highlight turns a quarter each frame. */
export const yarnRoll = [yarnA, yarnC, yarnB, yarnC]
