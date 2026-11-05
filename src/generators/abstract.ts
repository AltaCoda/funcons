import { arch, diamond, disc, lens, polygon, quarter, rect, semicircle, threeQuarters, wave, type Quadrant } from "../primitives.js"
import type { IconElement } from "../types.js"
import type { IconTemplate } from "./template.js"

/**
 * Family B: two or three large shapes that bleed off the tile, snapped to a
 * 10-unit grid. Where shapes overlap the overlap is drawn as its own shape, so
 * layering stays flat and needs no clip paths or blend modes.
 */

const venn: IconTemplate = {
  id: "venn",
  rotatable: true,
  build: (rng, { primary, secondary, background }) => {
    const [ax, ay, bx, by, r] = rng.pick([
      [26, 40, 54, 40, 25],
      [28, 30, 52, 50, 26],
      [24, 24, 52, 52, 30],
    ])
    return [disc(primary, ax, ay, r), disc(secondary, bx, by, r), lens(background, ax, ay, r, bx, by, r)]
  },
}

const counterchange: IconTemplate = {
  id: "counterchange",
  rotatable: true,
  build: (rng, { primary, secondary, background }) => [
    disc(primary, 40, 40, 24),
    rect(primary, 40, 0, 40, 80),
    semicircle(rng.pick([background, secondary]), 40, 40, 24, "right"),
  ],
}

const diagonal: IconTemplate = {
  id: "diagonal",
  rotatable: true,
  build: (rng, { primary, secondary }) => [
    polygon(primary, [[0, 80], [80, 80], [80, 0]]),
    rng.pick([
      disc(secondary, 40, 40, 20),
      disc(secondary, 26, 26, 14),
      quarter(secondary, 0, 0, 44, "se"),
      diamond(secondary, 40, 40, 22),
    ]),
  ],
}

const horizon: IconTemplate = {
  id: "horizon",
  rotatable: true,
  build: (rng, { primary, secondary }) => {
    const r = rng.pick([50, 58, 66])
    const onRim = r * 0.707107
    return [disc(primary, 0, 80, r), disc(secondary, onRim, 80 - onRim, rng.pick([12, 16]))]
  },
}

const cornerOverlap: IconTemplate = {
  id: "corner-overlap",
  rotatable: true,
  build: (rng, { primary, secondary, background }) => {
    const [x, y] = rng.pick([
      [50, 30],
      [40, 40],
    ])
    const plate = rect(primary, 0, y, x, 80 - y)
    return rng.pick([0, 1])
      ? [plate, threeQuarters(secondary, x, y, 24, "sw"), quarter(background, x, y, 24, "sw")]
      : [disc(secondary, x, y, 24), plate]
  },
}

const orbitArch: IconTemplate = {
  id: "orbit-arch",
  rotatable: true,
  build: (_, { primary, secondary }) => [arch(primary, 30, 80, 44, 62), disc(secondary, 58, 28, 18)],
}

const waves: IconTemplate = {
  id: "waves",
  rotatable: true,
  build: (rng, { primary, secondary }) => {
    const [upper, lower] = rng.pick([
      [26, 56],
      [32, 62],
    ])
    return [wave(primary, upper), wave(secondary, lower)]
  },
}

/** Which way each of the four 40-unit cells' quarter disc faces, clockwise from top left. */
const TILE_ARRANGEMENTS: readonly (readonly Quadrant[])[] = [
  ["se", "sw", "nw", "ne"],
  ["ne", "se", "sw", "nw"],
  ["se", "se", "nw", "nw"],
  ["se", "ne", "nw", "sw"],
  ["sw", "se", "sw", "se"],
  ["ne", "nw", "se", "sw"],
]

const APEX_IN_CELL: Record<Quadrant, readonly [number, number]> = {
  se: [0, 0],
  sw: [40, 0],
  nw: [40, 40],
  ne: [0, 40],
}

const CELLS = [
  [0, 0],
  [40, 0],
  [40, 40],
  [0, 40],
] as const

const tiles: IconTemplate = {
  id: "tiles",
  rotatable: true,
  build: (rng, { primary, secondary }) => {
    const arrangement = rng.pick(TILE_ARRANGEMENTS)
    const colors = rng.pick([
      [primary, secondary, primary, secondary],
      [primary, primary, secondary, secondary],
      [primary, primary, primary, secondary],
    ])
    return arrangement.map((quadrant, i): IconElement => {
      const [apexX, apexY] = APEX_IN_CELL[quadrant]
      return quarter(colors[i], CELLS[i][0] + apexX, CELLS[i][1] + apexY, 40, quadrant)
    })
  },
}

/** Order is part of the v1 spec. */
export const ABSTRACT_TEMPLATES: readonly IconTemplate[] = [
  venn,
  counterchange,
  diagonal,
  horizon,
  cornerOverlap,
  orbitArch,
  waves,
  tiles,
  tiles,
]
