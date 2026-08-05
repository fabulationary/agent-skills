/**
 * Start-screen legend data.
 *
 * Split out of main.ts so the tests can reach it — main.ts touches the DOM at
 * import time and cannot be imported headlessly. Text running off the right
 * edge has now shipped twice (the death screen, and this screen's first
 * draft), so the widths here are asserted in tests/sim.test.ts rather than
 * eyeballed.
 */

export interface LegendEntry {
  sprite: string;
  label: string;
  /**
   * Marks a grown thing. The legend tints these in the FLESH ramp, so the
   * one entry your machine tools do nothing to is visibly different before
   * the player ever meets it.
   */
  grown?: boolean;
}

export interface LegendSection {
  heading: string;
  entries: LegendEntry[];
}

export const LEGEND_TITLE = 'NEON ELEVATION';
export const LEGEND_SUBTITLE = 'UMBILICAL GAMMA IS QUIET';
export const LEGEND_FOOTER = 'TAP OR ANY KEY TO BEGIN';

export const LEGEND: LegendSection[] = [
  {
    heading: 'YOU',
    entries: [{ sprite: 'player', label: 'CLIMBER' }],
  },
  {
    heading: 'THREATS',
    entries: [
      { sprite: 'picker', label: 'PICKER' },
      { sprite: 'grafted', label: 'GRAFTED' },
      { sprite: 'drone', label: 'DOCK DRONE' },
      { sprite: 'turret', label: 'TURRET' },
      { sprite: 'stray', label: 'STRAY', grown: true },
      { sprite: 'drone', label: 'SEC-DRONE' },
      { sprite: 'hunter', label: 'HUNTER-K' },
      { sprite: 'warden', label: 'THE WARDEN' },
    ],
  },
  {
    heading: 'GEAR',
    entries: [
      { sprite: 'patchkit', label: 'PATCH KIT' },
      { sprite: 'powercell', label: 'POWER CELL' },
      { sprite: 'scrub', label: 'SCRUB' },
      { sprite: 'baffle', label: 'BAFFLE' },
      { sprite: 'emp', label: 'EMP' },
      { sprite: 'ampoule', label: 'AMPOULE' },
      { sprite: 'graftchip', label: 'CHIP' },
    ],
  },
  {
    heading: 'THE TIER',
    entries: [
      { sprite: 'lift', label: 'LIFT: GO UP' },
      { sprite: 'terminal', label: 'TERMINAL' },
    ],
  },
];

/**
 * The only place the machine/grown rule is stated in words. Everywhere else
 * the game expects the player to work it out by being bitten.
 */
export const LEGEND_RULES = [
  'SPIKES + EMP WORK ON MACHINES',
  'NOTHING MECHANICAL TOUCHES',
  'THE GROWN. THEY HUNT BY SCENT',
  'TRACE RISES EVERY TURN. MOVE.',
];

/** Widest label the two-column layout can render without clipping. */
export const LEGEND_LABEL_COLS = 11;
