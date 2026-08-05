/**
 * Act I generator: the freight yards under Umbilical Gamma (DESIGN.md §6.11).
 *
 * Rogue's layout, not a cave system. The map is divided into a 3x3 grid of
 * sectors, each gets one rectangular room, and the rooms are joined by
 * L-shaped corridors along a random spanning tree plus a few extra loops.
 *
 * This replaced a cellular-automata cavern generator, which reliably produced
 * one enormous connected blob — atmospheric, and tactically flat. Rooms and
 * corridors give the thing roguelikes actually run on: a doorway worth
 * holding, a corridor you can be caught in, and a reason to care which way you
 * came in. It also fits the fiction better than caves ever did. These are
 * loading bays, not caverns.
 *
 * Connectivity is guaranteed by construction (a spanning tree over the room
 * graph) and then verified by flood fill anyway, because a floor you cannot
 * finish is the worst bug this genre has.
 */

import type { RNG } from '../core/rng.ts';
import { Tile, WALKABLE } from './types.ts';
import { flowField, reachable, type NavMap } from './path.ts';

export const MAP_W = 44;
export const MAP_H = 44;

/** The tier whose room becomes the Warden's loading bay. */
const BOSS_FLOOR = 4;

const SECTORS_X = 3;
const SECTORS_Y = 3;
const SECTOR_W = Math.floor((MAP_W - 2) / SECTORS_X);
const SECTOR_H = Math.floor((MAP_H - 2) / SECTORS_Y);

export interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

export interface GeneratedMap {
  tiles: number[];
  spawn: { x: number; y: number };
  lift: { x: number; y: number };
  rooms: Room[];
  open: { x: number; y: number }[];
  distFromSpawn: Int32Array;
}

const at = (x: number, y: number) => y * MAP_W + x;

function navOf(tiles: number[]): NavMap {
  return {
    w: MAP_W,
    h: MAP_H,
    walkable: (x, y) =>
      x >= 0 && y >= 0 && x < MAP_W && y < MAP_H && WALKABLE.has(tiles[y * MAP_W + x]),
  };
}

function carveRoom(tiles: number[], room: Room): void {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) tiles[at(x, y)] = Tile.Floor;
  }
}

function carveH(tiles: number[], x1: number, x2: number, y: number): void {
  if (y <= 0 || y >= MAP_H - 1) return;
  for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
    if (x > 0 && x < MAP_W - 1) tiles[at(x, y)] = Tile.Floor;
  }
}

function carveV(tiles: number[], y1: number, y2: number, x: number): void {
  if (x <= 0 || x >= MAP_W - 1) return;
  for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
    if (y > 0 && y < MAP_H - 1) tiles[at(x, y)] = Tile.Floor;
  }
}

/** L-shaped corridor between two room centres; elbow order chosen by the seed. */
function connect(tiles: number[], a: Room, b: Room, rng: RNG): void {
  if (rng.chance(0.5)) {
    carveH(tiles, a.cx, b.cx, a.cy);
    carveV(tiles, a.cy, b.cy, b.cx);
  } else {
    carveV(tiles, a.cy, b.cy, a.cx);
    carveH(tiles, a.cx, b.cx, b.cy);
  }
}

/** Union-find, so the spanning tree over the room grid is honest. */
class DisjointSet {
  private parent: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }

  find(i: number): number {
    let node = i;
    while (this.parent[node] !== node) {
      this.parent[node] = this.parent[this.parent[node]];
      node = this.parent[node];
    }
    return node;
  }

  union(a: number, b: number): boolean {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return false;
    this.parent[ra] = rb;
    return true;
  }
}

/**
 * The Warden's loading bay: its room is enlarged and given gantry pillars,
 * because the answer to that fight is cover and it is too big for the aisles.
 */
function expandBossRoom(tiles: number[], room: Room): void {
  const x0 = Math.max(1, room.x - 2);
  const y0 = Math.max(1, room.y - 2);
  const x1 = Math.min(MAP_W - 2, room.x + room.w + 1);
  const y1 = Math.min(MAP_H - 2, room.y + room.h + 1);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) tiles[at(x, y)] = Tile.Floor;
  }
  room.x = x0;
  room.y = y0;
  room.w = x1 - x0 + 1;
  room.h = y1 - y0 + 1;
  room.cx = Math.floor(x0 + room.w / 2);
  room.cy = Math.floor(y0 + room.h / 2);

  for (const [px, py] of [[-3, -2], [3, -2], [-3, 2], [3, 2]]) {
    const x = room.cx + px;
    const y = room.cy + py;
    if (x > x0 && x < x1 && y > y0 && y < y1) tiles[at(x, y)] = Tile.Wall;
  }
}

export function generateFloor(rng: RNG, floor: number): GeneratedMap {
  for (let attempt = 0; attempt < 40; attempt++) {
    const tiles = new Array<number>(MAP_W * MAP_H).fill(Tile.Wall);

    // --- one room per sector ------------------------------------------
    const rooms: Room[] = [];
    for (let sy = 0; sy < SECTORS_Y; sy++) {
      for (let sx = 0; sx < SECTORS_X; sx++) {
        const ox = 1 + sx * SECTOR_W;
        const oy = 1 + sy * SECTOR_H;
        const w = rng.range(5, SECTOR_W - 3);
        const h = rng.range(4, SECTOR_H - 3);
        const x = ox + rng.int(SECTOR_W - w);
        const y = oy + rng.int(SECTOR_H - h);
        const room: Room = {
          x, y, w, h,
          cx: Math.floor(x + w / 2),
          cy: Math.floor(y + h / 2),
        };
        carveRoom(tiles, room);
        rooms.push(room);
      }
    }

    // --- join them: spanning tree first, then a few loops --------------
    const edges: [number, number][] = [];
    for (let sy = 0; sy < SECTORS_Y; sy++) {
      for (let sx = 0; sx < SECTORS_X; sx++) {
        const i = sy * SECTORS_X + sx;
        if (sx + 1 < SECTORS_X) edges.push([i, i + 1]);
        if (sy + 1 < SECTORS_Y) edges.push([i, i + SECTORS_X]);
      }
    }
    rng.shuffle(edges);

    const dsu = new DisjointSet(rooms.length);
    const unused: [number, number][] = [];
    for (const [a, b] of edges) {
      if (dsu.union(a, b)) connect(tiles, rooms[a], rooms[b], rng);
      else unused.push([a, b]);
    }
    // A pure tree makes every fight a dead end. Two or three extra links give
    // the player somewhere to run to, which the Trace clock depends on.
    const extras = 2 + rng.int(2);
    for (let i = 0; i < extras && unused.length; i++) {
      const [a, b] = unused.splice(rng.int(unused.length), 1)[0];
      connect(tiles, rooms[a], rooms[b], rng);
    }

    // --- spawn and lift, as far apart as the layout allows -------------
    const spawnRoom = rooms[rng.int(rooms.length)];
    const spawn = { x: spawnRoom.cx, y: spawnRoom.cy };
    if (!WALKABLE.has(tiles[at(spawn.x, spawn.y)])) continue;

    const dist = flowField(navOf(tiles), [spawn]);
    let liftRoom = spawnRoom;
    let best = -1;
    for (const room of rooms) {
      const d = dist[at(room.cx, room.cy)];
      if (d < 0x7fffffff && d > best) {
        best = d;
        liftRoom = room;
      }
    }
    if (best < 20) continue; // too cramped to be worth the walk

    // The Warden spawns at the lift, so the arena has to BE the lift room.
    // This expanded an arbitrary room instead, which built the pillars
    // somewhere the boss never stood and left the actual fight happening in
    // whatever cramped bay held the exit. The harness saw it immediately: the
    // Warden went from 8.8% of all deaths to 44.8%.
    if (floor === BOSS_FLOOR) expandBossRoom(tiles, liftRoom);

    const lift = { x: liftRoom.cx, y: liftRoom.cy };
    tiles[at(lift.x, lift.y)] = Tile.Lift;

    // A terminal in a room that is neither the start nor the exit, so jacking
    // in is always a detour rather than something you walk past anyway.
    const midRooms = rooms.filter((r) => r !== spawnRoom && r !== liftRoom);
    if (midRooms.length) {
      const t = rng.pick(midRooms);
      tiles[at(t.cx, t.cy)] = Tile.Terminal;
    }

    // --- dressing, inside rooms only ----------------------------------
    for (const room of rooms) {
      for (let y = room.y; y < room.y + room.h; y++) {
        for (let x = room.x; x < room.x + room.w; x++) {
          if (tiles[at(x, y)] !== Tile.Floor) continue;
          const roll = rng.next();
          if (roll < 0.05) tiles[at(x, y)] = Tile.Rubble;
          else if (roll < 0.08) tiles[at(x, y)] = Tile.Grate;
        }
      }
    }

    // --- verify rather than assume ------------------------------------
    const finalDist = flowField(navOf(tiles), [spawn]);
    if (finalDist[at(lift.x, lift.y)] >= 0x7fffffff) continue;

    const region = reachable(navOf(tiles), spawn);
    if (region.size < 220) continue;
    const open = [...region].map((i) => ({ x: i % MAP_W, y: Math.floor(i / MAP_W) }));

    return { tiles, spawn, lift, rooms, open, distFromSpawn: finalDist };
  }
  throw new Error('mapgen: exhausted attempts');
}
