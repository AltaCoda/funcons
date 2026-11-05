import type { ReactElement, SVGProps } from "react"

import { ICON_TILE, type IconComposition, type IconElement, type IconRotation } from "../types.js"

const rotation = (r?: IconRotation) => (r ? `rotate(${r.angle} ${r.cx} ${r.cy})` : undefined)

function renderElement(element: IconElement, key: number): ReactElement {
  const paint = { fill: element.fill, transform: rotation(element.rotate) }
  switch (element.kind) {
    case "circle":
      return <circle key={key} {...paint} cx={element.cx} cy={element.cy} r={element.r} />
    case "rect":
      return (
        <rect
          key={key}
          {...paint}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rx={element.rx || undefined}
        />
      )
    case "path":
      return <path key={key} {...paint} d={element.d} fillRule={element.evenOdd ? "evenodd" : undefined} />
  }
}

/** Draws a composition exactly as generated. It makes no decisions of its own. */
export function renderIcon(composition: IconComposition, props?: SVGProps<SVGSVGElement>): ReactElement {
  const center = ICON_TILE / 2
  return (
    <svg viewBox={`0 0 ${ICON_TILE} ${ICON_TILE}`} xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width={ICON_TILE} height={ICON_TILE} fill={composition.background} />
      <g transform={composition.rotate ? `rotate(${composition.rotate} ${center} ${center})` : undefined}>
        {composition.elements.map(renderElement)}
      </g>
    </svg>
  )
}
