/**
 * Subversion: how the grown got into the machines (DESIGN.md §6.6).
 *
 * Nirvana Station's security and habitat systems were installed long before
 * the pets woke up, and they are still running — still executing standing
 * orders to protect residents who are no longer alive to be protected. What
 * changed in the last eleven weeks is that the biosynths have been *learning
 * them*, and they get better at it the higher you climb.
 *
 * This is what keeps a machine-facing build alive in Act III. The player's
 * spikes and EMPs never stop working; the machines just stop being neutral.
 * Three rules, and each one gives the player something to do:
 *
 * 1. A suborned machine is fed the player's position by any biosynth that has
 *    their scent. Breaking line of sight no longer sheds it — the machine did
 *    not see you, something else did and told it.
 * 2. Spiking a suborned machine is *contested*: you are arguing with something
 *    already inside. Lower success chance, and the failure says why.
 * 3. Kill every biosynth on a tier and the machines revert. Counter-subversion
 *    is a real strategy, and it is the reason a spike build still has a job in
 *    Nirvana — a job that happens to require killing the sympathetic faction.
 */

import type { RNG } from '../core/rng.ts';
import type { Actor, World } from './types.ts';

/** The first tier of Nirvana Station. Below this, nothing has been got into. */
export const SUBORN_FIRST_FLOOR = 9;

export const SPIKE_SUCCESS_CLEAN = 0.85;
export const SPIKE_SUCCESS_CONTESTED = 0.55;

/**
 * Share of a tier's machines the biosynths have already got into. They are
 * still evolving, literally, and eleven weeks of practice shows: by the
 * Firstborn's own deck almost nothing mechanical is answering to the station.
 */
export function subversionRate(floor: number): number {
  if (floor < SUBORN_FIRST_FLOOR) return 0;
  switch (floor) {
    case 9: return 0.2;
    case 10: return 0.4;
    case 11: return 0.65;
    default: return 0.85;
  }
}

/** Applied once at tier generation, so a tier's machines are stable. */
export function applySubversion(world: World, floor: number, rng: RNG): number {
  const rate = subversionRate(floor);
  if (rate <= 0) return 0;
  let count = 0;
  for (const actor of world.actors) {
    if (actor.family !== 'machine' || actor.faction !== 'hostile') continue;
    if (rng.next() < rate) {
      actor.suborned = true;
      count++;
    }
  }
  return count;
}

export function anyBiosynthHasScent(world: World): boolean {
  return world.actors.some((a) =>
    a.family === 'biosynth' && a.faction === 'hostile' && a.hp > 0 && a.scented);
}

export function livingBiosynths(world: World): number {
  return world.actors.filter((a) =>
    a.family === 'biosynth' && a.faction === 'hostile' && a.hp > 0).length;
}

/** Success chance for a spike against this target. */
export function spikeSuccessChance(target: Actor): number {
  return target.suborned ? SPIKE_SUCCESS_CONTESTED : SPIKE_SUCCESS_CLEAN;
}

/**
 * With the last biosynth on the tier dead, nothing is left whispering to the
 * machines and they fall back to their standing orders. Returns how many
 * reverted, so the caller can say so out loud — the player needs to learn that
 * this is a thing they can cause.
 */
export function releaseSuborned(world: World): number {
  if (livingBiosynths(world) > 0) return 0;
  let freed = 0;
  for (const actor of world.actors) {
    if (actor.suborned) {
      actor.suborned = false;
      freed++;
    }
  }
  return freed;
}
