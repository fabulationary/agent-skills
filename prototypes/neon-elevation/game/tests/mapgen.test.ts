import { describe, expect, it } from 'vitest';
import { streamFor } from '../src/core/rng.ts';
import { generateFloor, MAP_H, MAP_W } from '../src/sim/mapgen.ts';
import { reachable } from '../src/sim/path.ts';
import { Tile, WALKABLE } from '../src/sim/types.ts';

const navOf = (tiles: number[]) => ({
  w: MAP_W,
  h: MAP_H,
  walkable: (x: number, y: number) =>
    x >= 0 && y >= 0 && x < MAP_W && y < MAP_H && WALKABLE.has(tiles[y * MAP_W + x]),
});

/**
 * The property that matters most in a roguelike: a floor you cannot finish is
 * the worst bug the genre has. This is the test that prevents it.
 */
describe('Act I generator', () => {
  const SEEDS = 300;

  it('always connects spawn to the lift', () => {
    for (let i = 0; i < SEEDS; i++) {
      for (const floor of [1, 2, 3, 4]) {
        const rng = streamFor(`prop-${i}`, 'mapgen', floor);
        const map = generateFloor(rng, floor);
        const reach = reachable(navOf(map.tiles), map.spawn);
        const liftIdx = map.lift.y * MAP_W + map.lift.x;
        expect(
          reach.has(liftIdx),
          `seed prop-${i} floor ${floor}: lift unreachable`,
        ).toBe(true);
      }
    }
  });

  it('places exactly one lift', () => {
    for (let i = 0; i < 60; i++) {
      const map = generateFloor(streamFor(`elev-${i}`, 'mapgen', 2), 2);
      const count = map.tiles.filter((t) => t === Tile.Lift).length;
      expect(count).toBe(1);
    }
  });

  it('seals the border so nothing can walk off the map', () => {
    const map = generateFloor(streamFor('border', 'mapgen', 1), 1);
    for (let x = 0; x < MAP_W; x++) {
      expect(WALKABLE.has(map.tiles[x])).toBe(false);
      expect(WALKABLE.has(map.tiles[(MAP_H - 1) * MAP_W + x])).toBe(false);
    }
    for (let y = 0; y < MAP_H; y++) {
      expect(WALKABLE.has(map.tiles[y * MAP_W])).toBe(false);
      expect(WALKABLE.has(map.tiles[y * MAP_W + MAP_W - 1])).toBe(false);
    }
  });

  it('is deterministic for a given seed and floor', () => {
    const a = generateFloor(streamFor('same', 'mapgen', 3), 3);
    const b = generateFloor(streamFor('same', 'mapgen', 3), 3);
    expect(a.tiles).toEqual(b.tiles);
    expect(a.spawn).toEqual(b.spawn);
    expect(a.lift).toEqual(b.lift);
  });

  it('gives every open tile a route back to spawn', () => {
    for (let i = 0; i < 40; i++) {
      const map = generateFloor(streamFor(`orphan-${i}`, 'mapgen', 1), 1);
      const reach = reachable(navOf(map.tiles), map.spawn);
      for (const tile of map.open) {
        expect(reach.has(tile.y * MAP_W + tile.x)).toBe(true);
      }
    }
  });
});
