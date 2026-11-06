import { useMemo } from "react"

import { generateIcon, isSupportedIconConfig } from "../generate.js"
import type { IconComposition, FunconConfig } from "../types.js"
import { renderIcon } from "./SvgRenderer.js"

export interface FunconProps {
  config: FunconConfig
  size?: number
  className?: string
  /** True when a visible name sits next to the icon. Ignored if `label` is set. */
  decorative?: boolean
  /** An accessible name, for when the icon stands alone. */
  label?: string
}

const CORNER_RADIUS = "22%"

/** A plain tile for a config this build can't draw, such as one saved by a newer generator. */
function placeholder({ version, style }: FunconConfig): IconComposition {
  return { version, style, paletteId: "unsupported", templateId: "unsupported", background: "#9CA3AF", elements: [] }
}

export function Funcon({ config, size = 32, className, decorative = true, label }: FunconProps) {
  const { version, style, seed } = config
  const composition = useMemo(() => {
    const current = { version, style, seed }
    return isSupportedIconConfig(current) ? generateIcon(current) : placeholder(current)
  }, [version, style, seed])

  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": decorative || undefined }

  return renderIcon(composition, {
    width: size,
    height: size,
    className,
    style: { borderRadius: CORNER_RADIUS, overflow: "hidden", display: "block", flexShrink: 0 },
    ...a11y,
  })
}
