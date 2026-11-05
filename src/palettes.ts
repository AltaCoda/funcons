import type { IconPalette } from "./types.js"

/**
 * Hand-picked. Order is part of the v1 spec: the PRNG selects by index, so
 * adding, removing or reordering a palette needs a new generator version.
 */
export const PALETTES: readonly IconPalette[] = [
  { id: "cobalt", background: "#2447D6", primary: "#F6EFE0", secondary: "#FFB703" },
  { id: "tomato", background: "#E4472B", primary: "#FCEBD3", secondary: "#1E1B3A" },
  { id: "forest", background: "#14532D", primary: "#F2C94C", secondary: "#E2683C" },
  { id: "ink", background: "#1D2240", primary: "#FF7A59", secondary: "#8FD3C7" },
  { id: "sand", background: "#EAD9B8", primary: "#B23A1E", secondary: "#1F3D36" },
  { id: "plum", background: "#4B1D52", primary: "#F4A9C0", secondary: "#E8603C" },
  { id: "teal", background: "#0E7C7B", primary: "#F8EBD0", secondary: "#14323A" },
  { id: "marigold", background: "#F5B21A", primary: "#1E2A4A", secondary: "#D9411E" },
  { id: "blush", background: "#F6C9C4", primary: "#7A1E3A", secondary: "#E0452A" },
  { id: "moss", background: "#5F6F2E", primary: "#F5EFD6", secondary: "#E7B53C" },
  { id: "sky", background: "#A9D4EE", primary: "#15396B", secondary: "#D8431F" },
  { id: "violet", background: "#5B3CC4", primary: "#F9E9C8", secondary: "#17143F" },
  { id: "terracotta", background: "#C65A35", primary: "#FBE8CD", secondary: "#27383F" },
  { id: "mint", background: "#BCE3CF", primary: "#0F4C45", secondary: "#D94F35" },
  { id: "slate", background: "#32424F", primary: "#EBC98A", secondary: "#E9805F" },
  { id: "berry", background: "#A81F59", primary: "#FDE3D0", secondary: "#3A0A2A" },
]
