/** Consumables, chrome and quickhack tables. Data only. */

import type { Chrome, ChromeSlot, ItemKind } from '../sim/types.ts';

export interface ItemTemplate {
  kind: ItemKind;
  name: string;
  sprite: string;
  charges: number;
  weight: number;
  desc: string;
}

export const ITEMS: Record<string, ItemTemplate> = {
  medkit: {
    kind: 'medkit', name: 'TRAUMA KIT', sprite: 'medkit', charges: 1, weight: 10,
    desc: 'Restores 35 integrity.',
  },
  powercell: {
    kind: 'powercell', name: 'POWER CELL', sprite: 'powercell', charges: 1, weight: 10,
    desc: 'Restores 40 power.',
  },
  ghostshunt: {
    kind: 'ghostshunt', name: 'GHOST SHUNT', sprite: 'ghostshunt', charges: 1, weight: 3,
    desc: 'Wipes all trace on this floor.',
  },
  emp: {
    kind: 'emp', name: 'EMP CHARGE', sprite: 'emp', charges: 1, weight: 5,
    desc: 'Locks every networked actor in sight for 4 turns.',
  },
  stim: {
    kind: 'stim', name: 'COMBAT STIM', sprite: 'stim', charges: 1, weight: 6,
    desc: 'Unidentified. Something happens.',
  },
  chip: {
    kind: 'chip', name: 'WETWARE CHIP', sprite: 'chip', charges: 1, weight: 7,
    desc: 'Unidentified chrome. Installing costs integrity and raises trace.',
  },
};

/**
 * Chrome. `instability` is the price of the power (DESIGN.md §6.6) — the
 * strongest implants here are the ones that start corrupting the interface.
 */
export const CHROME: Record<string, Chrome> = {
  lowlight: {
    kind: 'lowlight', name: 'LOWLIGHT OPTICS', slot: 'optic', instability: 2,
    desc: 'No darkness penalty. Safe, boring, correct.',
  },
  kiroshi: {
    kind: 'kiroshi', name: 'KIROSHI MK4', slot: 'optic', instability: 5,
    desc: '+3 sight. Networked: leaks trace every turn.',
  },
  reflex: {
    kind: 'reflex', name: 'REFLEX TENDONS', slot: 'legs', instability: 4,
    desc: '+50 speed.',
  },
  magboots: {
    kind: 'magboots', name: 'MAG-BOOTS', slot: 'legs', instability: 2,
    desc: 'Immune to knockback and floor hazards.',
  },
  monowire: {
    kind: 'monowire', name: 'MONOWIRE', slot: 'arm', instability: 6,
    desc: 'Melee hits every adjacent enemy.',
  },
  gorilla: {
    kind: 'gorilla', name: 'GORILLA SERVOS', slot: 'arm', instability: 4,
    desc: '+4 melee damage.',
  },
  subdermal: {
    kind: 'subdermal', name: 'SUBDERMAL PLATE', slot: 'torso', instability: 3,
    desc: '+3 armor, -20 speed.',
  },
  bloodpump: {
    kind: 'bloodpump', name: 'BLOOD PUMP', slot: 'torso', instability: 5,
    desc: 'Heal 6 integrity on every kill.',
  },
  bandwidth: {
    kind: 'bandwidth', name: 'BANDWIDTH AMP', slot: 'neural', instability: 6,
    desc: 'Quickhacks cost 40% less power.',
  },
  sandevistan: {
    kind: 'sandevistan', name: 'SANDEVISTAN', slot: 'neural', instability: 8,
    desc: '+80 speed. Your nerves are not yours any more.',
  },
  dermal: {
    kind: 'dermal', name: 'DERMAL SENSORS', slot: 'skin', instability: 3,
    desc: 'See adjacent tiles through walls.',
  },
  thermalweave: {
    kind: 'thermalweave', name: 'THERMAL WEAVE', slot: 'skin', instability: 2,
    desc: '+2 armor against ranged fire.',
  },
};

export const CHROME_KINDS = Object.keys(CHROME);

export function chromeBySlot(slot: ChromeSlot): Chrome[] {
  return CHROME_KINDS.map((k) => CHROME[k]).filter((c) => c.slot === slot);
}

export interface QuickhackTemplate {
  kind: string;
  name: string;
  power: number;
  range: number;
  desc: string;
}

export const HACKS: Record<string, QuickhackTemplate> = {
  overheat: {
    kind: 'overheat', name: 'OVERHEAT', power: 15, range: 7,
    desc: 'Burns the target for 4 turns.',
  },
  lock: {
    kind: 'lock', name: 'SYSTEM LOCK', power: 30, range: 6,
    desc: 'Target cannot act for 3 turns.',
  },
  blind: {
    kind: 'blind', name: 'BLIND OPTICS', power: 20, range: 7,
    desc: "Target's sight drops to 1 for 6 turns.",
  },
};

export const HACK_KINDS = ['overheat', 'lock', 'blind'] as const;

/** Weighted loot table for a floor. */
export function lootTable(): { kinds: string[]; weights: number[] } {
  const kinds = Object.keys(ITEMS);
  return { kinds, weights: kinds.map((k) => ITEMS[k].weight) };
}
