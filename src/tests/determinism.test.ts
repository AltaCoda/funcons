import { describe, expect, it } from "vitest"

import { generateIcon } from "../generate.js"
import { fnv1a } from "../hash.js"
import { createRng } from "../prng.js"
import { ICON_STYLES } from "../types.js"

describe("hash", () => {
  it("matches the published FNV-1a 32-bit vectors", () => {
    expect(fnv1a("")).toBe(0x811c9dc5)
    expect(fnv1a("a")).toBe(0xe40c292c)
    expect(fnv1a("foobar")).toBe(0xbf9cf968)
  })

  it("hashes UTF-8 bytes, not UTF-16 code units", () => {
    expect(fnv1a("é")).not.toBe(fnv1a("é\u0000"))
    expect(fnv1a("é")).toBe(fnv1a("é"))
    expect(fnv1a("é")).not.toBe(fnv1a("é"))
  })
})

describe("prng", () => {
  it("repeats for a seed and stays within range", () => {
    const a = createRng(42)
    const b = createRng(42)
    for (let i = 0; i < 1000; i++) {
      const value = a.next()
      expect(value).toBe(b.next())
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe("generateIcon", () => {
  it("gives the same composition for the same config", () => {
    for (const style of ICON_STYLES) {
      for (let i = 0; i < 200; i++) {
        const config = { version: 1, style, seed: `seed-${i}` }
        expect(generateIcon(config)).toEqual(generateIcon(config))
      }
    }
  })

  it("is unaffected by earlier generations and by Math.random", () => {
    const config = { version: 1, style: "abstract", seed: "isolated" } as const
    const first = generateIcon(config)
    generateIcon({ version: 1, style: "color", seed: "other" })
    Math.random()
    expect(generateIcon(config)).toEqual(first)
  })

  it("keeps a seed's palette across families", () => {
    for (let i = 0; i < 100; i++) {
      const ids = ICON_STYLES.map((style) => generateIcon({ version: 1, style, seed: `seed-${i}` }).paletteId)
      expect(new Set(ids).size).toBe(1)
    }
  })

  it("refuses a config it does not support", () => {
    expect(() => generateIcon({ version: 999, style: "color", seed: "x" })).toThrow(RangeError)
    expect(() => generateIcon({ version: 1, style: "nope" as never, seed: "x" })).toThrow(RangeError)
  })
})
