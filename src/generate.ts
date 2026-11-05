import { ICON_STYLES, type IconComposition, type WorkspaceIconConfig } from "./types.js"
import { generateV1 } from "./versions/v1.js"

export const LATEST_ICON_VERSION = 1

/** False for a config from a newer generator, or stored data that isn't a valid config. */
export function isSupportedIconConfig({ version, style }: WorkspaceIconConfig): boolean {
  return version === 1 && ICON_STYLES.includes(style)
}

/**
 * Pure and deterministic: the same config always gives the same composition.
 * Throws RangeError for an unsupported config; check isSupportedIconConfig first
 * when the config comes from storage. WorkspaceIcon does this for you.
 */
export function generateIcon(config: WorkspaceIconConfig): IconComposition {
  if (!isSupportedIconConfig(config)) {
    throw new RangeError(`Unsupported workspace icon config: version ${config.version}, style ${config.style}`)
  }
  return generateV1(config.style, config.seed)
}
