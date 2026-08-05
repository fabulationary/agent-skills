import { describe, expect, it } from 'vitest';
import { computeFov, type FovMap } from '../src/sim/fov.ts';
import { RNG } from '../src/core/rng.ts';

function mapFrom(rows: string[]): FovMap {
  return {
    w: rows[0].length,
    h: rows.length,
    transparent: (x, y) =>
      x >= 0 && y >= 0 && y < rows.length && x < rows[0].length && rows[y][x] !== '#',
  };
}

describe('shadowcasting FOV', () => {
  it('always includes the origin', () => {
    const map = mapFrom(['###', '#.#', '###']);
    const vis = computeFov(map, 1, 1, 6);
    expect(vis.has(1 * 3 + 1)).toBe(true);
  });

  it('sees the whole of an open room within radius', () => {
    const rows = ['#######', '#.....#', '#.....#', '#..@..#', '#.....#', '#.....#', '#######'];
    const map = mapFrom(rows);
    const vis = computeFov(map, 3, 3, 8);
    for (let y = 1; y <= 5; y++) {
      for (let x = 1; x <= 5; x++) {
        expect(vis.has(y * 7 + x), `open tile ${x},${y} should be visible`).toBe(true);
      }
    }
  });

  it('does not see through a solid wall', () => {
    const rows = [
      '#########',
      '#...#...#',
      '#...#...#',
      '#.@.#...#',
      '#...#...#',
      '#########',
    ];
    const map = mapFrom(rows);
    const vis = computeFov(map, 2, 3, 10);
    // Tiles beyond the full-height wall are unreachable by any ray.
    for (let y = 1; y <= 4; y++) {
      expect(vis.has(y * 9 + 6), `${6},${y} must be hidden`).toBe(false);
      expect(vis.has(y * 9 + 7), `${7},${y} must be hidden`).toBe(false);
    }
  });

  it('respects the radius', () => {
    const rows = Array.from({ length: 21 }, () => '.'.repeat(21));
    const map = mapFrom(rows);
    const vis = computeFov(map, 10, 10, 4);
    expect(vis.has(10 * 21 + 14)).toBe(true);  // exactly at radius
    expect(vis.has(10 * 21 + 16)).toBe(false); // beyond it
  });

  /**
   * The design guarantee: if you can see it, it can see you. Players plan
   * around this, so it is asserted over random maps rather than assumed.
   */
  it('is symmetric over random maps', () => {
    const rng = new RNG('fov-symmetry');
    for (let trial = 0; trial < 40; trial++) {
      const size = 17;
      const rows: string[] = [];
      for (let y = 0; y < size; y++) {
        let row = '';
        for (let x = 0; x < size; x++) {
          const edge = x === 0 || y === 0 || x === size - 1 || y === size - 1;
          row += edge || rng.chance(0.22) ? '#' : '.';
        }
        rows.push(row);
      }
      const map = mapFrom(rows);
      const open: [number, number][] = [];
      for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) if (rows[y][x] === '.') open.push([x, y]);
      }
      if (open.length < 6) continue;

      const radius = 6;
      const cache = new Map<string, Set<number>>();
      const fovAt = (x: number, y: number) => {
        const key = `${x},${y}`;
        let v = cache.get(key);
        if (!v) {
          v = computeFov(map, x, y, radius);
          cache.set(key, v);
        }
        return v;
      };

      for (let i = 0; i < 25; i++) {
        const [ax, ay] = open[rng.int(open.length)];
        const [bx, by] = open[rng.int(open.length)];
        const aSeesB = fovAt(ax, ay).has(by * size + bx);
        const bSeesA = fovAt(bx, by).has(ay * size + ax);
        expect(aSeesB, `symmetry broke between ${ax},${ay} and ${bx},${by}`).toBe(bSeesA);
      }
    }
  });
});
