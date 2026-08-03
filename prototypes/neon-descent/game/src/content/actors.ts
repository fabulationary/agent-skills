/** Actor templates. Data only — behaviour lives in sim/ai.ts. */

import type { AiKind, Faction } from '../sim/types.ts';

export interface ActorTemplate {
  kind: string;
  name: string;
  sprite: string;
  hp: number;
  armor: number;
  dmgLo: number;
  dmgHi: number;
  speed: number;
  sight: number;
  ai: AiKind;
  faction: Faction;
  breachable: boolean;
  networked: boolean;
  rangedRange: number;
  explodes: number;
  cowardly: boolean;
  big: boolean;
  /** Relative spawn weight per floor; index 0 is floor 1. */
  weights: number[];
}

const base = {
  armor: 0,
  speed: 100,
  faction: 'hostile' as Faction,
  breachable: false,
  networked: false,
  rangedRange: 0,
  explodes: 0,
  cowardly: false,
  big: false,
};

export const ACTORS: Record<string, ActorTemplate> = {
  player: {
    ...base,
    kind: 'player',
    name: 'DIVER',
    sprite: 'player',
    hp: 110,
    dmgLo: 6,
    dmgHi: 11,
    sight: 7,
    ai: 'none',
    faction: 'player',
    weights: [],
  },

  // --- Act I ------------------------------------------------------------
  picker: {
    ...base,
    kind: 'picker',
    name: 'PICKER',
    sprite: 'picker',
    hp: 16,
    dmgLo: 3,
    dmgHi: 6,
    speed: 100,
    sight: 6,
    ai: 'melee',
    cowardly: true,
    weights: [10, 8, 6, 4],
  },
  drone: {
    ...base,
    kind: 'drone',
    name: 'SCRAPPER DRONE',
    sprite: 'drone',
    hp: 10,
    dmgLo: 2,
    dmgHi: 4,
    speed: 150,
    sight: 7,
    ai: 'drone',
    breachable: true,
    networked: true,
    explodes: 8,
    weights: [6, 8, 8, 7],
  },
  grafted: {
    ...base,
    kind: 'grafted',
    name: 'GRAFTED',
    sprite: 'grafted',
    hp: 24,
    armor: 1,
    dmgLo: 4,
    dmgHi: 8,
    // Was 130. At that speed it got four actions to the player's three and
    // caused 42% of all deaths in the harness — past the 25% line that says
    // one enemy has stopped being a threat and started being the difficulty.
    // Still the fastest thing in Act I, just no longer the whole of it.
    speed: 115,
    sight: 8,
    ai: 'brute',
    weights: [1, 4, 7, 9],
  },
  turret: {
    ...base,
    kind: 'turret',
    name: 'SEC TURRET',
    sprite: 'turret',
    hp: 22,
    armor: 3,
    dmgLo: 4,
    dmgHi: 8,
    speed: 100,
    sight: 7,
    ai: 'turret',
    breachable: true,
    networked: true,
    rangedRange: 6,
    weights: [2, 3, 4, 5],
  },

  // --- Escalation -------------------------------------------------------
  hunter: {
    ...base,
    kind: 'hunter',
    name: 'HUNTER-KILLER',
    sprite: 'hunter',
    hp: 60,
    armor: 4,
    dmgLo: 11,
    dmgHi: 18,
    // Exactly the player's base speed, and this number is load-bearing. The
    // design promises you can outrun it to the elevator; at 120 you provably
    // could not, and the balance harness showed it causing 60% of all deaths.
    // At 100 it never closes the gap while you keep moving, and every turn you
    // spend on anything else it takes back. That is a warning, not a sentence.
    speed: 100,
    sight: 40, // it does not need to see you; it has your trace
    ai: 'hunter',
    networked: true,
    weights: [],
  },
  secdrone: {
    ...base,
    kind: 'secdrone',
    name: 'SEC-DRONE',
    sprite: 'drone',
    hp: 18,
    armor: 1,
    dmgLo: 4,
    dmgHi: 7,
    speed: 140,
    sight: 8,
    ai: 'drone',
    breachable: true,
    networked: true,
    explodes: 6,
    weights: [],
  },

  // --- Boss -------------------------------------------------------------
  warden: {
    ...base,
    kind: 'warden',
    name: 'THE WARDEN',
    sprite: 'warden',
    hp: 130,
    armor: 5,
    dmgLo: 10,
    dmgHi: 16,
    speed: 80, // slow: the arena's pillars are the answer
    sight: 10,
    ai: 'warden',
    big: true,
    weights: [],
  },
};

/** Weighted spawn table for a floor (1-based). */
export function spawnTable(floor: number): { kinds: string[]; weights: number[] } {
  const kinds: string[] = [];
  const weights: number[] = [];
  for (const t of Object.values(ACTORS)) {
    const w = t.weights[floor - 1] ?? 0;
    if (w > 0) {
      kinds.push(t.kind);
      weights.push(w);
    }
  }
  return { kinds, weights };
}
