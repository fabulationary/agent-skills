/**
 * Combat resolution (DESIGN.md §6.7).
 *
 * Melee is deterministic-ish and free; ranged trades a Trace bill for reach;
 * armor subtracts flat damage so that small hits become genuinely worthless.
 */

import type { RNG } from '../core/rng.ts';
import { dist } from '../core/grid.ts';
import { armorBonus, damageMultiplier, meleeBonus } from './chrome.ts';
import type { Actor, World } from './types.ts';

export interface DamageResult {
  dealt: number;
  killed: boolean;
  crit: boolean;
}

export function rollDamage(rng: RNG, lo: number, hi: number): number {
  return rng.range(lo, hi);
}

/** Ranged accuracy: falls off with distance, rises against unaware targets. */
export function hitChance(shooter: Actor, target: Actor, alertBonus: number): number {
  const d = dist(shooter, target);
  let chance = 0.92 - Math.max(0, d - 2) * 0.07;
  if (!target.aware) chance += 0.15;
  chance += alertBonus;
  return Math.max(0.25, Math.min(0.97, chance));
}

export function applyDamage(
  world: World,
  target: Actor,
  raw: number,
  opts: { ranged?: boolean; fromPlayer?: boolean; crit?: boolean } = {},
): DamageResult {
  let armor = target.armor;
  if (target.faction === 'player') armor += armorBonus(world.player, !!opts.ranged);

  let dmg = raw;
  if (opts.fromPlayer) dmg = Math.round(dmg * damageMultiplier(world.player.instability));
  dmg = Math.max(1, dmg - armor); // never fully absorbed: attrition must exist

  target.hp -= dmg;
  target.aware = true;
  return { dealt: dmg, killed: target.hp <= 0, crit: !!opts.crit };
}

export function playerMeleeDamage(world: World, rng: RNG): { dmg: number; crit: boolean } {
  const crit = rng.chance(0.12);
  const base = rng.range(6, 11) + meleeBonus(world.player);
  return { dmg: crit ? Math.round(base * 1.8) : base, crit };
}

export function playerRangedDamage(rng: RNG): { dmg: number; crit: boolean } {
  const crit = rng.chance(0.08);
  const base = rng.range(8, 14);
  return { dmg: crit ? Math.round(base * 1.7) : base, crit };
}

/**
 * Line of sight for shooting — Bresenham against tile transparency. Shares the
 * "if you can see it, it can see you" guarantee with FOV.
 */
export function hasLineOfSight(
  x0: number, y0: number, x1: number, y1: number,
  transparent: (x: number, y: number) => boolean,
): boolean {
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let guard = 0;
  while (guard++ < 200) {
    if (x === x1 && y === y1) return true;
    if (!(x === x0 && y === y0) && !transparent(x, y)) return false;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
  return false;
}
