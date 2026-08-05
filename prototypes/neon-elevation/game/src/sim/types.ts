/** Shared simulation types. Pure data — no DOM, no rendering. */

export const Tile = {
  Wall: 0,
  Floor: 1,
  Rubble: 2,   // walkable, blocks nothing, purely visual variety
  Lift: 3, // ascend here
  Terminal: 4, // jack in: +POWER, reveals map fragment, costs turns
  Grate: 5,    // walkable, transparent, visual
} as const;
export type TileId = (typeof Tile)[keyof typeof Tile];

export const WALKABLE: ReadonlySet<number> = new Set([
  Tile.Floor, Tile.Rubble, Tile.Lift, Tile.Grate,
]);
export const TRANSPARENT: ReadonlySet<number> = new Set([
  Tile.Floor, Tile.Rubble, Tile.Lift, Tile.Terminal, Tile.Grate,
]);

export type Faction = 'player' | 'hostile';

/**
 * The central conflict, expressed as a rule rather than a label (DESIGN.md §6.5).
 *
 * MACHINE things are networked: spikes work on them, killing them leaks Trace,
 * an EMP stops them, and breaking line of sight makes them lose you.
 * BIOSYNTH things are grown: no network to intrude on, no Trace when they die,
 * EMP does nothing — but they hunt by scent, so once they have you, line of
 * sight is irrelevant and only distance or a Scent Baffle sheds them.
 *
 * Every tool in the game is good against exactly one of these. That is the
 * point: your loadout is an argument about which enemy you expect.
 *
 * The two families are not sealed off from each other. Nirvana Station's
 * machines have been running since before the pets woke up, and the biosynths
 * have spent eleven weeks learning to get inside them — see `suborned`.
 */
export type Family = 'human' | 'machine' | 'biosynth';

export interface Status {
  burn: number;  // turns of Overload damage-over-time remaining
  lock: number;  // turns of System Lock (cannot act)
  blind: number; // turns of Blind Optics (sight radius 1)
}

export interface Actor {
  id: number;
  kind: string;           // key into content/actors
  name: string;
  sprite: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  armor: number;
  dmgLo: number;
  dmgHi: number;
  speed: number;          // energy gained per tick; 100 is baseline
  energy: number;
  sight: number;
  faction: Faction;
  family: Family;
  ai: AiKind;
  breachable: boolean;   // machines only: spikes have something to talk to
  networked: boolean;     // killing it spikes Trace; cameras/bots are networked
  rangedRange: number;    // 0 = melee only
  explodes: number;       // damage dealt to adjacent actors on death, 0 = none
  status: Status;
  aware: boolean;         // has noticed the player (drives the threat outline)
  scented: boolean;       // biosynth only: has your scent, and will not lose it
  suborned: boolean;      // machine only: a biosynth has gotten inside it (§6.5)
  fleeing: boolean;
  lastKnownX: number;
  lastKnownY: number;
  big: boolean;           // 2x2 boss sprite
}

export type AiKind =
  | 'none'
  | 'melee'        // approach and hit; flees when hurt if `cowardly`
  | 'brute'        // approach and hit, never flees
  | 'drone'        // approach, explodes on death
  | 'turret'       // immobile, fires when the floor is on alert
  | 'hunter'       // always knows where you are; never stops
  | 'warden';      // boss: melee, charges when at range

export type ItemKind =
  | 'patchkit' | 'powercell' | 'scrub' | 'baffle' | 'emp' | 'ampoule'
  | 'graftchip';        // unidentified until used or read

export interface Item {
  id: number;
  kind: ItemKind;
  name: string;
  x: number;
  y: number;      // -1,-1 when carried
  charges: number;
  graftKind?: string; // for `chip`: which implant it installs
}

export type GraftSlot = 'neural' | 'optic' | 'arm' | 'torso' | 'legs' | 'skin';

/** Intrusion programs. A union, so a stale lookup key is a compile error. */
export type SpikeKind = 'overload' | 'lockout' | 'dazzle';

export interface Graft {
  kind: string;
  name: string;
  slot: GraftSlot;
  instability: number;
  desc: string;
}

export type TraceState = 'CLEAR' | 'ALERT' | 'HUNT' | 'LOCKDOWN' | 'PURGE';

export interface Player {
  power: number;
  maxPower: number;
  credits: number;
  instability: number;
  grafts: Partial<Record<GraftSlot, Graft>>;
  inventory: Item[];
  ammo: number;
  maxAmmo: number;
  kills: number;
  identified: Record<string, boolean>;
}

export interface LogLine {
  text: string;
  tone: 'info' | 'good' | 'bad' | 'alert';
  turn: number;
  /** Consecutive repeats, coalesced so a six-drone round is one line, not six. */
  count: number;
}

export interface World {
  seed: string;
  floor: number;
  turn: number;
  w: number;
  h: number;
  tiles: number[];
  explored: number[];
  visible: boolean[];
  actors: Actor[];
  items: Item[];
  player: Player;
  trace: number;
  traceState: TraceState;
  nextWave: number;      // turn number the next HUNT wave spawns
  baffle: number;        // turns of scent suppression left (Scent Baffle)
  nextId: number;
  log: LogLine[];
  dead: boolean;
  won: boolean;
  salvage: number;
  rngState: Record<string, number[]>;
}

/** Simulation → presentation events. The renderer's only input. */
export type SimEvent =
  | { t: 'move'; id: number; fromX: number; fromY: number; toX: number; toY: number }
  | { t: 'attack'; id: number; targetId: number; dmg: number; crit: boolean }
  | { t: 'shoot'; id: number; fromX: number; fromY: number; toX: number; toY: number; hit: boolean }
  | { t: 'spike'; id: number; targetId: number; spike: SpikeKind; ok: boolean }
  | { t: 'death'; id: number; x: number; y: number }
  | { t: 'explode'; x: number; y: number; dmg: number }
  | { t: 'pickup'; itemId: number }
  | { t: 'ascend'; floor: number }
  | { t: 'trace'; from: TraceState; to: TraceState }
  | { t: 'spawn'; id: number }
  | { t: 'blocked' }
  | { t: 'glitch'; severity: number }
  | { t: 'log'; line: LogLine };

/** Player intents. The only way the world is allowed to change. */
export type Intent =
  | { kind: 'move'; dir: number }
  | { kind: 'wait' }
  | { kind: 'step'; x: number; y: number }   // one step of an auto-run path
  | { kind: 'shoot'; targetId: number }
  | { kind: 'spike'; spike: SpikeKind; targetId: number }
  | { kind: 'use'; itemId: number }
  | { kind: 'ascend' }
  | { kind: 'splice' };
