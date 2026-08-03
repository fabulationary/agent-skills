/**
 * Act I generator: flooded service caverns (DESIGN.md §6.9).
 *
 * Cellular automata for the caverns, then the largest connected region is kept
 * and everything else is filled in. That guarantees connectivity by
 * construction rather than by repair — the single worst bug class in a
 * roguelike is a floor you cannot finish, so the property test in
 * tests/mapgen.test.ts hammers this over thousands of seeds.
 */

import type { RNG } from '../core/rng.ts';
import { Tile, WALKABLE } from './types.ts';
import { flowField, reachable, type NavMap } from './path.ts';

export const MAP_W = 44;
export const MAP_H = 44;

export interface GeneratedMap {
  tiles: number[];
  spawn: { x: number; y: number };
  elevator: { x: number; y: number };
  open: { x: number; y: number }[]; // walkable tiles, spawn-sorted by distance
  distFromSpawn: Int32Array;
}

function navOf(tiles: number[]): NavMap {
  return {
    w: MAP_W,
    h: MAP_H,
    walkable: (x, y) =>
      x >= 0 && y >= 0 && x < MAP_W && y < MAP_H && WALKABLE.has(tiles[y * MAP_W + x]),
  };
}

function caStep(src: number[]): number[] {
  const out = src.slice();
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      let walls = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) walls++;
          else if (src[ny * MAP_W + nx] === Tile.Wall) walls++;
        }
      }
      out[y * MAP_W + x] = walls >= 5 ? Tile.Wall : Tile.Floor;
    }
  }
  return out;
}

/** Carve a pillared arena around the elevator for the floor-4 boss. */
function carveArena(tiles: number[], cx: number, cy: number): void {
  const r = 7;
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      if (x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) continue;
      const d = Math.max(Math.abs(x - cx), Math.abs(y - cy));
      if (d <= r) tiles[y * MAP_W + x] = d === r ? Tile.Wall : Tile.Floor;
    }
  }
  // Pillars: cover from a slow, big boss is the intended answer to the fight.
  for (const [px, py] of [[-3, -3], [3, -3], [-3, 3], [3, 3], [0, -4], [0, 4]]) {
    const x = cx + px;
    const y = cy + py;
    if (x > 0 && y > 0 && x < MAP_W - 1 && y < MAP_H - 1) tiles[y * MAP_W + x] = Tile.Wall;
  }
  // Two entrances, so the player can never be sealed out of the arena.
  tiles[cy * MAP_W + (cx - r)] = Tile.Floor;
  tiles[cy * MAP_W + (cx + r)] = Tile.Floor;
  tiles[cy * MAP_W + cx] = Tile.Elevator;
}

export function generateFloor(rng: RNG, floor: number): GeneratedMap {
  for (let attempt = 0; attempt < 40; attempt++) {
    // Deeper floors are tighter and more claustrophobic.
    const fillChance = 0.44 + floor * 0.005;
    let tiles = new Array<number>(MAP_W * MAP_H);
    for (let i = 0; i < tiles.length; i++) {
      const x = i % MAP_W;
      const y = Math.floor(i / MAP_W);
      const edge = x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1;
      tiles[i] = edge || rng.next() < fillChance ? Tile.Wall : Tile.Floor;
    }
    for (let i = 0; i < 4; i++) tiles = caStep(tiles);

    // Keep only the largest region; fill the rest. Connectivity by construction.
    const nav = navOf(tiles);
    const seen = new Uint8Array(tiles.length);
    let best: Set<number> | null = null;
    for (let i = 0; i < tiles.length; i++) {
      if (seen[i] || !WALKABLE.has(tiles[i])) continue;
      const region = reachable(nav, { x: i % MAP_W, y: Math.floor(i / MAP_W) });
      for (const r of region) seen[r] = 1;
      if (!best || region.size > best.size) best = region;
    }
    if (!best || best.size < 420) continue;
    for (let i = 0; i < tiles.length; i++) {
      if (WALKABLE.has(tiles[i]) && !best.has(i)) tiles[i] = Tile.Wall;
    }

    // Spawn, then put the elevator as far from it as the floor allows.
    const openIdx = [...best];
    const spawnIdx = openIdx[rng.int(openIdx.length)];
    const spawn = { x: spawnIdx % MAP_W, y: Math.floor(spawnIdx / MAP_W) };
    const dist = flowField(navOf(tiles), [spawn]);

    let far = spawnIdx;
    for (const i of openIdx) if (dist[i] < 0x7fffffff && dist[i] > dist[far]) far = i;
    if (dist[far] < 18) continue; // too cramped to be interesting

    const elevator = { x: far % MAP_W, y: Math.floor(far / MAP_W) };
    if (floor === 4) carveArena(tiles, elevator.x, elevator.y);
    else tiles[far] = Tile.Elevator;

    // Cosmetic variety and one terminal, placed mid-distance so jacking in is
    // a detour rather than a freebie.
    for (const i of openIdx) {
      if (tiles[i] === Tile.Floor && rng.next() < 0.04) tiles[i] = Tile.Rubble;
      else if (tiles[i] === Tile.Floor && rng.next() < 0.02) tiles[i] = Tile.Grate;
    }
    const mid = openIdx.filter((i) => dist[i] > 8 && dist[i] < dist[far] - 4 && tiles[i] === Tile.Floor);
    if (mid.length) tiles[rng.pick(mid)] = Tile.Terminal;

    // Carving the arena can wall the elevator off from the rest of the floor.
    // Re-verify rather than assume: an unreachable exit is an unwinnable run.
    const finalNav = navOf(tiles);
    const finalDist = flowField(finalNav, [spawn]);
    const elevatorIdx = elevator.y * MAP_W + elevator.x;
    if (!WALKABLE.has(tiles[spawn.y * MAP_W + spawn.x])) continue;
    if (finalDist[elevatorIdx] >= 0x7fffffff) continue;

    const open = openIdx
      .filter((i) => WALKABLE.has(tiles[i]) && finalDist[i] < 0x7fffffff)
      .map((i) => ({ x: i % MAP_W, y: Math.floor(i / MAP_W) }));

    return { tiles, spawn, elevator, open, distFromSpawn: finalDist };
  }
  throw new Error('mapgen: exhausted attempts');
}
