const FNV_OFFSET_BASIS = 0x811c9dc5
const FNV_PRIME = 0x01000193

/**
 * FNV-1a, 32 bits, over the seed's UTF-8 bytes (a lone surrogate encodes as
 * U+FFFD, per TextEncoder). Part of the frozen generator spec.
 */
export function fnv1a(input: string): number {
  let hash = FNV_OFFSET_BASIS
  for (const byte of new TextEncoder().encode(input)) {
    hash ^= byte
    hash = Math.imul(hash, FNV_PRIME)
  }
  return hash >>> 0
}
