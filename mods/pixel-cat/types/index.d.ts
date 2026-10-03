// pixel-cat's state contract: every value the mod keeps in $.state.

export type PixelCatCoat = 'tabby' | 'black' | 'grey' | 'calico' | 'siamese'
export type PixelCatSpeed = 'slow' | 'normal' | 'fast'
export type PixelCatVariant = 'yawn' | 'twitch' | 'lick'
/** How long the cat has been thinking: under 10 s, under 40 s, longer. */
export type PixelCatPhase = 'early' | 'mid' | 'late'

/** The golden-cat counter: main turns seen, and how many brought the golden cat. */
export type PixelCatGolden = { turns: number; golden: number }

/** The turn that is running, as far as the drawing needs it. */
export type PixelCatTurn = {
  id: string
  startedAt: number
  /** When the cat last started thinking: the turn's start or a tool's end. */
  thinkingSince: number
  phase: PixelCatPhase
  toolsRunning: number
  verb: string
  isGolden: boolean
  isNight: boolean
  variants: [PixelCatVariant, PixelCatVariant]
}

/** The animation that closes a turn in the band above the prompt. */
export type PixelCatFinale = {
  id: string
  kind: 'stretch' | 'startle'
  startedAt: number
  isGolden: boolean
  isNight: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'pixel-cat': {
      coat: PixelCatCoat
      speed: PixelCatSpeed
      isQuiet: boolean
      isEnabled: boolean
      golden: PixelCatGolden
      turn: PixelCatTurn | null
      finale: PixelCatFinale | null
    }
  }
}
