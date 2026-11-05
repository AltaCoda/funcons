import { describe, expect, it } from "vitest"

import { ABSTRACT_TEMPLATES } from "../generators/abstract.js"
import { COLOR_TEMPLATES } from "../generators/color.js"
import { GEOMETRIC_TEMPLATES } from "../generators/geometric.js"
import { generateIcon } from "../generate.js"
import { PALETTES } from "../palettes.js"
import { ICON_STYLES, type IconElement, type IconStyle } from "../types.js"

const SEEDS = Array.from({ length: 3000 }, (_, i) => `seed-${i}`)

function luminance(hex: string) {
  const channel = (at: number) => {
    const v = parseInt(hex.slice(at, at + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

function numbersIn(element: IconElement): number[] {
  const rotate = element.rotate ? [element.rotate.angle, element.rotate.cx, element.rotate.cy] : []
  switch (element.kind) {
    case "circle":
      return [element.cx, element.cy, element.r, ...rotate]
    case "rect":
      return [element.x, element.y, element.width, element.height, element.rx, ...rotate]
    case "path":
      return [...(element.d.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number), ...rotate]
  }
}

describe.each(ICON_STYLES)("%s family", (style: IconStyle) => {
  const compositions = SEEDS.map((seed) => generateIcon({ version: 1, style, seed }))

  it("keeps to the primitive budget", () => {
    for (const c of compositions) {
      expect(c.elements.length).toBeGreaterThanOrEqual(1)
      expect(c.elements.length).toBeLessThanOrEqual(5)
    }
  })

  it("draws only with the chosen palette's colours", () => {
    for (const c of compositions) {
      const palette = PALETTES.find((p) => p.id === c.paletteId)!
      expect(c.background).toBe(palette.background)
      for (const element of c.elements) {
        expect([palette.background, palette.primary, palette.secondary]).toContain(element.fill)
      }
    }
  })

  it("produces finite coordinates and valid paths", () => {
    for (const c of compositions) {
      for (const element of c.elements) {
        for (const n of numbersIn(element)) {
          expect(Number.isFinite(n)).toBe(true)
          expect(Math.abs(n)).toBeLessThan(400)
        }
        if (element.kind === "path") {
          expect(element.d).toMatch(/^M[-\d. ]+/)
          expect(element.d).toMatch(/Z$/)
          expect(element.d).not.toMatch(/NaN|undefined|Infinity/)
        }
        if (element.kind === "circle") expect(element.r).toBeGreaterThan(0)
      }
    }
  })

  it("never leaves the tile looking empty", () => {
    for (const c of compositions) {
      expect(c.elements.some((e) => e.fill !== c.background)).toBe(true)
    }
  })

  it("reaches every palette", () => {
    expect(new Set(compositions.map((c) => c.paletteId)).size).toBe(PALETTES.length)
  })
})

describe("templates", () => {
  it.each([
    ["geometric", GEOMETRIC_TEMPLATES],
    ["abstract", ABSTRACT_TEMPLATES],
    ["color", COLOR_TEMPLATES],
  ] as const)("%s reaches all of its templates", (style, templates) => {
    const used = new Set(SEEDS.map((seed) => generateIcon({ version: 1, style, seed }).templateId))
    expect(used).toEqual(new Set(templates.map((t) => t.id)))
  })

  it("family C stays strictly two-colour", () => {
    for (const seed of SEEDS) {
      const c = generateIcon({ version: 1, style: "color", seed })
      const palette = PALETTES.find((p) => p.id === c.paletteId)!
      for (const element of c.elements) expect(element.fill).not.toBe(palette.secondary)
    }
  })
})

describe("palettes", () => {
  it("has unique ids and 12 to 16 entries", () => {
    expect(PALETTES.length).toBeGreaterThanOrEqual(12)
    expect(PALETTES.length).toBeLessThanOrEqual(16)
    expect(new Set(PALETTES.map((p) => p.id)).size).toBe(PALETTES.length)
  })

  it.each(PALETTES.map((p) => [p.id, p] as const))("%s has enough contrast between its major elements", (_, p) => {
    expect(contrast(p.primary, p.background)).toBeGreaterThanOrEqual(3)
    expect(contrast(p.secondary, p.background)).toBeGreaterThanOrEqual(1.9)
    expect(contrast(p.primary, p.secondary)).toBeGreaterThanOrEqual(1.5)
  })
})
