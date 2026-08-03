/** Grid primitives. No game knowledge lives here. */

export interface Point {
  x: number;
  y: number;
}

/** 8-way directions, clockwise from north. Index is stable — saves rely on it. */
export const DIRS: readonly Point[] = [
  { x: 0, y: -1 },  // 0 N
  { x: 1, y: -1 },  // 1 NE
  { x: 1, y: 0 },   // 2 E
  { x: 1, y: 1 },   // 3 SE
  { x: 0, y: 1 },   // 4 S
  { x: -1, y: 1 },  // 5 SW
  { x: -1, y: 0 },  // 6 W
  { x: -1, y: -1 }, // 7 NW
];

export const ORTHO: readonly Point[] = [DIRS[0], DIRS[2], DIRS[4], DIRS[6]];

/**
 * Chebyshev distance — the correct metric for 8-way movement where diagonals
 * cost the same as orthogonals (DESIGN.md §6.2).
 */
export function dist(a: Point, b: Point): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function equal(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Snap a vector to one of the 8 directions, or null if it falls outside the
 * cone tolerance. `coneDeg` is tunable because thumb-swipe accuracy on a small
 * screen is unproven (DESIGN.md §11.2) — at 45 the cones tile the circle
 * exactly; below that, off-axis swipes are rejected rather than guessed.
 */
export function vectorToDir(dx: number, dy: number, coneDeg = 45): number | null {
  // Screen space: +y is down, so atan2 advances clockwise. East is 0deg and
  // direction index 2; each index step is 45deg clockwise from there.
  const angle = (Math.atan2(dy, dx) * (180 / Math.PI) + 360) % 360;
  const nearest = Math.round(angle / 45) % 8;
  let off = Math.abs(angle - nearest * 45);
  if (off > 180) off = 360 - off;
  if (off > coneDeg / 2) return null;
  return (nearest + 2) % 8;
}
