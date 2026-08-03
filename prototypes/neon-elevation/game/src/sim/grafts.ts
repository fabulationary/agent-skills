/**
 * Graft and Instability (DESIGN.md §6.6).
 *
 * Installing is always a trade the player opts into: the install prompt states
 * plainly what the next tier will start doing to their interface. A deception
 * the player consented to is a mechanic; one they didn't is a bug.
 */

import { GRAFTS } from '../content/items.ts';
import type { Player, World } from './types.ts';

export type InstabilityTier = 'CLEAN' | 'STATIC' | 'DISSONANCE' | 'FRACTURE' | 'DISSOLUTION';

export function tierFor(instability: number): InstabilityTier {
  if (instability >= 80) return 'DISSOLUTION';
  if (instability >= 60) return 'FRACTURE';
  if (instability >= 40) return 'DISSONANCE';
  if (instability >= 20) return 'STATIC';
  return 'CLEAN';
}

export const TIER_WARNING: Record<InstabilityTier, string> = {
  CLEAN: '',
  STATIC: 'YOUR HUD WILL START TEARING.',
  DISSONANCE: 'SPIKES WILL SOMETIMES PICK THEIR OWN TARGETS. YOU HIT HARDER.',
  FRACTURE: 'THREAT COLOURS WILL SOMETIMES LIE TO YOU. YOU HIT MUCH HARDER.',
  DISSOLUTION: 'YOU CANNOT CHOOSE TO LEAVE A FLOOR. CLEAR IT OR DIE ON IT.',
};

/** Damage multiplier granted by Instability — the reason anyone accepts it. */
export function damageMultiplier(instability: number): number {
  switch (tierFor(instability)) {
    case 'DISSONANCE': return 1.10;
    case 'FRACTURE': return 1.25;
    case 'DISSOLUTION': return 1.50;
    default: return 1;
  }
}

/** At DISSOLUTION the lift stops being an option. */
export function canAscend(world: World): boolean {
  if (tierFor(world.player.instability) !== 'DISSOLUTION') return true;
  return !world.actors.some((a) => a.faction === 'hostile' && a.hp > 0);
}

export function has(player: Player, kind: string): boolean {
  return Object.values(player.grafts).some((c) => c && c.kind === kind);
}

export function install(player: Player, kind: string): { ok: boolean; replaced?: string } {
  const grafts = GRAFTS[kind];
  if (!grafts) return { ok: false };
  const previous = player.grafts[grafts.slot];
  player.grafts[grafts.slot] = grafts;
  player.instability = Math.min(100, player.instability + grafts.instability);
  return { ok: true, replaced: previous?.name };
}

// --- Derived stats. Every implant's effect is resolved here, in one place, so
// --- that "what is my actual sight radius" has exactly one answer.

export function sightRadius(world: World, base: number): number {
  let r = base;
  if (has(world.player, 'farsight')) r += 3;
  if (world.player.instability >= 60) r -= 1; // the world gets harder to read
  return Math.max(2, r);
}

export function speedBonus(player: Player): number {
  let s = 0;
  if (has(player, 'fasttwitch')) s += 50;
  if (has(player, 'slipstream')) s += 80;
  if (has(player, 'platelayer')) s -= 20;
  return s;
}

export function armorBonus(player: Player, ranged: boolean): number {
  let a = 0;
  if (has(player, 'platelayer')) a += 3;
  if (ranged && has(player, 'ablativemesh')) a += 2;
  return a;
}

export function meleeBonus(player: Player): number {
  return has(player, 'piledrivers') ? 4 : 0;
}

export function spikeCost(player: Player, base: number): number {
  return has(player, 'wideband') ? Math.ceil(base * 0.6) : base;
}

/** Networked implants phone home; that is the price of the good optics. */
export function passiveTracePerTurn(player: Player): number {
  return has(player, 'farsight') ? 0.2 : 0;
}
