/**
 * Pathfinding: A* for the player's tap-to-path, Dijkstra flow fields for AI.
 *
 * AI uses one shared flow field per turn rather than one A* per actor — with
 * 60 actors on a floor that is the difference between fitting the 16ms
 * worst-case turn budget and not (ARCHITECTURE.md §6).
 */

import { DIRS, type Point } from '../core/grid.ts';

export interface NavMap {
  w: number;
  h: number;
  walkable(x: number, y: number): boolean;
}

/**
 * Diagonal movement may not cut a corner between two walls (DESIGN.md §6.2).
 * Both orthogonal neighbours of the diagonal must be open.
 */
export function canStep(map: NavMap, fromX: number, fromY: number, toX: number, toY: number): boolean {
  if (!map.walkable(toX, toY)) return false;
  const dx = toX - fromX;
  const dy = toY - fromY;
  if (dx !== 0 && dy !== 0) {
    if (!map.walkable(fromX + dx, fromY)) return false;
    if (!map.walkable(fromX, fromY + dy)) return false;
  }
  return true;
}

/** A* over the 8-way grid. Returns the path excluding the origin, or null. */
export function findPath(map: NavMap, from: Point, to: Point, maxNodes = 6000): Point[] | null {
  if (from.x === to.x && from.y === to.y) return [];
  const idx = (x: number, y: number) => y * map.w + x;
  const goal = idx(to.x, to.y);

  const cameFrom = new Map<number, number>();
  const gScore = new Map<number, number>();
  const open: { i: number; f: number }[] = [];

  const startIdx = idx(from.x, from.y);
  gScore.set(startIdx, 0);
  open.push({ i: startIdx, f: 0 });

  let expanded = 0;
  while (open.length) {
    // Small frontiers; a linear scan beats a binary heap's constant factor here.
    let best = 0;
    for (let i = 1; i < open.length; i++) if (open[i].f < open[best].f) best = i;
    const current = open.splice(best, 1)[0].i;

    if (current === goal) {
      const path: Point[] = [];
      let node = current;
      while (node !== startIdx) {
        path.push({ x: node % map.w, y: Math.floor(node / map.w) });
        node = cameFrom.get(node)!;
      }
      return path.reverse();
    }

    if (++expanded > maxNodes) return null;
    const cx = current % map.w;
    const cy = Math.floor(current / map.w);
    const cg = gScore.get(current)!;

    for (const d of DIRS) {
      const nx = cx + d.x;
      const ny = cy + d.y;
      if (nx < 0 || ny < 0 || nx >= map.w || ny >= map.h) continue;
      // No exception for the goal tile. Exempting it from the corner rule let
      // A* return a first step that `execute` then legally refuses, which cost
      // no turn and looped forever — every path this returns must be walkable
      // step by step under exactly the rules the turn pipeline enforces.
      if (!canStep(map, cx, cy, nx, ny)) continue;
      const ni = idx(nx, ny);
      const tentative = cg + 1;
      if (tentative < (gScore.get(ni) ?? Infinity)) {
        gScore.set(ni, tentative);
        cameFrom.set(ni, current);
        const h = Math.max(Math.abs(nx - to.x), Math.abs(ny - to.y));
        open.push({ i: ni, f: tentative + h });
      }
    }
  }
  return null;
}

/**
 * Dijkstra distance field from a set of sources. AI reads it by stepping to the
 * lowest-valued neighbour (or the highest, to flee).
 */
export function flowField(map: NavMap, sources: Point[]): Int32Array {
  const size = map.w * map.h;
  const field = new Int32Array(size).fill(0x7fffffff);
  const queue: number[] = [];
  for (const s of sources) {
    if (s.x < 0 || s.y < 0 || s.x >= map.w || s.y >= map.h) continue;
    const i = s.y * map.w + s.x;
    field[i] = 0;
    queue.push(i);
  }

  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head];
    const cx = cur % map.w;
    const cy = Math.floor(cur / map.w);
    const next = field[cur] + 1;
    for (const d of DIRS) {
      const nx = cx + d.x;
      const ny = cy + d.y;
      if (nx < 0 || ny < 0 || nx >= map.w || ny >= map.h) continue;
      if (!canStep(map, cx, cy, nx, ny)) continue;
      const ni = ny * map.w + nx;
      if (next < field[ni]) {
        field[ni] = next;
        queue.push(ni);
      }
    }
  }
  return field;
}

/** Every walkable tile reachable from `from`. Used by mapgen's connectivity check. */
export function reachable(map: NavMap, from: Point): Set<number> {
  const seen = new Set<number>();
  if (!map.walkable(from.x, from.y)) return seen;
  const stack = [from.y * map.w + from.x];
  seen.add(stack[0]);
  while (stack.length) {
    const cur = stack.pop()!;
    const cx = cur % map.w;
    const cy = Math.floor(cur / map.w);
    for (const d of DIRS) {
      const nx = cx + d.x;
      const ny = cy + d.y;
      if (nx < 0 || ny < 0 || nx >= map.w || ny >= map.h) continue;
      if (!canStep(map, cx, cy, nx, ny)) continue;
      const ni = ny * map.w + nx;
      if (!seen.has(ni)) {
        seen.add(ni);
        stack.push(ni);
      }
    }
  }
  return seen;
}
