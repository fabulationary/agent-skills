/**
 * The Trace clock (DESIGN.md §6.4) — this game's replacement for the hunger
 * clock. Standing still must always be the losing move; everything here exists
 * to make that true.
 */

import type { TraceState, World } from './types.ts';

export const TRACE_PER_TURN = 0.4;
export const TRACE_ON_SHOT = 2;
export const TRACE_ON_NETWORKED_KILL = 3;
export const TRACE_ON_FAILED_HACK = 6;
export const TRACE_ON_INSTALL = 10;
export const TRACE_ON_JACKIN = 3;

const THRESHOLDS: { at: number; state: TraceState }[] = [
  { at: 95, state: 'PURGE' },
  { at: 75, state: 'LOCKDOWN' },
  { at: 50, state: 'HUNT' },
  { at: 25, state: 'ALERT' },
  { at: 0, state: 'CLEAR' },
];

export function stateFor(trace: number): TraceState {
  for (const t of THRESHOLDS) if (trace >= t.at) return t.state;
  return 'CLEAR';
}

export const STATE_RANK: Record<TraceState, number> = {
  CLEAR: 0, ALERT: 1, HUNT: 2, LOCKDOWN: 3, PURGE: 4,
};

/** Accuracy and aggression both scale with the alert level. */
export function accuracyBonus(state: TraceState): number {
  return state === 'LOCKDOWN' || state === 'PURGE' ? 0.25 : 0;
}

/** Turrets sleep until the floor knows you are on it. */
export function turretsActive(state: TraceState): boolean {
  return STATE_RANK[state] >= STATE_RANK.HUNT;
}

/** Wandering spawn pressure, in turns between waves. 0 = no waves. */
export function waveInterval(state: TraceState): number {
  switch (state) {
    case 'HUNT': return 20;
    case 'LOCKDOWN': return 14;
    case 'PURGE': return 10;
    default: return 0;
  }
}

export function addTrace(world: World, amount: number): void {
  world.trace = Math.max(0, Math.min(100, world.trace + amount));
}

/** Descending sheds 60% of accumulated Trace (DESIGN.md §6.4). */
export function decayOnDescent(world: World): void {
  world.trace = Math.round(world.trace * 0.4 * 10) / 10;
}
