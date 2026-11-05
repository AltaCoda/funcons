export interface Rng {
  /** A float in [0, 1). */
  next(): number
  /** An integer in [0, n). Consumes exactly one draw. */
  int(n: number): number
  /** One item of a non-empty list. Consumes exactly one draw. */
  pick<T>(items: readonly T[]): T
}

/**
 * Mulberry32. Part of the frozen generator spec: the algorithm, and the order
 * callers consume draws in, both decide the artwork.
 */
export function createRng(seed: number): Rng {
  let state = seed >>> 0

  const next = () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (n: number) => Math.floor(next() * n)

  return { next, int, pick: (items) => items[int(items.length)] }
}
