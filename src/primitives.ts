import type { IconElement, IconRotation, PathElement, RectElement } from "./types.js"

export type Direction = "up" | "right" | "down" | "left"
export type Quadrant = "ne" | "se" | "sw" | "nw"
type Point = readonly [number, number]

/**
 * Coordinates round to 2 decimals. Geometry uses only + - * / sqrt and the table
 * below, never Math.sin/cos, whose low bits are allowed to differ by engine.
 */
const round = (v: number) => Math.round(v * 100) / 100

/** cos(k * 7.5deg) for k = 0..12. */
const COS_TABLE = [
  1, 0.991445, 0.965926, 0.92388, 0.866025, 0.793353, 0.707107, 0.608761, 0.5, 0.382683, 0.258819, 0.130526, 0,
]

/** cos(step * 7.5deg) for any integer step. 48 steps make a full turn. */
function cosStep(step: number): number {
  const a = ((step % 48) + 48) % 48
  if (a <= 12) return COS_TABLE[a]
  if (a <= 24) return -COS_TABLE[24 - a]
  if (a <= 36) return -COS_TABLE[a - 24]
  return COS_TABLE[48 - a]
}

/** A point on a circle, step 0 at the top, turning clockwise. */
function onCircle(cx: number, cy: number, r: number, step: number): Point {
  return [cx + r * cosStep(step - 12), cy + r * cosStep(step - 24)]
}

const pt = ([x, y]: Point) => `${round(x)} ${round(y)}`
const arc = (r: number, large: 0 | 1, sweep: 0 | 1, to: Point) => `A${round(r)} ${round(r)} 0 ${large} ${sweep} ${pt(to)}`

const DIR_VECTOR: Record<Direction, Point> = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] }

/** A quadrant's two rim points in clockwise order, as unit offsets from its apex. */
const QUADRANT_RIM: Record<Quadrant, readonly [Point, Point]> = {
  ne: [[0, -1], [1, 0]],
  se: [[1, 0], [0, 1]],
  sw: [[0, 1], [-1, 0]],
  nw: [[-1, 0], [0, -1]],
}

const path = (fill: string, d: string, rotate?: IconRotation): PathElement => ({
  kind: "path",
  fill,
  d,
  ...(rotate ? { rotate } : {}),
})

/** A turn about a point, for the `rotate` option of any element. */
export const turn = (angle: number, cx = 40, cy = 40): IconRotation => ({ angle, cx, cy })

export function withRotate<T extends IconElement>(element: T, rotate: IconRotation): T {
  return { ...element, rotate }
}

export const disc = (fill: string, cx: number, cy: number, r: number): IconElement => ({ kind: "circle", fill, cx, cy, r })

export const rect = (fill: string, x: number, y: number, width: number, height: number, rx = 0): RectElement => ({
  kind: "rect",
  fill,
  x,
  y,
  width,
  height,
  rx,
})

export const polygon = (fill: string, points: readonly Point[], rotate?: IconRotation) =>
  path(fill, `M${points.map(pt).join("L")}Z`, rotate)

export const diamond = (fill: string, cx: number, cy: number, r: number) =>
  polygon(fill, [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]])

/** Isosceles, as wide as it is tall (2r), its box centred on (cx, cy). */
export function triangle(fill: string, cx: number, cy: number, r: number, dir: "up" | "down") {
  const s = dir === "up" ? 1 : -1
  return polygon(fill, [[cx, cy - s * r], [cx + r, cy + s * r], [cx - r, cy + s * r]])
}

/** A half disc, its flat edge through (cx, cy), bulging towards `dir`. */
export function semicircle(fill: string, cx: number, cy: number, r: number, dir: Direction, rotate?: IconRotation) {
  const [dx, dy] = DIR_VECTOR[dir]
  const from: Point = [cx + dy * r, cy - dx * r]
  const to: Point = [cx - dy * r, cy + dx * r]
  return path(fill, `M${pt(from)}${arc(r, 0, 1, to)}Z`, rotate)
}

/** A quarter disc with its apex at (cx, cy). */
export function quarter(fill: string, cx: number, cy: number, r: number, quadrant: Quadrant) {
  const [[ax, ay], [bx, by]] = QUADRANT_RIM[quadrant]
  return path(fill, `M${pt([cx, cy])}L${pt([cx + ax * r, cy + ay * r])}${arc(r, 0, 1, [cx + bx * r, cy + by * r])}Z`)
}

/** A disc with one quadrant missing, so a shape can sit in the gap with no rim showing around it. */
export function threeQuarters(fill: string, cx: number, cy: number, r: number, missing: Quadrant) {
  const [[ax, ay], [bx, by]] = QUADRANT_RIM[missing]
  return path(fill, `M${pt([cx, cy])}L${pt([cx + bx * r, cy + by * r])}${arc(r, 1, 1, [cx + ax * r, cy + ay * r])}Z`)
}

/** Everything below an S-curve that crosses the tile at height y. */
export const wave = (fill: string, y: number, r = 20) =>
  path(fill, `M0 ${y}${arc(r, 0, 1, [40, y])}${arc(r, 0, 0, [80, y])}L80 80L0 80Z`)

/** A flat-bottomed arch standing on `bottom`. */
export function arch(fill: string, cx: number, bottom: number, width: number, height: number, rotate?: IconRotation) {
  const r = width / 2
  const shoulder = bottom - height + r
  const d = `M${pt([cx - r, bottom])}L${pt([cx - r, shoulder])}${arc(r, 0, 1, [cx + r, shoulder])}L${pt([cx + r, bottom])}Z`
  return path(fill, d, rotate)
}

/** A rounded bar through (cx, cy), `angle` degrees off horizontal. */
export const capsule = (fill: string, cx: number, cy: number, length: number, thickness: number, angle: number): RectElement => ({
  ...rect(fill, cx - length / 2, cy - thickness / 2, length, thickness, thickness / 2),
  ...(angle ? { rotate: turn(angle, cx, cy) } : {}),
})

const circlePath = (cx: number, cy: number, r: number) =>
  `M${pt([cx - r, cy])}${arc(r, 1, 1, [cx + r, cy])}${arc(r, 1, 1, [cx - r, cy])}Z`

export const ring = (fill: string, cx: number, cy: number, r: number, inner: number): PathElement => ({
  ...path(fill, circlePath(cx, cy, r) + circlePath(cx, cy, inner)),
  evenOdd: true,
})

/** A thick quarter arc, centred on (cx, cy). */
export function quarterRing(fill: string, cx: number, cy: number, r: number, inner: number, quadrant: Quadrant) {
  const [[ax, ay], [bx, by]] = QUADRANT_RIM[quadrant]
  const at = (radius: number, x: number, y: number): Point => [cx + x * radius, cy + y * radius]
  const d = `M${pt(at(r, ax, ay))}${arc(r, 0, 1, at(r, bx, by))}L${pt(at(inner, bx, by))}${arc(inner, 0, 0, at(inner, ax, ay))}Z`
  return path(fill, d)
}

/** Where two circles cross, in the frame running from the first centre to the second. */
function crossing(ax: number, ay: number, ar: number, bx: number, by: number, br: number) {
  const dx = bx - ax
  const dy = by - ay
  const dist = Math.sqrt(dx * dx + dy * dy)
  const along = (ar * ar - br * br + dist * dist) / (2 * dist)
  const h = Math.sqrt(ar * ar - along * along)
  const mx = ax + (dx * along) / dist
  const my = ay + (dy * along) / dist
  const p1: Point = [mx - (dy * h) / dist, my + (dx * h) / dist]
  const p2: Point = [mx + (dy * h) / dist, my - (dx * h) / dist]
  return { p1, p2, along, dist }
}

/** The overlap of two circles. They must cross. */
export function lens(fill: string, ax: number, ay: number, ar: number, bx: number, by: number, br: number, rotate?: IconRotation) {
  const { p1, p2, along, dist } = crossing(ax, ay, ar, bx, by, br)
  const d = `M${pt(p1)}${arc(ar, along < 0 ? 1 : 0, 0, p2)}${arc(br, dist - along < 0 ? 1 : 0, 0, p1)}Z`
  return path(fill, d, rotate)
}

/** A disc of radius r with a bite of radius `bite` taken by a circle `offset` towards `dir`. */
export function crescent(fill: string, cx: number, cy: number, r: number, bite: number, offset: number, dir: Direction) {
  const [dx, dy] = DIR_VECTOR[dir]
  const { p1, p2, along, dist } = crossing(cx, cy, r, cx + dx * offset, cy + dy * offset, bite)
  return path(fill, `M${pt(p1)}${arc(r, along >= 0 ? 1 : 0, 1, p2)}${arc(bite, dist - along < 0 ? 1 : 0, 0, p1)}Z`)
}

/** A regular polygon. `sides` must divide 48. */
export function regular(fill: string, cx: number, cy: number, r: number, sides: number, phaseSteps = 0) {
  const step = 48 / sides
  const points = Array.from({ length: sides }, (_, i) => onCircle(cx, cy, r, i * step + phaseSteps))
  return polygon(fill, points)
}

/** A star with `points` tips. `points` must divide 24. */
export function star(fill: string, cx: number, cy: number, outer: number, inner: number, points: number, phaseSteps = 0) {
  const step = 24 / points
  const vertices = Array.from({ length: points * 2 }, (_, i) =>
    onCircle(cx, cy, i % 2 === 0 ? outer : inner, i * step + phaseSteps),
  )
  return polygon(fill, vertices)
}

/** A flower or badge edge: `lobes` half-round bumps around a circle. `lobes` must divide 48. */
export function scallop(fill: string, cx: number, cy: number, r: number, lobes: number) {
  const step = 48 / lobes
  const rim = Array.from({ length: lobes }, (_, i) => onCircle(cx, cy, r, i * step))
  const [ax, ay] = rim[0]
  const [bx, by] = rim[1]
  const lobe = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2) / 2
  const edges = rim.map((_, i) => arc(lobe, 0, 1, rim[(i + 1) % lobes])).join("")
  return path(fill, `M${pt(rim[0])}${edges}Z`)
}

/** Four concave-sided points. */
export function sparkle(fill: string, cx: number, cy: number, r: number, rotate?: IconRotation) {
  const tips: Point[] = [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]]
  const edges = tips.map((_, i) => `Q${pt([cx, cy])} ${pt(tips[(i + 1) % 4])}`).join("")
  return path(fill, `M${pt(tips[0])}${edges}Z`, rotate)
}
