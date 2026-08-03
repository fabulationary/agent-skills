/**
 * Enemy behaviour. One function per AI kind, no per-enemy special cases.
 *
 * All movement reads a shared flow field toward the player rather than running
 * A* per actor — that is what keeps the worst-case turn inside its 16ms budget
 * (ARCHITECTURE.md §6).
 */

import type { RNG } from '../core/rng.ts';
import { DIRS, dist } from '../core/grid.ts';
import { ACTORS } from '../content/actors.ts';
import { applyDamage, hasLineOfSight, hitChance, rollDamage } from './combat.ts';
import { canStep, flowField } from './path.ts';
import { accuracyBonus, turretsActive } from './trace.ts';
import type { Actor, SimEvent, World } from './types.ts';
import { isTransparent, log, navBlocked, navOf, player } from './world.ts';

export interface AiContext {
  world: World;
  rng: RNG;
  events: SimEvent[];
  /** Distance-to-player field, computed once per round and shared by all actors. */
  toPlayer: Int32Array;
}

function sees(world: World, actor: Actor, target: Actor): boolean {
  const radius = actor.status.blind > 0 ? 1 : actor.sight;
  if (dist(actor, target) > radius) return false;
  return hasLineOfSight(actor.x, actor.y, target.x, target.y, (x, y) =>
    isTransparent(world, x, y));
}

function stepToward(ctx: AiContext, actor: Actor, field: Int32Array, away = false): boolean {
  const { world } = ctx;
  const nav = navBlocked(world, actor.id);
  const here = field[actor.y * world.w + actor.x];
  let bestScore = here;
  let best: { x: number; y: number } | null = null;

  for (const d of DIRS) {
    const nx = actor.x + d.x;
    const ny = actor.y + d.y;
    if (nx < 0 || ny < 0 || nx >= world.w || ny >= world.h) continue;
    if (!canStep(nav, actor.x, actor.y, nx, ny)) continue;
    const score = field[ny * world.w + nx];
    if (score >= 0x7fffffff) continue;
    if (away ? score > bestScore : score < bestScore) {
      bestScore = score;
      best = { x: nx, y: ny };
    }
  }
  if (!best) return false;
  ctx.events.push({ t: 'move', id: actor.id, fromX: actor.x, fromY: actor.y, toX: best.x, toY: best.y });
  actor.x = best.x;
  actor.y = best.y;
  return true;
}

function meleeAttack(ctx: AiContext, actor: Actor, target: Actor): void {
  const raw = rollDamage(ctx.rng, actor.dmgLo, actor.dmgHi);
  const res = applyDamage(ctx.world, target, raw);
  ctx.events.push({ t: 'attack', id: actor.id, targetId: target.id, dmg: res.dealt, crit: false });
  log(ctx.world, `${actor.name} HITS YOU FOR ${res.dealt}.`, 'bad');
}

function rangedAttack(ctx: AiContext, actor: Actor, target: Actor): void {
  const chance = hitChance(actor, target, accuracyBonus(ctx.world.traceState));
  const hit = ctx.rng.chance(chance);
  ctx.events.push({
    t: 'shoot', id: actor.id,
    fromX: actor.x, fromY: actor.y, toX: target.x, toY: target.y, hit,
  });
  if (hit) {
    const raw = rollDamage(ctx.rng, actor.dmgLo, actor.dmgHi);
    const res = applyDamage(ctx.world, target, raw, { ranged: true });
    log(ctx.world, `${actor.name} FIRES. ${res.dealt} DAMAGE.`, 'bad');
  } else {
    log(ctx.world, `${actor.name} FIRES AND MISSES.`, 'info');
  }
}

/** Sight-driven awareness, plus the alert level pulling enemies toward you. */
function updateAwareness(ctx: AiContext, actor: Actor, target: Actor): void {
  if (sees(ctx.world, actor, target)) {
    if (!actor.aware) log(ctx.world, `${actor.name} SPOTS YOU.`, 'alert');
    actor.aware = true;
    actor.lastKnownX = target.x;
    actor.lastKnownY = target.y;
  } else if (ctx.world.traceState !== 'CLEAR' && ctx.rng.chance(0.25)) {
    // ALERT+ means the floor is sharing your position over the net.
    actor.aware = true;
    actor.lastKnownX = target.x;
    actor.lastKnownY = target.y;
  }
}

export function takeTurn(ctx: AiContext, actor: Actor): void {
  const { world } = ctx;
  const target = player(world);

  if (actor.status.lock > 0) {
    actor.status.lock--;
    return;
  }
  if (actor.status.burn > 0) {
    actor.status.burn--;
    const res = applyDamage(world, actor, 3, { fromPlayer: true });
    ctx.events.push({ t: 'attack', id: actor.id, targetId: actor.id, dmg: res.dealt, crit: false });
    if (res.killed) return; // death is reaped by the caller
  }

  const template = ACTORS[actor.kind];
  const adjacent = dist(actor, target) === 1;

  switch (actor.ai) {
    case 'turret': {
      if (!turretsActive(world.traceState)) return;
      updateAwareness(ctx, actor, target);
      if (actor.aware && dist(actor, target) <= actor.rangedRange && sees(world, actor, target)) {
        rangedAttack(ctx, actor, target);
      }
      return;
    }

    case 'hunter': {
      // It always knows. That is the entire point of the PURGE state.
      actor.aware = true;
      if (adjacent) meleeAttack(ctx, actor, target);
      else stepToward(ctx, actor, ctx.toPlayer);
      return;
    }

    case 'drone': {
      updateAwareness(ctx, actor, target);
      if (!actor.aware) return;
      if (adjacent) meleeAttack(ctx, actor, target);
      else stepToward(ctx, actor, ctx.toPlayer);
      return;
    }

    case 'warden': {
      updateAwareness(ctx, actor, target);
      if (!actor.aware) return;
      if (adjacent) {
        meleeAttack(ctx, actor, target);
      } else {
        // Slow, so it gets a lunge when it has been kept at range.
        const moved = stepToward(ctx, actor, ctx.toPlayer);
        if (moved && dist(actor, target) > 2) stepToward(ctx, actor, ctx.toPlayer);
      }
      return;
    }

    case 'brute': {
      updateAwareness(ctx, actor, target);
      if (!actor.aware) return;
      if (adjacent) meleeAttack(ctx, actor, target);
      else stepToward(ctx, actor, ctx.toPlayer);
      return;
    }

    case 'melee':
    default: {
      updateAwareness(ctx, actor, target);
      if (!actor.aware) return;

      const hurt = actor.hp <= actor.maxHp * 0.3;
      if (template.cowardly && hurt) {
        if (!actor.fleeing) {
          actor.fleeing = true;
          log(world, `${actor.name} BREAKS AND RUNS.`, 'good');
        }
        // Fleeing scavs fetch friends: everything they pass gets woken.
        for (const other of world.actors) {
          if (other.faction === 'hostile' && other.hp > 0 && dist(other, actor) <= 4) {
            other.aware = true;
            other.lastKnownX = target.x;
            other.lastKnownY = target.y;
          }
        }
        stepToward(ctx, actor, ctx.toPlayer, true);
        return;
      }
      if (adjacent) meleeAttack(ctx, actor, target);
      else stepToward(ctx, actor, ctx.toPlayer);
      return;
    }
  }
}

/**
 * One shared distance field per round, over terrain only. Actors are excluded
 * deliberately — if a queue of enemies blocked the field, everything behind
 * the queue would decide the player is unreachable and stand still. Collision
 * is handled at the stepping layer instead, by `navBlocked`.
 */
export function buildFlowField(world: World): Int32Array {
  const p = player(world);
  return flowField(navOf(world), [{ x: p.x, y: p.y }]);
}
