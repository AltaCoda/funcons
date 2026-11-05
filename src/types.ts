export const ICON_STYLES = ["geometric", "abstract", "color"] as const
export type IconStyle = (typeof ICON_STYLES)[number]

/** What gets persisted on a workspace. The rendered SVG never is. */
export interface WorkspaceIconConfig {
  version: number
  style: IconStyle
  seed: string
}

export interface IconPalette {
  id: string
  background: string
  primary: string
  secondary: string
}

export interface IconRotation {
  angle: number
  cx: number
  cy: number
}

interface ElementBase {
  fill: string
  rotate?: IconRotation
}

export interface CircleElement extends ElementBase {
  kind: "circle"
  cx: number
  cy: number
  r: number
}

export interface RectElement extends ElementBase {
  kind: "rect"
  x: number
  y: number
  width: number
  height: number
  rx: number
}

export interface PathElement extends ElementBase {
  kind: "path"
  d: string
  evenOdd?: boolean
}

export type IconElement = CircleElement | RectElement | PathElement

/** Every decision the generator made. The renderer adds none of its own. */
export interface IconComposition {
  version: number
  style: IconStyle
  paletteId: string
  templateId: string
  background: string
  /** Turns all elements about the tile centre. Absent means 0. */
  rotate?: 90 | 180 | 270
  elements: IconElement[]
}

/** The nominal tile: viewBox `0 0 80 80`. */
export const ICON_TILE = 80
