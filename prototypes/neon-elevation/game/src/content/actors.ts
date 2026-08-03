/** Actor templates. Data only — behaviour lives in sim/ai.ts. */

import type { AiKind, Faction, Family } from '../sim/types.ts';

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
  family: Family;
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
  family: 'machine' as Family,
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
    name: 'CLIMBER',
    sprite: 'player',
    family: 'human',
    hp: 110,
    dmgLo: 6,
    dmgHi: 11,
    sight: 7,
    ai: 'none',
    faction: 'player',
    weights: [],
  },

  // --- Act I: Baseline, the arcology at Umbilical Gamma's foot -----------
  picker: {
    ...base,
    kind: 'picker',
    name: 'PICKER',
    sprite: 'picker',
    family: 'human',
    hp: 16,
    dmgLo: 3,
    dmgHi: 6,
    speed: 100,
    sight: 6,
    ai: 'melee',
    cowardly: true,
    weights: [10, 8, 6, 4],
  },
  dockdrone: {
    ...base,
    kind: 'dockdrone',
    name: 'DOCK DRONE',
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
    family: 'human',
    hp: 24,
    armor: 1,
    dmgLo: 4,
    dmgHi: 8,
    // Was 130. At that speed it got four actions to the player's three and
    // caused 42% of all deaths in the harness — past the 25% line that says
    // one enemy has stopped being a threat and started being the difficulty.
    speed: 115,
    sight: 8,
    ai: 'brute',
    weights: [1, 4, 7, 9],
  },
  turret: {
    ...base,
    kind: 'turret',
    name: 'DOCK TURRET',
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

  /**
   * The first biosynth the player meets, and the only clue in Act I that
   * something has gone wrong at the top of the Umbilical: a pet that came
   * *down*. Spikes bounce off it, an EMP does nothing to it, and it does not
   * hunt by sight — so every machine-shaped habit the player has learned so
   * far quietly stops working.
   */
  stray: {
    ...base,
    kind: 'stray',
    name: 'STRAY',
    sprite: 'stray',
    family: 'biosynth',
    hp: 20,
    armor: 0,
    dmgLo: 5,
    dmgHi: 9,
    speed: 130,
    sight: 5,
    ai: 'brute',
    weights: [0, 2, 4, 6],
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
    // design promises you can outrun it to the lift; at 120 you provably
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
    family: 'human',
    hp: 130,
    armor: 5,
    dmgLo: 10,
    dmgHi: 16,
    speed: 80, // slow: the loading bay's gantries are the answer
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
