import { ICON_TILE, type IconComposition, type IconElement, type IconRotation } from "../types.js"

export interface SvgStringOptions {
  /** Sets width and height. Without it the SVG sizes to its container. */
  size?: number
}

const transform = (value?: string) => (value ? ` transform="${value}"` : "")
const rotation = (r?: IconRotation) => (r ? `rotate(${r.angle} ${r.cx} ${r.cy})` : undefined)

function elementString(element: IconElement): string {
  const paint = `fill="${element.fill}"${transform(rotation(element.rotate))}`
  switch (element.kind) {
    case "circle":
      return `<circle ${paint} cx="${element.cx}" cy="${element.cy}" r="${element.r}"></circle>`
    case "rect": {
      const rx = element.rx ? ` rx="${element.rx}"` : ""
      return `<rect ${paint} x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}"${rx}></rect>`
    }
    case "path":
      return `<path ${paint} d="${element.d}"${element.evenOdd ? ' fill-rule="evenodd"' : ""}></path>`
  }
}

/**
 * The same markup the React renderer produces, for anything that isn't React:
 * emails, server templates, favicons. Every value in it comes from the generator,
 * never from the seed, so it needs no escaping.
 */
export function renderSvgString(composition: IconComposition, { size }: SvgStringOptions = {}): string {
  const center = ICON_TILE / 2
  const turn = composition.rotate ? `rotate(${composition.rotate} ${center} ${center})` : undefined
  const dimensions = size === undefined ? "" : ` width="${size}" height="${size}"`
  return (
    `<svg viewBox="0 0 ${ICON_TILE} ${ICON_TILE}" xmlns="http://www.w3.org/2000/svg"${dimensions}>` +
    `<rect width="${ICON_TILE}" height="${ICON_TILE}" fill="${composition.background}"></rect>` +
    `<g${transform(turn)}>${composition.elements.map(elementString).join("")}</g>` +
    `</svg>`
  )
}
