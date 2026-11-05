import type { Rng } from "../prng.js"
import type { IconElement, IconPalette } from "../types.js"

/**
 * One approved composition. Randomness only ever operates inside a template:
 * it chooses among the template's own allowed shapes, sizes and positions.
 */
export interface IconTemplate {
  id: string
  /** Any of the four turns reads well, so the generator may apply one. */
  rotatable?: boolean
  build(rng: Rng, palette: IconPalette): IconElement[]
}
