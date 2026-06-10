/** JSON turns Infinity into null — revive and sanitize loop counts. */
export function normalizeLoopCount(value: number | null | undefined): number {
  if (value === Infinity) return Infinity;
  if (value == null || Number.isNaN(Number(value))) return 3;
  return Number(value);
}

export function isInfiniteLoop(count: number): boolean {
  return count === Infinity;
}
