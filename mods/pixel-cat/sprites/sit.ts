// Sitting, facing the viewer: the tail swishes and the cat blinks now and then.
//
// Legend (every sprite file): '.' transparent, 'o' outline, 'f' fur, 's' stripe,
// 'l' light fur, 'm' muzzle, 'e' eye, 'n' nose, 'p' tongue, 'L'/'R' left/right
// ear, 't' tail, 'r' tail ring, 'w' paw, 'a'/'b' calico patches. The coat in
// hooks/lib/palette.ts decides which flat color each letter gets.
// In an overlay (`over`), ' ' keeps the pixel beneath and '.' erases it.

import { over } from '../hooks/lib/sprite'

export const body = [
  '................',
  '.oo......oo.....',
  '.oLo....oRo.....',
  '.oLLooooRRo.....',
  '.obsfssfsao.....',
  '.obbffffaao.....',
  '.ofeeffeefo.....',
  '.ofeeffeefo.....',
  '.osmmnnmmso.....',
  '.offmmmmffo.....',
  '.oofllllfoo.....',
  '..oallllfo......',
  '.oaallllbbo.....',
  '.oasfllfsbo.....',
  '.ofwwoowwfo.....',
  '.oooooooooo.....',
]

const tailBase = [
  '', '', '', '', '', '', '', '',
  '           orro ',
  '           otto ',
  '          ootto ',
  '          ootto ',
  '           orro ',
  '           tto  ',
  '           to   ',
  '           o    ',
]

const tailUp = over(tailBase, [
  '', '', '', '', '',
  '            oo  ',
  '           otto ',
  '           otto ',
])

const tailRight = over(tailBase, [
  '', '', '', '', '',
  '             oo ',
  '            otto',
  '           otto ',
])

const tailLeft = over(tailBase, [
  '', '', '', '', '',
  '           oo   ',
  '          otto  ',
  '           otto ',
])

export const closedEyes = [
  '', '', '', '', '', '',
  '   ff  ff       ',
  '   oo  oo       ',
]

export const sitUp = over(body, tailUp)
export const sitRight = over(body, tailRight)
export const sitLeft = over(body, tailLeft)
export const blink = over(body, tailUp, closedEyes)

/** One swish of the tail: up, right, up, left. */
export const swish = [sitUp, sitRight, sitRight, sitUp, sitLeft, sitLeft]
