import { describe, expect, it } from 'vitest';
import { vectorToDir } from '../src/core/grid.ts';
import { RNG, streamFor } from '../src/core/rng.ts';
import { canStep, findPath } from '../src/sim/path.ts';
import { stateFor, STATE_RANK, waveInterval } from '../src/sim/trace.ts';
import { damageMultiplier, tierFor, TIER_WARNING } from '../src/sim/grafts.ts';
import { createWorld, deserialize, serialize, player } from '../src/sim/world.ts';
import { execute } from '../src/sim/turn.ts';
import { ACTORS } from '../src/content/actors.ts';
import { GRAFTS, ITEMS, SPIKES, SPIKE_KINDS } from '../src/content/items.ts';
import { SPRITES } from '../src/render/sprites.ts';
import { P } from '../src/render/palette.ts';

describe('RNG', () => {
  it('is reproducible from a seed', () => {
    const a = new RNG('abc');
    const b = new RNG('abc');
    const left = Array.from({ length: 50 }, () => a.next());
    const right = Array.from({ length: 50 }, () => b.next());
    expect(left).toEqual(right);
  });

  it('keeps streams independent', () => {
    const combat = streamFor('seed', 'combat');
    const loot = streamFor('seed', 'loot');
    expect(combat.next()).not.toBe(loot.next());
  });

  it('round-trips its state', () => {
    const rng = new RNG('state');
    for (let i = 0; i < 10; i++) rng.next();
    const snapshot = rng.save();
    const expected = Array.from({ length: 5 }, () => rng.next());
    rng.load(snapshot);
    expect(Array.from({ length: 5 }, () => rng.next())).toEqual(expected);
  });
});

describe('swipe direction cones', () => {
  it('maps cardinal vectors to the right directions', () => {
    expect(vectorToDir(0, -10)).toBe(0);  // north
    expect(vectorToDir(10, 0)).toBe(2);   // east
    expect(vectorToDir(0, 10)).toBe(4);   // south
    expect(vectorToDir(-10, 0)).toBe(6);  // west
    expect(vectorToDir(10, -10)).toBe(1); // north-east
  });

  it('rejects off-axis swipes when the cone is tightened', () => {
    // 22 degrees off east: inside a 45-degree cone, outside a 20-degree one.
    const dx = Math.cos((22 * Math.PI) / 180);
    const dy = Math.sin((22 * Math.PI) / 180);
    expect(vectorToDir(dx, dy, 45)).toBe(2);
    expect(vectorToDir(dx, dy, 20)).toBeNull();
  });
});

describe('pathfinding', () => {
  const rows = ['.....', '.###.', '.....', '.###.', '.....'];
  const nav = {
    w: 5, h: 5,
    walkable: (x: number, y: number) =>
      x >= 0 && y >= 0 && x < 5 && y < 5 && rows[y][x] === '.',
  };

  it('finds a route around walls', () => {
    const path = findPath(nav, { x: 0, y: 0 }, { x: 4, y: 4 });
    expect(path).not.toBeNull();
    expect(path!.at(-1)).toEqual({ x: 4, y: 4 });
  });

  it('returns null when there is no route', () => {
    const sealed = {
      w: 3, h: 3,
      walkable: (x: number, y: number) => (x === 0 && y === 0) || (x === 2 && y === 2),
    };
    expect(findPath(sealed, { x: 0, y: 0 }, { x: 2, y: 2 })).toBeNull();
  });

  /**
   * Regression: A* used to exempt the goal tile from the corner rule, so it
   * could return a first step the turn pipeline legally refuses. That costs no
   * turn, so the caller retried forever — a silent soft-lock for tap-to-path
   * and an infinite loop in the balance harness.
   */
  it('returns paths whose every step the turn pipeline would accept', () => {
    const world = createWorld('path-agrees');
    const p = player(world);
    const nav = {
      w: world.w, h: world.h,
      walkable: (x: number, y: number) => {
        const t = world.tiles[y * world.w + x];
        return t === 1 || t === 2 || t === 3 || t === 5;
      },
    };
    let checked = 0;
    for (let i = 0; i < world.tiles.length && checked < 40; i++) {
      if (!nav.walkable(i % world.w, Math.floor(i / world.w))) continue;
      const goal = { x: i % world.w, y: Math.floor(i / world.w) };
      const path = findPath(nav, p, goal);
      if (!path?.length) continue;
      checked++;
      let from = { x: p.x, y: p.y };
      for (const step of path) {
        expect(
          canStep(nav, from.x, from.y, step.x, step.y),
          `illegal step ${from.x},${from.y} -> ${step.x},${step.y}`,
        ).toBe(true);
        from = step;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('refuses to cut a diagonal corner between two walls', () => {
    const corner = {
      w: 3, h: 3,
      walkable: (x: number, y: number) => !((x === 1 && y === 0) || (x === 0 && y === 1)),
    };
    expect(canStep(corner, 0, 0, 1, 1)).toBe(false);
    expect(canStep(corner, 1, 1, 2, 2)).toBe(true);
  });
});

describe('trace escalation', () => {
  it('crosses thresholds in order', () => {
    expect(stateFor(0)).toBe('CLEAR');
    expect(stateFor(24.9)).toBe('CLEAR');
    expect(stateFor(25)).toBe('ALERT');
    expect(stateFor(50)).toBe('HUNT');
    expect(stateFor(75)).toBe('LOCKDOWN');
    expect(stateFor(95)).toBe('PURGE');
    expect(stateFor(100)).toBe('PURGE');
  });

  it('escalates monotonically', () => {
    let previous = -1;
    for (let t = 0; t <= 100; t++) {
      const rank = STATE_RANK[stateFor(t)];
      expect(rank).toBeGreaterThanOrEqual(previous);
      previous = rank;
    }
  });

  it('spawns waves faster as the alert climbs', () => {
    expect(waveInterval('CLEAR')).toBe(0);
    expect(waveInterval('HUNT')).toBeGreaterThan(waveInterval('LOCKDOWN'));
    expect(waveInterval('LOCKDOWN')).toBeGreaterThan(waveInterval('PURGE'));
  });
});

describe('instability', () => {
  it('tiers at the documented thresholds', () => {
    expect(tierFor(0)).toBe('CLEAN');
    expect(tierFor(19)).toBe('CLEAN');
    expect(tierFor(20)).toBe('STATIC');
    expect(tierFor(40)).toBe('DISSONANCE');
    expect(tierFor(60)).toBe('FRACTURE');
    expect(tierFor(80)).toBe('DISSOLUTION');
  });

  it('pays for itself in damage', () => {
    expect(damageMultiplier(0)).toBe(1);
    expect(damageMultiplier(45)).toBeGreaterThan(1);
    expect(damageMultiplier(85)).toBeGreaterThan(damageMultiplier(65));
  });

  it('warns in plain words before every tier that alters the interface', () => {
    // The consent that separates the Fracture mechanic from a bug.
    for (const tier of ['STATIC', 'DISSONANCE', 'FRACTURE', 'DISSOLUTION'] as const) {
      expect(TIER_WARNING[tier].length).toBeGreaterThan(10);
    }
  });
});

describe('world and turn pipeline', () => {
  it('builds a playable floor 1', () => {
    const world = createWorld('boot');
    expect(world.floor).toBe(1);
    expect(world.actors.length).toBeGreaterThan(1);
    expect(player(world).hp).toBeGreaterThan(0);
    expect(world.visible.some(Boolean)).toBe(true);
  });

  it('advances the turn counter and the trace clock when the player acts', () => {
    const world = createWorld('clock');
    const before = world.trace;
    execute(world, { kind: 'wait' });
    expect(world.turn).toBe(1);
    expect(world.trace).toBeGreaterThan(before);
  });

  it('never lets a blocked move consume a turn', () => {
    const world = createWorld('blocked');
    const p = player(world);
    // Wall the player in, then try to walk into the wall.
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx || dy) world.tiles[(p.y + dy) * world.w + (p.x + dx)] = 0;
      }
    }
    const turn = world.turn;
    const events = execute(world, { kind: 'move', dir: 2 });
    expect(events.some((e) => e.t === 'blocked')).toBe(true);
    expect(world.turn).toBe(turn);
  });

  it('is fully deterministic for a seed and an intent sequence', () => {
    const play = () => {
      const world = createWorld('determinism');
      for (let i = 0; i < 120; i++) execute(world, { kind: 'move', dir: i % 8 });
      return serialize(world);
    };
    expect(play()).toEqual(play());
  });

  it('round-trips a save', () => {
    const world = createWorld('save');
    for (let i = 0; i < 20; i++) execute(world, { kind: 'move', dir: i % 8 });
    const restored = deserialize(serialize(world));
    expect(restored).not.toBeNull();
    expect(restored!.turn).toBe(world.turn);
    expect(restored!.actors.length).toBe(world.actors.length);
    expect(restored!.trace).toBeCloseTo(world.trace);
  });

  it('quarantines a save from a future schema instead of crashing', () => {
    expect(deserialize('{"schemaVersion":999,"world":{}}')).toBeNull();
    expect(deserialize('not json at all')).toBeNull();
  });

  it('reaches the PURGE state and spawns a hunter-killer', () => {
    const world = createWorld('purge');
    world.trace = 94;
    for (let i = 0; i < 40 && !world.dead; i++) execute(world, { kind: 'wait' });
    expect(world.traceState).toBe('PURGE');
    // Either the hunter arrived, or it already killed the player. Both are the
    // system working; standing still at 95 trace is meant to be fatal.
    const hunted = world.actors.some((a) => a.kind === 'hunter') || world.dead;
    expect(hunted).toBe(true);
  });
});

/**
 * Content tables are looked up by key, so a key that drifts from its own
 * `kind` field is a runtime crash that `Record<string, T>` hides completely.
 * A rename did exactly that: SPIKES was keyed `lock` while every lookup used
 * `lockout`, so tapping the slot would have thrown.
 */
describe('content table integrity', () => {
  it('keys every table by its own kind', () => {
    for (const [key, template] of Object.entries(ITEMS)) {
      expect(template.kind, `ITEMS.${key}`).toBe(key);
    }
    for (const [key, template] of Object.entries(GRAFTS)) {
      expect(template.kind, `GRAFTS.${key}`).toBe(key);
    }
    for (const [key, template] of Object.entries(SPIKES)) {
      expect(template.kind, `SPIKES.${key}`).toBe(key);
    }
    for (const [key, template] of Object.entries(ACTORS)) {
      expect(template.kind, `ACTORS.${key}`).toBe(key);
    }
  });

  it('resolves every declared spike kind', () => {
    for (const kind of SPIKE_KINDS) {
      expect(SPIKES[kind], `SPIKES.${kind} missing`).toBeDefined();
    }
  });

  it('gives every actor and item a sprite that exists', () => {
    for (const template of Object.values(ACTORS)) {
      expect(SPRITES[template.sprite], `sprite ${template.sprite}`).toBeDefined();
    }
    for (const template of Object.values(ITEMS)) {
      expect(SPRITES[template.sprite], `sprite ${template.sprite}`).toBeDefined();
    }
  });

  it('keeps no franchise-derived vocabulary in player-facing names', () => {
    // The naming is meant to be this game's own, not a reskin of someone
    // else's setting bible. Names are what players read, so they get checked.
    const banned = /sandevistan|kerenzikov|kiroshi|monowire|gorilla arms|subdermal|blood pump|second heart|optical camo|quickhack|blackwall|cyberpsych|netrunner|night city|ripperdoc|braindance|trauma team|monoblade|scav\b/i;
    // Bulk-rename artifacts: a system word bolted onto a name it never had.
    // "GRAFTS-HEAD" shipped in a balance report exactly this way.
    const artifact = /grafts-|spike-head|\bgrafts\b\s*-/i;
    const names = [
      ...Object.values(ACTORS).map((a) => a.name),
      ...Object.values(ITEMS).flatMap((i) => [i.name, i.desc]),
      ...Object.values(GRAFTS).flatMap((c) => [c.name, c.desc]),
      ...Object.values(SPIKES).flatMap((s) => [s.name, s.desc]),
      ...Object.values(TIER_WARNING),
    ];
    for (const name of names) {
      expect(banned.test(name), `franchise term in "${name}"`).toBe(false);
      expect(artifact.test(name), `rename artifact in "${name}"`).toBe(false);
    }
  });
});

/**
 * The palette linter from ARCHITECTURE.md §9, as a test: sprites are inline
 * tables in the slice, so style consistency is enforced in CI rather than
 * left to taste.
 */
describe('sprite palette discipline', () => {
  it('keeps every sprite 16x16', () => {
    for (const [name, sprite] of Object.entries(SPRITES)) {
      expect(sprite.length, `${name} row count`).toBe(16);
      for (const [i, row] of sprite.entries()) {
        expect(row.length, `${name} row ${i} width`).toBe(16);
      }
    }
  });

  it('uses only VERGE-36 colors', () => {
    for (const [name, sprite] of Object.entries(SPRITES)) {
      for (const row of sprite) {
        for (const ch of row) {
          if (ch === '.' || ch === ' ') continue;
          expect(P[ch], `${name} uses unknown palette key "${ch}"`).toBeDefined();
        }
      }
    }
  });

  it('keeps each sprite within the 12-color budget', () => {
    for (const [name, sprite] of Object.entries(SPRITES)) {
      const used = new Set<string>();
      for (const row of sprite) for (const ch of row) if (ch !== '.' && ch !== ' ') used.add(ch);
      expect(used.size, `${name} uses ${used.size} colors`).toBeLessThanOrEqual(12);
    }
  });
});
