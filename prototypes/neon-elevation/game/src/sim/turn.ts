/**
 * The turn pipeline (ARCHITECTURE.md §4).
 *
 * `execute` is the only function in the codebase permitted to mutate the world.
 * It resolves the player's action, then runs the energy scheduler until the
 * player can act again, and returns a flat ordered event list. The world is
 * fully updated before the first frame of animation plays — animation is
 * presentation only and can be skipped without changing an outcome.
 */

import { DIRS, dist } from '../core/grid.ts';
import { GRAFTS, SPIKES, ITEMS } from '../content/items.ts';
import { buildFlowField, takeTurn } from './ai.ts';
import {
  canAscend, spikeCost, install, passiveTracePerTurn, speedBonus, tierFor,
} from './grafts.ts';
import { applyDamage, playerMeleeDamage, playerRangedDamage } from './combat.ts';
import {
  anyBiosynthHasScent, releaseSuborned, spikeSuccessChance,
} from './suborn.ts';
import {
  addTrace, decayOnAscent, stateFor, waveInterval,
  TRACE_ON_FAILED_SPIKE, TRACE_ON_INSTALL, TRACE_ON_SPLICE,
  TRACE_ON_NETWORKED_KILL, TRACE_ON_SHOT, TRACE_PER_TURN,
} from './trace.ts';
import {
  Tile,
  type Actor, type Intent, type SimEvent, type SpikeKind, type World,
} from './types.ts';
import {
  actorAt, buildFloor, FINAL_FLOOR, isWalkable, itemAt, log,
  makeActor, player, saveStreams, streamsFor, tileAt, updateFov,
} from './world.ts';

const ACTION_COST = 100;

/** How long a Scent Baffle keeps biosynths from re-acquiring you. */
export const BAFFLE_TURNS = 8;

export function playerSpeed(world: World): number {
  return 100 + speedBonus(world.player);
}

function killActor(world: World, actor: Actor, events: SimEvent[]): void {
  events.push({ t: 'death', id: actor.id, x: actor.x, y: actor.y });
  log(world, `${actor.name} GOES DOWN.`, 'good');
  world.player.kills++;

  // Only machines are on the net to report their own death. A biosynth dying
  // is silent, which is exactly why the top of the Umbilical went quiet.
  if (actor.networked && actor.family === 'machine') {
    addTrace(world, TRACE_ON_NETWORKED_KILL);
    log(world, 'ITS LAST PACKET REACHED THE NET.', 'alert');
  }
  if (actor.explodes > 0) {
    events.push({ t: 'explode', x: actor.x, y: actor.y, dmg: actor.explodes });
    for (const other of world.actors) {
      if (other.hp <= 0 || other.id === actor.id) continue;
      if (dist(other, actor) > 1) continue;
      const res = applyDamage(world, other, actor.explodes);
      if (other.faction === 'player') log(world, `THE BLAST CATCHES YOU FOR ${res.dealt}.`, 'bad');
    }
  }
  // Leech Valve: the graft that makes killing sustainable.
  if (Object.values(world.player.grafts).some((c) => c?.kind === 'leechvalve')) {
    const p = player(world);
    p.hp = Math.min(p.maxHp, p.hp + 6);
  }
}

function reapDead(world: World, events: SimEvent[]): void {
  // A death can kill again (drones explode), so sweep until nothing new dies.
  const reaped = new Set<number>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const a of [...world.actors]) {
      if (a.faction === 'player' || a.hp > 0 || reaped.has(a.id)) continue;
      reaped.add(a.id);
      killActor(world, a, events);
      changed = true;
    }
  }
  world.actors = world.actors.filter((a) => a.faction === 'player' || a.hp > 0);

  // Kill the last of the grown on a tier and the machines fall back to their
  // standing orders. Counter-subversion is a real strategy — and the price of
  // it is the whole moral weight of Act III.
  const freed = releaseSuborned(world);
  if (freed > 0) {
    log(world, freed === 1
      ? 'ONE SYSTEM REVERTS. NOTHING LEFT WHISPERING.'
      : `${freed} SYSTEMS REVERT. NOTHING LEFT WHISPERING.`, 'good');
  }
}

/** HUNT+ spawns reinforcements at the floor edge, walking in from off-view. */
function spawnWave(world: World, events: SimEvent[]): void {
  const interval = waveInterval(world.traceState);
  if (!interval || world.turn < world.nextWave) return;
  world.nextWave = world.turn + interval;

  const streams = streamsFor(world);
  const p = player(world);
  const candidates: { x: number; y: number }[] = [];
  for (let y = 1; y < world.h - 1; y++) {
    for (let x = 1; x < world.w - 1; x++) {
      if (!isWalkable(world, x, y)) continue;
      if (dist({ x, y }, p) < 9) continue;
      if (actorAt(world, x, y)) continue;
      candidates.push({ x, y });
    }
  }
  if (!candidates.length) return;

  const count = world.traceState === 'PURGE' ? 1 : 2;
  for (let i = 0; i < count; i++) {
    const spot = streams.ai.pick(candidates);
    const kind = world.traceState === 'PURGE' && i === 0 ? 'hunter' : 'secdrone';
    if (kind === 'hunter' && world.actors.some((a) => a.kind === 'hunter' && a.hp > 0)) continue;
    const spawned = makeActor(world, kind, spot.x, spot.y);
    spawned.aware = true;
    events.push({ t: 'spawn', id: spawned.id });
  }
  saveStreams(world, streams);

  if (world.traceState === 'PURGE') {
    log(world, 'A HUNTER-KILLER HAS YOUR TRACE. LEAVE.', 'bad');
  } else {
    log(world, 'SEC-DRONES DEPLOYED TO YOUR LEVEL.', 'alert');
  }
}

// --- Player actions ---------------------------------------------------------

function playerMelee(world: World, target: Actor, events: SimEvent[]): void {
  const streams = streamsFor(world);
  const p = player(world);
  const ribbonedge = Object.values(world.player.grafts).some((c) => c?.kind === 'ribbonedge');

  const targets = ribbonedge
    ? world.actors.filter((a) => a.faction === 'hostile' && a.hp > 0 && dist(a, p) === 1)
    : [target];

  for (const t of targets) {
    const { dmg, crit } = playerMeleeDamage(world, streams.combat);
    const res = applyDamage(world, t, dmg, { fromPlayer: true, crit });
    events.push({ t: 'attack', id: p.id, targetId: t.id, dmg: res.dealt, crit });
    log(world, `YOU HIT ${t.name} FOR ${res.dealt}${crit ? '!' : '.'}`, crit ? 'good' : 'info');
  }
  saveStreams(world, streams);
}

function playerShoot(world: World, target: Actor, events: SimEvent[]): boolean {
  const p = player(world);
  if (world.player.ammo <= 0) {
    log(world, 'DRY. NO ROUNDS LEFT.', 'bad');
    events.push({ t: 'blocked' });
    return false;
  }
  // Targeting legality is the player's own FOV, not a second line-of-sight
  // implementation. Bresenham disagrees with shadowcasting at the margins, and
  // when it did, an enemy you could plainly see refused to be shot. "If you
  // can see it, it can see you" has to cut both ways (DESIGN.md §6.3).
  if (!world.visible[target.y * world.w + target.x]) {
    log(world, 'NO LINE ON IT.', 'bad');
    events.push({ t: 'blocked' });
    return false;
  }

  const streams = streamsFor(world);
  world.player.ammo--;
  addTrace(world, TRACE_ON_SHOT);

  const chance = Math.max(0.3, 0.9 - Math.max(0, dist(p, target) - 3) * 0.06);
  const hit = streams.combat.chance(chance);
  events.push({ t: 'shoot', id: p.id, fromX: p.x, fromY: p.y, toX: target.x, toY: target.y, hit });

  if (hit) {
    const { dmg, crit } = playerRangedDamage(streams.combat);
    const res = applyDamage(world, target, dmg, { ranged: true, fromPlayer: true, crit });
    events.push({ t: 'attack', id: p.id, targetId: target.id, dmg: res.dealt, crit });
    log(world, `HIT. ${target.name} TAKES ${res.dealt}.`, 'info');
  } else {
    log(world, 'MISS. THE ROUND SPARKS OFF CONCRETE.', 'info');
  }
  // Everything in earshot now knows where you are. Guns are expensive.
  for (const a of world.actors) {
    if (a.faction === 'hostile' && a.hp > 0 && dist(a, p) <= 9) a.aware = true;
  }
  saveStreams(world, streams);
  return true;
}

function playerSpike(world: World, spikeKind: SpikeKind, targetId: number, events: SimEvent[]): boolean {
  const p = player(world);
  const template = SPIKES[spikeKind];
  const cost = spikeCost(world.player, template.power);
  if (world.player.power < cost) {
    log(world, 'NOT ENOUGH POWER.', 'bad');
    events.push({ t: 'blocked' });
    return false;
  }

  let target = world.actors.find((a) => a.id === targetId);
  if (!target || target.hp <= 0) return false;
  if (!target.breachable || target.family !== 'machine') {
    log(world, `${target.name} HAS NOTHING TO TALK TO.`, 'bad');
    events.push({ t: 'blocked' });
    return false;
  }
  if (dist(p, target) > template.range || !world.visible[target.y * world.w + target.x]) {
    log(world, 'OUT OF RANGE.', 'bad');
    events.push({ t: 'blocked' });
    return false;
  }

  const streams = streamsFor(world);
  world.player.power -= cost;

  // DISSONANCE and above: the spike sometimes picks its own target. The player
  // was told this would happen when they installed the grafts.
  if (tierFor(world.player.instability) !== 'CLEAN' &&
      world.player.instability >= 40 && streams.combat.chance(0.05)) {
    const others = world.actors.filter((a) => a.breachable && a.hp > 0 && a.id !== target!.id);
    if (others.length) {
      target = streams.combat.pick(others);
      log(world, 'THE SPIKE PICKS ITS OWN TARGET.', 'bad');
      events.push({ t: 'glitch', severity: 2 });
    }
  }

  // Arguing with a machine that already has something else inside it.
  const success = streams.combat.chance(spikeSuccessChance(target));
  events.push({ t: 'spike', id: p.id, targetId: target.id, spike: spikeKind, ok: success });

  if (!success) {
    addTrace(world, TRACE_ON_FAILED_SPIKE);
    log(world, target.suborned
      ? `${template.name} BOUNCED. SOMETHING ELSE HOLDS IT.`
      : `${template.name} BOUNCED. THEY FELT THAT.`, 'bad');
  } else {
    switch (spikeKind) {
      case 'overload':
        target.status.burn = 4;
        log(world, `${target.name} IS COOKING.`, 'good');
        break;
      case 'lockout':
        target.status.lock = 3;
        log(world, `${target.name} LOCKS UP.`, 'good');
        break;
      case 'dazzle':
        target.status.blind = 6;
        target.aware = false;
        log(world, `${target.name} IS BLIND.`, 'good');
        break;
    }
  }
  saveStreams(world, streams);
  return true;
}

function useItem(world: World, itemId: number, events: SimEvent[]): boolean {
  const p = player(world);
  const idx = world.player.inventory.findIndex((i) => i.id === itemId);
  if (idx < 0) return false;
  const item = world.player.inventory[idx];
  const streams = streamsFor(world);
  let consumed = true;

  switch (item.kind) {
    case 'patchkit':
      p.hp = Math.min(p.maxHp, p.hp + 35);
      log(world, 'PATCH KIT. THE BLEEDING STOPS.', 'good');
      break;
    case 'powercell':
      world.player.power = Math.min(world.player.maxPower, world.player.power + 40);
      log(world, 'CELL DRAINED INTO YOUR RIG.', 'good');
      break;
    case 'scrub':
      world.trace = 0;
      log(world, 'SIGNAL SCRUB. YOU FALL OFF THE NET.', 'good');
      break;
    case 'baffle': {
      // The biological counterpart to Signal Scrub. Clearing the trail alone
      // was useless: anything standing next to you simply re-acquired it on
      // the same turn. It has to suppress re-acquisition for a window, or it
      // is not an escape tool at all.
      let shed = 0;
      for (const a of world.actors) {
        if (a.family !== 'biosynth' || a.hp <= 0) continue;
        if (a.scented || a.aware) shed++;
        a.scented = false;
        a.aware = false;
      }
      world.baffle = BAFFLE_TURNS;
      log(world, shed ? `SCENT BAFFLE. ${shed} LOSE YOUR TRAIL.` : 'SCENT BAFFLE. NOTHING WAS TRACKING YOU.',
        shed ? 'good' : 'info');
      break;
    }
    case 'emp': {
      let hit = 0;
      for (const a of world.actors) {
        if (a.faction !== 'hostile' || a.hp <= 0) continue;
        if (a.family !== 'machine' || !a.networked) continue;
        if (!world.visible[a.y * world.w + a.x]) continue;
        a.status.lock = 4;
        hit++;
      }
      log(world, hit ? `EMP. ${hit} SYSTEMS DOWN.` : 'EMP. NOTHING MECHANICAL IN SIGHT.', hit ? 'good' : 'info');
      break;
    }
    case 'ampoule': {
      // Unidentified until used — the classic tension, reskinned.
      const good = streams.loot.chance(0.6);
      world.player.identified.ampoule = true;
      if (good) {
        p.hp = Math.min(p.maxHp, p.hp + 12);
        world.player.power = Math.min(world.player.maxPower, world.player.power + 25);
        log(world, 'AMPOULE BURNS CLEAN. EVERYTHING SHARPENS.', 'good');
      } else {
        world.player.instability = Math.min(100, world.player.instability + 6);
        log(world, 'BAD BATCH. YOUR GRAFTS SHUDDER.', 'bad');
        events.push({ t: 'glitch', severity: 1 });
      }
      break;
    }
    case 'graftchip': {
      const kind = item.graftKind!;
      const grafts = GRAFTS[kind];
      if (p.hp <= 16) {
        log(world, 'TOO WEAK FOR FIELD SURGERY.', 'bad');
        events.push({ t: 'blocked' });
        consumed = false;
        break;
      }
      const before = tierFor(world.player.instability);
      applyDamage(world, p, 15);
      addTrace(world, TRACE_ON_INSTALL);
      const res = install(world.player, kind);
      world.player.identified[kind] = true;
      if (res.ok) {
        log(world, `INSTALLED ${grafts.name}.`, 'good');
        if (res.replaced) log(world, `RIPPED OUT ${res.replaced}.`, 'info');
        const after = tierFor(world.player.instability);
        if (after !== before) {
          log(world, `INSTABILITY: ${after}.`, 'bad');
          events.push({ t: 'glitch', severity: 3 });
        }
      }
      break;
    }
  }

  if (consumed) world.player.inventory.splice(idx, 1);
  saveStreams(world, streams);
  return consumed;
}

function spliceIn(world: World, events: SimEvent[]): boolean {
  const p = player(world);
  if (tileAt(world, p.x, p.y) !== Tile.Terminal) {
    events.push({ t: 'blocked' });
    return false;
  }
  world.player.power = Math.min(world.player.maxPower, world.player.power + 35);
  addTrace(world, TRACE_ON_SPLICE);
  // Reveal a fragment of the floor plan: terminals are worth the detour.
  for (let i = 0; i < world.explored.length; i++) {
    const x = i % world.w;
    const y = Math.floor(i / world.w);
    if (dist({ x, y }, p) <= 12) world.explored[i] = 1;
  }
  log(world, 'SPLICED IN. POWER UP, FLOOR PLAN CACHED.', 'good');
  return true;
}

function ascend(world: World, events: SimEvent[]): boolean {
  const p = player(world);
  if (tileAt(world, p.x, p.y) !== Tile.Lift) {
    events.push({ t: 'blocked' });
    return false;
  }
  if (!canAscend(world)) {
    log(world, 'YOU CANNOT MAKE YOURSELF LEAVE. NOT YET.', 'bad');
    events.push({ t: 'blocked' });
    return false;
  }
  if (world.floor >= FINAL_FLOOR) {
    world.won = true;
    world.salvage += 200;
    log(world, 'THE WARDEN IS DOWN. THE FREIGHT LIFT IS YOURS.', 'good');
    events.push({ t: 'ascend', floor: world.floor + 1 });
    return true;
  }

  decayOnAscent(world);
  world.player.power = Math.min(world.player.maxPower, world.player.power + 25);
  world.salvage += 40;
  buildFloor(world, world.floor + 1);
  events.push({ t: 'ascend', floor: world.floor });
  log(world, `TIER ${world.floor}. HIGHER.`, 'alert');
  return true;
}

// --- Scheduler --------------------------------------------------------------

function endOfPlayerTurn(world: World, events: SimEvent[]): void {
  world.turn++;
  if (world.baffle > 0) {
    world.baffle--;
    if (world.baffle === 0) log(world, 'THE BAFFLE THINS OUT.', 'alert');
  }
  addTrace(world, TRACE_PER_TURN + passiveTracePerTurn(world.player));

  const before = world.traceState;
  const after = stateFor(world.trace);
  if (after !== before) {
    world.traceState = after;
    events.push({ t: 'trace', from: before, to: after });
    log(world, `TRACE: ${after}.`, after === 'CLEAR' ? 'good' : 'bad');
    const interval = waveInterval(after);
    world.nextWave = interval ? world.turn + interval : 0;
  }
  spawnWave(world, events);
}

/**
 * Run every non-player actor that has banked a full action, then hand control
 * back. A single call may resolve a whole round of enemy activity.
 */
function runScheduler(world: World, events: SimEvent[]): void {
  const streams = streamsFor(world);
  const field = buildFlowField(world);
  const ctx = {
    world,
    rng: streams.ai,
    events,
    toPlayer: field,
    scentRelay: anyBiosynthHasScent(world),
  };

  // Enemy energy accrues relative to the player's speed, so Reflex Tendons and
  // Slipstream buy real extra turns rather than a cosmetic stat.
  const tickScale = 100 / playerSpeed(world);

  for (const actor of [...world.actors]) {
    if (actor.faction === 'player' || actor.hp <= 0) continue;
    actor.energy += actor.speed * tickScale;
    while (actor.energy >= ACTION_COST && actor.hp > 0 && !world.dead) {
      actor.energy -= ACTION_COST;
      takeTurn(ctx, actor);
      const p = player(world);
      if (p.hp <= 0) {
        world.dead = true;
        log(world, 'YOU BLEED OUT ON A DECK NOBODY WILL SWEEP.', 'bad');
      }
    }
  }
  saveStreams(world, streams);
  reapDead(world, events);
}

/** The one public mutation entry point. */
export function execute(world: World, intent: Intent): SimEvent[] {
  const events: SimEvent[] = [];
  if (world.dead || world.won) return events;

  const p = player(world);
  let spentTurn = false;

  switch (intent.kind) {
    case 'move':
    case 'step': {
      const target = intent.kind === 'move'
        ? { x: p.x + DIRS[intent.dir].x, y: p.y + DIRS[intent.dir].y }
        : { x: intent.x, y: intent.y };

      const occupant = actorAt(world, target.x, target.y);
      if (occupant && occupant.faction === 'hostile') {
        playerMelee(world, occupant, events);
        spentTurn = true;
      } else if (!isWalkable(world, target.x, target.y) || occupant) {
        events.push({ t: 'blocked' });
      } else {
        // No corner-cutting through diagonal wall gaps (DESIGN.md §6.2).
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        if (dx !== 0 && dy !== 0 &&
            (!isWalkable(world, p.x + dx, p.y) || !isWalkable(world, p.x, p.y + dy))) {
          events.push({ t: 'blocked' });
          break;
        }
        events.push({ t: 'move', id: p.id, fromX: p.x, fromY: p.y, toX: target.x, toY: target.y });
        p.x = target.x;
        p.y = target.y;
        spentTurn = true;

        const item = itemAt(world, p.x, p.y);
        if (item) {
          if (world.player.inventory.length < 12) {
            item.x = -1;
            item.y = -1;
            world.items = world.items.filter((i) => i.id !== item.id);
            world.player.inventory.push(item);
            events.push({ t: 'pickup', itemId: item.id });
            log(world, `PICKED UP ${ITEMS[item.kind].name}.`, 'good');
          } else {
            log(world, 'PACK IS FULL.', 'bad');
          }
        }
      }
      break;
    }

    case 'wait':
      spentTurn = true;
      break;

    case 'shoot': {
      const target = world.actors.find((a) => a.id === intent.targetId);
      if (target && target.hp > 0) spentTurn = playerShoot(world, target, events);
      break;
    }

    case 'spike':
      spentTurn = playerSpike(world, intent.spike, intent.targetId, events);
      break;

    case 'use':
      spentTurn = useItem(world, intent.itemId, events);
      break;

    case 'splice':
      spentTurn = spliceIn(world, events);
      break;

    case 'ascend':
      if (ascend(world, events)) {
        updateFov(world);
        return events; // a new floor: no enemy round follows the ride down
      }
      break;
  }

  if (!spentTurn) {
    updateFov(world);
    return events;
  }

  reapDead(world, events);
  updateFov(world);
  endOfPlayerTurn(world, events);
  runScheduler(world, events);
  updateFov(world);
  return events;
}
