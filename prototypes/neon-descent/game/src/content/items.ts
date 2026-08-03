/** Consumables, grafts and spike tables. Data only. */

import type { Graft, GraftSlot, ItemKind, SpikeKind } from '../sim/types.ts';

export interface ItemTemplate {
  kind: ItemKind;
  name: string;
  sprite: string;
  charges: number;
  weight: number;
  desc: string;
}

export const ITEMS: Record<string, ItemTemplate> = {
  patchkit: {
    kind: 'patchkit', name: 'PATCH KIT', sprite: 'patchkit', charges: 1, weight: 10,
    desc: 'Restores 35 integrity.',
  },
  powercell: {
    kind: 'powercell', name: 'POWER CELL', sprite: 'powercell', charges: 1, weight: 10,
    desc: 'Restores 40 power.',
  },
  scrub: {
    kind: 'scrub', name: 'SIGNAL SCRUB', sprite: 'scrub', charges: 1, weight: 3,
    desc: 'Wipes all trace on this floor.',
  },
  emp: {
    kind: 'emp', name: 'EMP CHARGE', sprite: 'emp', charges: 1, weight: 5,
    desc: 'Locks every networked actor in sight for 4 turns.',
  },
  ampoule: {
    kind: 'ampoule', name: 'AMPOULE', sprite: 'ampoule', charges: 1, weight: 6,
    desc: 'Unidentified. Something happens.',
  },
  graftchip: {
    kind: 'graftchip', name: 'GRAFT CHIP', sprite: 'graftchip', charges: 1, weight: 7,
    desc: 'Unidentified graft. Installing costs integrity and raises trace.',
  },
};

/**
 * Graft. `instability` is the price of the power (DESIGN.md §6.6) — the
 * strongest implants here are the ones that start corrupting the interface.
 */
export const GRAFTS: Record<string, Graft> = {
  nightsplice: {
    kind: 'nightsplice', name: 'NIGHT SPLICE', slot: 'optic', instability: 2,
    desc: 'No darkness penalty. Safe, boring, correct.',
  },
  farsight: {
    kind: 'farsight', name: 'FARSIGHT ARRAY', slot: 'optic', instability: 5,
    desc: '+3 sight. Networked: leaks trace every turn.',
  },
  fasttwitch: {
    kind: 'fasttwitch', name: 'FAST TWITCH', slot: 'legs', instability: 4,
    desc: '+50 speed.',
  },
  anchorsoles: {
    kind: 'anchorsoles', name: 'ANCHOR SOLES', slot: 'legs', instability: 2,
    desc: 'Immune to knockback and floor hazards.',
  },
  ribbonedge: {
    kind: 'ribbonedge', name: 'RIBBON EDGE', slot: 'arm', instability: 6,
    desc: 'Melee hits every adjacent enemy.',
  },
  piledrivers: {
    kind: 'piledrivers', name: 'PILE DRIVERS', slot: 'arm', instability: 4,
    desc: '+4 melee damage.',
  },
  platelayer: {
    kind: 'platelayer', name: 'PLATELAYER', slot: 'torso', instability: 3,
    desc: '+3 armor, -20 speed.',
  },
  leechvalve: {
    kind: 'leechvalve', name: 'LEECH VALVE', slot: 'torso', instability: 5,
    desc: 'Heal 6 integrity on every kill.',
  },
  wideband: {
    kind: 'wideband', name: 'WIDE BAND', slot: 'neural', instability: 6,
    desc: 'Spikes cost 40% less power.',
  },
  slipstream: {
    kind: 'slipstream', name: 'SLIPSTREAM', slot: 'neural', instability: 8,
    desc: '+80 speed. Your nerves are not yours any more.',
  },
  skineyes: {
    kind: 'skineyes', name: 'SKIN EYES', slot: 'skin', instability: 3,
    desc: 'See adjacent tiles through walls.',
  },
  ablativemesh: {
    kind: 'ablativemesh', name: 'ABLATIVE MESH', slot: 'skin', instability: 2,
    desc: '+2 armor against ranged fire.',
  },
};

export const GRAFT_KINDS = Object.keys(GRAFTS);

export function graftsBySlot(slot: GraftSlot): Graft[] {
  return GRAFT_KINDS.map((k) => GRAFTS[k]).filter((c) => c.slot === slot);
}

/**
 * Spikes: the intrusion programs you push into a target's systems.
 *
 * Keyed by a union rather than `string`, so a lookup key that drifts from a
 * table key is a compile error. It was `Record<string, …>` and the keys did
 * drift during a rename — `SPIKES.lockout` was silently undefined, which is a
 * crash the moment anyone taps the slot.
 */
export interface SpikeTemplate {
  kind: SpikeKind;
  name: string;
  power: number;
  range: number;
  desc: string;
}

export const SPIKES: Record<SpikeKind, SpikeTemplate> = {
  overload: {
    kind: 'overload', name: 'OVERLOAD', power: 15, range: 7,
    desc: 'Cooks the target from the inside for 4 turns.',
  },
  lockout: {
    kind: 'lockout', name: 'LOCKOUT', power: 30, range: 6,
    desc: 'Target cannot act for 3 turns.',
  },
  dazzle: {
    kind: 'dazzle', name: 'DAZZLE', power: 20, range: 7,
    desc: "Target's sight drops to 1 for 6 turns.",
  },
};

export const SPIKE_KINDS: readonly SpikeKind[] = ['overload', 'lockout', 'dazzle'];

/** Weighted loot table for a floor. */
export function lootTable(): { kinds: string[]; weights: number[] } {
  const kinds = Object.keys(ITEMS);
  return { kinds, weights: kinds.map((k) => ITEMS[k].weight) };
}
