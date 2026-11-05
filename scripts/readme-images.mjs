// Draws the README's contact sheets into docs/ from the built library, so the
// images are always real generator output. Run with `pnpm readme:images`.
import { mkdirSync, writeFileSync } from "node:fs"

import { generateIcon, ICON_STYLES, ICON_TILE, renderSvgString } from "../dist/index.js"

const COLUMNS = 10
const ROWS = 2
const GAP = 12
const CORNER = ICON_TILE * 0.22

function sheet(configs, rows) {
  const width = COLUMNS * ICON_TILE + (COLUMNS - 1) * GAP
  const height = rows * ICON_TILE + (rows - 1) * GAP
  const tiles = configs.map((config, i) => {
    const x = (i % COLUMNS) * (ICON_TILE + GAP)
    const y = Math.floor(i / COLUMNS) * (ICON_TILE + GAP)
    const icon = renderSvgString(generateIcon(config), { size: ICON_TILE }).replace(' xmlns="http://www.w3.org/2000/svg"', "")
    return `<g transform="translate(${x} ${y})" clip-path="url(#tile)">${icon}</g>`
  })
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">` +
    `<defs><clipPath id="tile"><rect width="${ICON_TILE}" height="${ICON_TILE}" rx="${CORNER}"/></clipPath></defs>` +
    `${tiles.join("")}</svg>\n`
  )
}

const seeds = (prefix, count) => Array.from({ length: count }, (_, i) => `${prefix}-${i}`)
const config = (style, seed) => ({ version: 1, style, seed })

mkdirSync("docs", { recursive: true })
for (const style of ICON_STYLES) {
  const configs = seeds("workspace", COLUMNS * ROWS).map((seed) => config(style, seed))
  writeFileSync(`docs/${style}.svg`, sheet(configs, ROWS))
}
const mixed = seeds("funcons", COLUMNS * 3).map((seed, i) => config(ICON_STYLES[i % ICON_STYLES.length], seed))
writeFileSync("docs/mixed.svg", sheet(mixed, 3))
