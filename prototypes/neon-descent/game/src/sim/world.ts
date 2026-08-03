/**
 * World construction, queries and serialization.
 *
 * Nothing in this file (or anywhere under sim/) may touch a browser global —
 * that constraint is what makes the headless balance harness and the unit
 * tests possible (ARCHITECTURE.md §3).
 */

import { RNG, streamFor } from '../core/rng.ts';
import { dist } from '../core/grid.ts';
import { ACTORS, spawnTable } from '../content/actors.ts';
import { GRAFT_KINDS, ITEMS, lootTable } from '../content/items.ts';
import { computeFov } from './fov.ts';
import { generateFloor, MAP_H, MAP_W } from './mapgen.ts';
import type { NavMap } from './path.ts';
import { sightRadius, has } from './grafts.ts';
import { stateFor, waveInterval } from './trace.ts';
import {
  Tile, TRANSPARENT, WALKABLE,
  type Actor, type Item, type LogLine, type World,
} from './types.ts';

export const FINAL_FLOOR = 4; // Act I vertical slice

export interface Streams {
  mapgen: RNG;
  loot: RNG;
  combat: RNG;
  ai: RNG;
  cosmetic: RNG;
}

/**
 * Streams are derived, never stored globally, so a load restores them exactly.
 *
 * mapgen and loot are seeded per floor and never resumed — floor 3 must
 * generate identically whether you reached it in 200 turns or 900, so its
 * stream cannot inherit state from what happened on floor 2. The long-running
 * streams (combat, ai, cosmetic) do resume, and their state rides in the save.
 */
export function streamsFor(world: World, floor = world.floor): Streams {
  const resume = (name: 'combat' | 'ai' | 'cosmetic') => {
    const rng = streamFor(world.seed, name, 0);
    const saved = world.rngState[name];
    if (saved) rng.load(saved);
    return rng;
  };
  return {
    mapgen: streamFor(world.seed, 'mapgen', floor),
    loot: streamFor(world.seed, 'loot', floor),
    combat: resume('combat'),
    ai: resume('ai'),
    cosmetic: resume('cosmetic'),
  };
}

export function saveStreams(world: World, s: Streams): void {
  world.rngState = {
    combat: s.combat.save(),
    ai: s.ai.save(),
    cosmetic: s.cosmetic.save(),
  };
}

export function tileAt(world: World, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= world.w || y >= world.h) return Tile.Wall;
  return world.tiles[y * world.w + x];
}

export function isWalkable(world: World, x: number, y: number): boolean {
  return WALKABLE.has(tileAt(world, x, y));
}

export function isTransparent(world: World, x: number, y: number): boolean {
  return TRANSPARENT.has(tileAt(world, x, y));
}

export function navOf(world: World): NavMap {
  return {
    w: world.w,
    h: world.h,
    walkable: (x, y) => isWalkable(world, x, y),
  };
}

/** Nav map that also treats living actors as blocking. Used for AI stepping. */
export function navBlocked(world: World, ignoreId: number): NavMap {
  const occupied = new Set<number>();
  for (const a of world.actors) {
    if (a.hp > 0 && a.id !== ignoreId) occupied.add(a.y * world.w + a.x);
  }
  return {
    w: world.w,
    h: world.h,
    walkable: (x, y) => isWalkable(world, x, y) && !occupied.has(y * world.w + x),
  };
}

export function player(world: World): Actor {
  return world.actors[0];
}

export function actorAt(world: World, x: number, y: number): Actor | undefined {
  return world.actors.find((a) => a.hp > 0 && a.x === x && a.y === y);
}

export function itemAt(world: World, x: number, y: number): Item | undefined {
  return world.items.find((i) => i.x === x && i.y === y);
}

/**
 * Coalesce consecutive identical messages. A round where four drones each hit
 * you for 3 produces one line reading "x4", not four lines that push every
 * other message off a two-line log.
 */
export function log(world: World, text: string, tone: LogLine['tone'] = 'info'): LogLine {
  const last = world.log[world.log.length - 1];
  if (last && last.text === text) {
    last.count++;
    last.turn = world.turn;
    return last;
  }
  const line: LogLine = { text, tone, turn: world.turn, count: 1 };
  world.log.push(line);
  if (world.log.length > 60) world.log.shift();
  return line;
}

export function makeActor(world: World, kind: string, x: number, y: number): Actor {
  const t = ACTORS[kind];
  const actor: Actor = {
    id: world.nextId++,
    kind: t.kind,
    name: t.name,
    sprite: t.sprite,
    x, y,
    hp: t.hp,
    maxHp: t.hp,
    armor: t.armor,
    dmgLo: t.dmgLo,
    dmgHi: t.dmgHi,
    speed: t.speed,
    energy: 0,
    sight: t.sight,
    faction: t.faction,
    ai: t.ai,
    breachable: t.breachable,
    networked: t.networked,
    rangedRange: t.rangedRange,
    explodes: t.explodes,
    status: { burn: 0, lock: 0, blind: 0 },
    aware: false,
    fleeing: false,
    lastKnownX: -1,
    lastKnownY: -1,
    big: t.big,
  };
  world.actors.push(actor);
  return actor;
}

function makeItem(world: World, kind: string, x: number, y: number, loot: RNG): Item {
  const t = ITEMS[kind];
  const item: Item = {
    id: world.nextId++,
    kind: t.kind,
    name: t.name,
    x, y,
    charges: t.charges,
  };
  if (t.kind === 'graftchip') item.graftKind = loot.pick(GRAFT_KINDS);
  world.items.push(item);
  return item;
}

/** Visible + explored sets, recomputed after every action that can change them. */
export function updateFov(world: World): void {
  const p = player(world);
  const radius = sightRadius(world, p.sight);
  const visible = computeFov(
    { w: world.w, h: world.h, transparent: (x, y) => isTransparent(world, x, y) },
    p.x, p.y, radius,
  );
  // Skin Eyes read the tiles pressed against your skin, walls included.
  if (has(world.player, 'skineyes')) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = p.x + dx;
        const y = p.y + dy;
        if (x >= 0 && y >= 0 && x < world.w && y < world.h) visible.add(y * world.w + x);
      }
    }
  }
  world.visible = new Array(world.w * world.h).fill(false);
  for (const i of visible) {
    world.visible[i] = true;
    world.explored[i] = 1;
  }
}

export function buildFloor(world: World, floor: number): void {
  const streams = streamsFor(world, floor);
  const map = generateFloor(streams.mapgen, floor);

  world.floor = floor;
  world.tiles = map.tiles;
  world.explored = new Array(MAP_W * MAP_H).fill(0);
  world.visible = new Array(MAP_W * MAP_H).fill(false);
  world.items = [];
  world.nextWave = 0;

  const p = player(world);
  p.x = map.spawn.x;
  p.y = map.spawn.y;
  p.energy = 0;
  world.actors = [p];

  const far = map.open.filter((o) => dist(o, map.spawn) > 9);
  const loot = streams.loot;

  if (floor === FINAL_FLOOR) {
    // The Warden waits in its arena. Nothing else shares the floor with it,
    // so the fight reads as an event rather than as another room.
    const boss = makeActor(world, 'warden', map.elevator.x, map.elevator.y - 2);
    boss.aware = false;
    for (let i = 0; i < 5 && far.length; i++) {
      const spot = loot.pick(far);
      makeActor(world, loot.chance(0.5) ? 'picker' : 'grafted', spot.x, spot.y);
    }
  } else {
    const table = spawnTable(floor);
    const count = 7 + floor * 2;
    for (let i = 0; i < count && far.length; i++) {
      const spot = loot.pick(far);
      if (actorAt(world, spot.x, spot.y)) continue;
      makeActor(world, loot.pickWeighted(table.kinds, table.weights), spot.x, spot.y);
    }
  }

  const lt = lootTable();
  const itemCount = 5 + loot.int(3);
  for (let i = 0; i < itemCount && map.open.length; i++) {
    const spot = loot.pick(map.open);
    if (itemAt(world, spot.x, spot.y)) continue;
    if (spot.x === map.spawn.x && spot.y === map.spawn.y) continue;
    makeItem(world, loot.pickWeighted(lt.kinds, lt.weights), spot.x, spot.y, loot);
  }

  world.traceState = stateFor(world.trace);
  const interval = waveInterval(world.traceState);
  world.nextWave = interval ? world.turn + interval : 0;
  saveStreams(world, streams);
  updateFov(world);
}

export function createWorld(seed: string): World {
  const world: World = {
    seed,
    floor: 0,
    turn: 0,
    w: MAP_W,
    h: MAP_H,
    tiles: [],
    explored: [],
    visible: [],
    actors: [],
    items: [],
    player: {
      power: 60,
      maxPower: 100,
      credits: 0,
      instability: 0,
      grafts: {},
      inventory: [],
      ammo: 24,
      maxAmmo: 24,
      kills: 0,
      identified: {},
    },
    trace: 0,
    traceState: 'CLEAR',
    nextWave: 0,
    nextId: 0,
    log: [],
    dead: false,
    won: false,
    salvage: 0,
    rngState: {},
  };

  const p = makeActor(world, 'player', 0, 0);
  p.energy = 100;
  world.actors = [p];

  // Starting kit: the BREAKER archetype (DESIGN.md §6.11).
  world.player.inventory.push(
    { id: world.nextId++, kind: 'patchkit', name: ITEMS.patchkit.name, x: -1, y: -1, charges: 1 },
    { id: world.nextId++, kind: 'patchkit', name: ITEMS.patchkit.name, x: -1, y: -1, charges: 1 },
    { id: world.nextId++, kind: 'powercell', name: ITEMS.powercell.name, x: -1, y: -1, charges: 1 },
  );

  buildFloor(world, 1);
  log(world, 'SUBLEVEL 1. THE STACK IS AWAKE.', 'alert');
  log(world, 'MOVE. STANDING STILL IS HOW DIVERS DIE.', 'info');
  return world;
}

// --- Persistence (ARCHITECTURE.md §8) ---------------------------------------

export const SCHEMA_VERSION = 1;

export function serialize(world: World): string {
  return JSON.stringify({ schemaVersion: SCHEMA_VERSION, world });
}

export function deserialize(raw: string): World | null {
  try {
    const parsed = JSON.parse(raw) as { schemaVersion: number; world: World };
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null; // quarantine, don't crash
    return parsed.world;
  } catch {
    return null;
  }
}
