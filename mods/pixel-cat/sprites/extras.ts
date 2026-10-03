// Extras laid over any animation: the nightcap (after 11 pm) and the golden
// cat's sparkles. A cap finds the head by its ears ('L', 'R') and sits at
// that offset from their top-left corner; its tip flops back with a pompom.

/** For a head facing the viewer; brim on the head's top edge. */
export const capFront = [
  '.oo...........',
  'oCCoooooo.....',
  'oCCcccCccoo...',
  '.ooccCcccccoo.',
  '...occcCccccco',
  '..oCCCCCCCCCCo',
]
export const CAP_FRONT_AT = { x: -4, y: -4 }

/** For a head seen side-on, facing right (mirrored when it faces left). */
export const capSide = [
  '.oo.........',
  'oCCoooooooo.',
  'oCCocccCccco',
  '.ooocCcccCco',
  '....oCCCCCCo',
]
export const CAP_SIDE_AT = { x: -5, y: -3 }

export const sparkleA = [
  '.g.',
  'gkg',
  '.g.',
]

export const sparkleB = [
  '...',
  '.k.',
  '...',
]
