import {
  arch,
  capsule,
  crescent,
  diamond,
  disc,
  lens,
  polygon,
  quarter,
  rect,
  regular,
  ring,
  semicircle,
  triangle,
  turn,
  withRotate,
  type Direction,
} from "../primitives.js"
import type { Rng } from "../prng.js"
import type { IconElement, IconPalette } from "../types.js"
import type { IconTemplate } from "./template.js"

/**
 * Family A: one bold motif and plenty of air, with at most one small detail.
 * Triangles only point up or down (sideways reads as a play button), no disc
 * sits above a dome (the default avatar), and there are no thick half rings or
 * arches with a doorway (the letters U, C and n).
 */

const DIRECTIONS: readonly Direction[] = ["up", "right", "down", "left"]

type Motif = (rng: Rng, fill: string) => IconElement

const MOTIFS: readonly Motif[] = [
  (_, f) => disc(f, 40, 40, 25),
  (rng, f) => rect(f, 18, 18, 44, 44, rng.pick([0, 10])),
  (_, f) => diamond(f, 40, 40, 30),
  (_, f) => regular(f, 40, 40, 28, 6),
  (rng, f) => (rng.pick([0, 1]) ? triangle(f, 40, 36, 27, "up") : triangle(f, 40, 44, 27, "down")),
  (_, f) => arch(f, 40, 64, 42, 48),
  (rng, f) => {
    const dir = rng.pick(DIRECTIONS)
    const shift = 14
    const [x, y] = { up: [40, 40 + shift], down: [40, 40 - shift], left: [40 + shift, 40], right: [40 - shift, 40] }[dir]
    return semicircle(f, x, y, 29, dir)
  },
  (_, f) => ring(f, 40, 40, 27, 13),
  (rng, f) => capsule(f, 40, 40, 60, 28, rng.pick([45, -45])),
  (rng, f) => {
    const dir = rng.pick(DIRECTIONS)
    return crescent(f, 40, 40, 27, 21, 15, dir)
  },
]

const centered: IconTemplate = {
  id: "centered",
  build: (rng, { primary }) => [rng.pick(MOTIFS)(rng, primary)],
}

const split: IconTemplate = {
  id: "split",
  build: (rng, { primary, secondary }) => {
    const angle = rng.pick([0, 45, 90, 135])
    switch (rng.int(3)) {
      case 0:
        return [semicircle(primary, 40, 40, 26, "left", turn(angle)), semicircle(secondary, 40, 40, 26, "right", turn(angle))]
      case 1:
        return [
          withRotate(rect(primary, 18, 18, 22, 44), turn(angle)),
          withRotate(rect(secondary, 40, 18, 22, 44), turn(angle)),
        ]
      default:
        return [
          polygon(primary, [[40, 14], [40, 62], [14, 62]]),
          polygon(secondary, [[40, 14], [66, 62], [40, 62]]),
        ]
    }
  },
}

const cutout: IconTemplate = {
  id: "cutout",
  build: (rng, { primary, secondary, background }) => {
    const hole = rng.pick([background, background, secondary])
    switch (rng.int(5)) {
      case 0:
        return [disc(primary, 40, 40, 27), rect(hole, 30, 30, 20, 20)]
      case 1:
        return [rect(primary, 16, 16, 48, 48, 10), disc(hole, 40, 40, 12)]
      case 2:
        return [diamond(primary, 40, 40, 32), disc(hole, 40, 40, 9)]
      case 3:
        return [arch(primary, 40, 66, 46, 52), disc(hole, 40, 38, 10)]
      default:
        return [regular(primary, 40, 40, 30, 6), regular(hole, 40, 40, 13, 6)]
    }
  },
}

const rotated: IconTemplate = {
  id: "rotated",
  build: (rng, { primary }) => {
    switch (rng.int(4)) {
      case 0:
        return [semicircle(primary, 40, 40, 30, "up", turn(rng.pick([45, 135, 225, 315])))]
      case 1:
        return [withRotate(rect(primary, 18, 18, 44, 44, 8), turn(rng.pick([15, 30, -15, -30])))]
      case 2:
        return [lens(primary, 18, 40, 36, 62, 40, 36, turn(rng.pick([45, -45])))]
      default:
        return [arch(primary, 40, 62, 38, 44, turn(rng.pick([45, -45, 135, -135])))]
    }
  },
}

function offsetDetail(rng: Rng, { primary, secondary }: IconPalette): IconElement[] {
  switch (rng.int(4)) {
    case 0:
      return [semicircle(primary, 40, 80, 34, "up"), disc(secondary, 60, 22, 9)]
    case 1:
      return [quarter(primary, 0, 80, 58, "ne"), disc(secondary, 60, 20, 9)]
    case 2:
      return [disc(primary, 48, 48, 24), disc(secondary, 17, 17, 8)]
    default:
      return [arch(primary, 30, 80, 38, 60), disc(secondary, 62, 20, 9)]
  }
}

const offset: IconTemplate = { id: "offset", rotatable: true, build: offsetDetail }

/** Order is part of the v1 spec. Centred carries double weight: it is the family's core. */
export const GEOMETRIC_TEMPLATES: readonly IconTemplate[] = [centered, centered, split, cutout, rotated, offset]
