import { describe, expect, it } from "vitest"

import { generateIcon } from "../generate.js"
import { ICON_STYLES } from "../types.js"

const SEEDS = ["019e6277-fd44-747e-989a-16a376146885", "workspace-0", "", "émoji-🎨", "a"]

// Reference artwork. A failure here means existing workspaces' icons would
// change: make a v2 rather than updating this snapshot.
describe("v1 reference compositions", () => {
  it.each(ICON_STYLES)("%s", (style) => {
    expect(SEEDS.map((seed) => generateIcon({ version: 1, style, seed }))).toMatchSnapshot()
  })
})
