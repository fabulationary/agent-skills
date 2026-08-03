/**
 * Symmetric shadowcasting field of view (Albert Ford's formulation).
 *
 * Symmetry is a design guarantee, not an implementation detail: if you can see
 * it, it can see you (DESIGN.md §6.3). Players plan around that rule, so the
 * test suite asserts it directly over random maps rather than trusting it.
 */

export interface FovMap {
  w: number;
  h: number;
  transparent(x: number, y: number): boolean;
}

/** Maps quadrant-local (depth, column) to world coordinates. */
type Transform = (depth: number, col: number) => [number, number];

const roundTiesUp = (n: number) => Math.floor(n + 0.5);
const roundTiesDown = (n: number) => Math.ceil(n - 0.5);
const slopeOf = (depth: number, col: number) => (2 * col - 1) / (2 * depth);

/**
 * Returns the set of visible tile indices (y * w + x), always including the
 * origin. Radius uses the Chebyshev metric to match 8-way movement.
 */
export function computeFov(map: FovMap, ox: number, oy: number, radius: number): Set<number> {
  const visible = new Set<number>();
  const mark = (x: number, y: number) => {
    if (x >= 0 && y >= 0 && x < map.w && y < map.h) visible.add(y * map.w + x);
  };
  const blocked = (x: number, y: number) =>
    !(x >= 0 && y >= 0 && x < map.w && y < map.h) || !map.transparent(x, y);

  mark(ox, oy);
  if (radius <= 0) return visible;

  const transforms: Transform[] = [
    (d, c) => [ox + c, oy - d], // north
    (d, c) => [ox + c, oy + d], // south
    (d, c) => [ox + d, oy + c], // east
    (d, c) => [ox - d, oy + c], // west
  ];

  for (const tf of transforms) {
    // Iterative sweep with an explicit stack — recursion depth is bounded by
    // the radius, but an explicit stack keeps this allocation-free per row.
    const stack: { depth: number; start: number; end: number }[] = [
      { depth: 1, start: -1, end: 1 },
    ];

    while (stack.length) {
      const row = stack.pop()!;
      if (row.depth > radius) continue;

      const minCol = roundTiesUp(row.depth * row.start);
      const maxCol = roundTiesDown(row.depth * row.end);
      let prevWall: boolean | null = null;
      let start = row.start;

      for (let col = minCol; col <= maxCol; col++) {
        const [x, y] = tf(row.depth, col);
        const wall = blocked(x, y);
        const inRange = Math.max(Math.abs(x - ox), Math.abs(y - oy)) <= radius;
        // Walls are revealed even when clipped by the cone, so wall faces never
        // show gaps; floors must be fully inside the cone to stay symmetric.
        const symmetric = col >= row.depth * start && col <= row.depth * row.end;
        if (inRange && (wall || symmetric)) mark(x, y);

        if (prevWall === true && !wall) start = slopeOf(row.depth, col);
        if (prevWall === false && wall) {
          stack.push({ depth: row.depth + 1, start, end: slopeOf(row.depth, col) });
        }
        prevWall = wall;
      }
      if (prevWall === false) stack.push({ depth: row.depth + 1, start, end: row.end });
    }
  }
  return visible;
}
