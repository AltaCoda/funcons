import { ABSTRACT_TEMPLATES } from "../generators/abstract.js"
import { COLOR_TEMPLATES } from "../generators/color.js"
import { GEOMETRIC_TEMPLATES } from "../generators/geometric.js"
import type { IconTemplate } from "../generators/template.js"
import { fnv1a } from "../hash.js"
import { PALETTES } from "../palettes.js"
import { createRng } from "../prng.js"
import type { IconComposition, IconStyle } from "../types.js"

const TEMPLATES: Record<IconStyle, readonly IconTemplate[]> = {
  geometric: GEOMETRIC_TEMPLATES,
  abstract: ABSTRACT_TEMPLATES,
  color: COLOR_TEMPLATES,
}

const ROTATIONS = [0, 90, 180, 270] as const

/**
 * Generator v1. Seed: FNV-1a over UTF-8. PRNG: Mulberry32. Draw order: palette,
 * template, then the template's own draws in code order, then the turn when the
 * template is rotatable. The style is not hashed, so one seed keeps its palette
 * across all three families.
 *
 * FROZEN: approved after visual review. Any change to the palettes, templates,
 * primitives, draw order or renderers that alters output needs a v2 instead.
 */
export function generateV1(style: IconStyle, seed: string): IconComposition {
  const rng = createRng(fnv1a(seed))
  const palette = rng.pick(PALETTES)
  const template = rng.pick(TEMPLATES[style])
  const elements = template.build(rng, palette)
  const rotate = template.rotatable ? rng.pick(ROTATIONS) : 0

  return {
    version: 1,
    style,
    paletteId: palette.id,
    templateId: template.id,
    background: palette.background,
    ...(rotate ? { rotate } : {}),
    elements,
  }
}
