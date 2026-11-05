import {
  arch,
  capsule,
  crescent,
  diamond,
  disc,
  lens,
  quarterRing,
  rect,
  ring,
  scallop,
  semicircle,
  sparkle,
  star,
  triangle,
  turn,
} from "../primitives.js"
import type { IconElement } from "../types.js"
import type { IconTemplate } from "./template.js"

/**
 * Family C: a single silhouette in one colour on the background, so the palette
 * does the identifying. Only ever two colours. Kept out because they already
 * mean something: crosses, six-point stars, a crescent with a star, octagons
 * (stop sign), a bar across a disc (no entry), cropped diamonds (envelope,
 * arrow), and dots of one size in a grid (dice, app launcher).
 */

const centered: IconTemplate = {
  id: "silhouette",
  build: (rng, { primary }) => [
    rng.pick<IconElement>([
      star(primary, 40, 40, 33, 22, 12),
      star(primary, 40, 40, 33, 17, 8),
      sparkle(primary, 40, 40, 35),
      scallop(primary, 40, 40, 26, 8),
      scallop(primary, 40, 40, 28, 12),
      scallop(primary, 40, 40, 20, 6),
      star(primary, 40, 40, 33, 27, 24),
      star(primary, 40, 40, 34, 14, 4),
    ]),
  ],
}

const oversized: IconTemplate = {
  id: "oversized",
  rotatable: true,
  build: (rng, { primary }) => [
    rng.pick<IconElement>([
      star(primary, 56, 56, 58, 38, 12),
      scallop(primary, 58, 58, 40, 8),
      sparkle(primary, 54, 54, 62),
      star(primary, 60, 60, 66, 30, 8),
      ring(primary, 0, 80, 66, 34),
      quarterRing(primary, 0, 80, 62, 26, "ne"),
      scallop(primary, 40, 80, 36, 12),
      crescent(primary, 28, 40, 44, 38, 22, "right"),
    ]),
  ],
}

const repeated: IconTemplate = {
  id: "repeated",
  build: (rng, { primary }) => {
    switch (rng.int(6)) {
      case 0:
        return [disc(primary, 24, 24, 16), disc(primary, 56, 24, 16), disc(primary, 56, 56, 16), disc(primary, 24, 56, 16)]
      case 1:
        return [disc(primary, 16, 64, 8), disc(primary, 32.3, 47.7, 12), disc(primary, 54.9, 25.1, 17)]
      case 2:
        return [semicircle(primary, 40, 12, 26, "down"), semicircle(primary, 40, 68, 26, "up")]
      case 3:
        return [triangle(primary, 40, 24, 16, "down"), triangle(primary, 40, 56, 16, "up")]
      case 4:
        return [
          capsule(primary, 20, 20, 60, 14, 135),
          capsule(primary, 40, 40, 72, 14, 135),
          capsule(primary, 60, 60, 60, 14, 135),
        ]
      default:
        // Tilted: upright petals read as a cross, diagonal ones as a close button.
        return [20, 110, 200, 290].map((angle) => lens(primary, 35.55, 18.45, 22, 18.45, 35.55, 22, turn(angle)))
    }
  },
}

const cutout: IconTemplate = {
  id: "bold-cutout",
  build: (rng, { primary, background }) => {
    switch (rng.int(5)) {
      case 0:
        return [disc(primary, 40, 40, 33), sparkle(background, 40, 40, 25)]
      case 1:
        return [rect(primary, 12, 12, 56, 56, 14), star(background, 40, 40, 22, 11, 8)]
      case 2:
        return [rect(primary, 0, 16, 80, 64), arch(background, 40, 80, 32, 46)]
      case 3:
        return [disc(primary, 40, 40, 33), diamond(background, 40, 40, 17)]
      default:
        return [scallop(primary, 40, 40, 27, 12), disc(background, 40, 40, 13)]
    }
  },
}

/** Order is part of the v1 spec. */
export const COLOR_TEMPLATES: readonly IconTemplate[] = [centered, centered, oversized, repeated, cutout]
