/**
 * Headless balance harness (ARCHITECTURE.md §7).
 *
 * A scripted bot plays N complete runs and reports the distributions that
 * matter. This is how a project without a QA team keeps a roguelike balanced:
 * regressions show up as distribution drift in a diff, not as a bug report six
 * weeks later.
 *
 * Run: npm run balance -- [runs]
 */

// Node globals without pulling in @types/node for one argument.
declare const process: { argv: string[] };

import { dist } from '../src/core/grid.ts';
import { findPath } from '../src/sim/path.ts';
import { execute } from '../src/sim/turn.ts';
import { Tile, type World } from '../src/sim/types.ts';
import {
  actorAt, createWorld, FINAL_FLOOR, isWalkable, navOf, player,
} from '../src/sim/world.ts';

const MAX_TURNS = 1500;

interface RunResult {
  floor: number;
  turns: number;
  won: boolean;
  killedBy: string;
  kills: number;
  instability: number;
  grafts: number;
  itemsUsed: Record<string, number>;
  traceAtDescent: number[];
}

/**
 * Greedy bot policy: fight what it can, run for the elevator when the floor
 * gets hot. Deliberately unsophisticated — it measures the systems, not skill.
 */
function playRun(seed: string): RunResult {
  const world: World = createWorld(seed);
  const itemsUsed: Record<string, number> = {};
  const traceAtDescent: number[] = [];
  let killedBy = 'timeout';
  let lastHp = player(world).hp;

  /**
   * Guarantee forward progress. Some intents legitimately spend no turn
   * (a blocked move, a refused install), and a bot that keeps retrying one
   * would spin forever and report a fake "timeout". Falling back to a wait
   * makes a stuck policy show up as a bad depth histogram, which is a signal,
   * instead of as a hung harness, which is noise.
   */
  const advance = (intent: Parameters<typeof execute>[1]): void => {
    const before = world.turn;
    const floorBefore = world.floor;
    execute(world, intent);
    if (world.turn === before && world.floor === floorBefore && !world.dead && !world.won) {
      execute(world, { kind: 'wait' });
    }
  };

  for (let step = 0; step < MAX_TURNS; step++) {
    if (world.dead || world.won) break;
    const p = player(world);

    if (p.hp < lastHp) {
      const attacker = world.actors
        .filter((a) => a.faction === 'hostile')
        .sort((a, b) => dist(a, p) - dist(b, p))[0];
      if (attacker) killedBy = attacker.name;
    }
    lastHp = p.hp;

    // Heal when badly hurt.
    if (p.hp < p.maxHp * 0.35) {
      const kit = world.player.inventory.find((i) => i.kind === 'patchkit');
      if (kit) {
        itemsUsed.patchkit = (itemsUsed.patchkit ?? 0) + 1;
        advance({ kind: 'use', itemId: kit.id });
        continue;
      }
    }

    // Install any chip found, to exercise the Instability curve.
    const chip = world.player.inventory.find((i) => i.kind === 'graftchip');
    if (chip && p.hp > p.maxHp * 0.5) {
      itemsUsed.chip = (itemsUsed.chip ?? 0) + 1;
      advance({ kind: 'use', itemId: chip.id });
      continue;
    }

    const visibleEnemies = world.actors.filter(
      (a) => a.faction === 'hostile' && a.hp > 0 && world.visible[a.y * world.w + a.x],
    );
    const adjacent = visibleEnemies.find((a) => dist(a, p) === 1);
    // The Hunter-Killer is not meant to be fought, it is meant to make you
    // leave. A bot that trades blows with it measures the bot, not the game.
    const hunted = world.actors.some((a) => a.kind === 'hunter' && a.hp > 0);

    // Fight only what is already next to us and worth fighting.
    if (adjacent && adjacent.kind !== 'hunter') {
      advance({ kind: 'step', x: adjacent.x, y: adjacent.y });
      continue;
    }

    // Shoot the nearest threat if it is closing and we have rounds.
    const near = visibleEnemies
      .filter((a) => dist(a, p) <= 6 && a.kind !== 'hunter')
      .sort((a, b) => dist(a, p) - dist(b, p))[0];
    if (near && !hunted && world.player.ammo > 0 && world.trace < 70 && near.kind !== 'turret') {
      advance({ kind: 'shoot', targetId: near.id });
      continue;
    }

    // Detour for loot that is close and safe to grab. Without this the bot
    // beelines the elevator, never picks up a chip, and the harness silently
    // reports zero grafts — measuring nothing about the game's main progression
    // system while looking like it measured everything.
    if (!hunted && world.trace < 60) {
      const loot = world.items
        .filter((it) => world.visible[it.y * world.w + it.x] && dist(it, p) <= 7)
        .sort((a, b) => dist(a, p) - dist(b, p))[0];
      if (loot) {
        const lootPath = findPath(navOf(world), p, loot);
        if (lootPath?.length && !actorAt(world, lootPath[0].x, lootPath[0].y)) {
          advance({ kind: 'step', x: lootPath[0].x, y: lootPath[0].y });
          continue;
        }
      }
    }

    // Otherwise: head for the elevator. Trace pressure is the whole design, so
    // the bot leaves early rather than clearing floors.
    const here = world.tiles[p.y * world.w + p.x];
    if (here === Tile.Elevator) {
      traceAtDescent.push(Math.round(world.trace));
      const before = world.floor;
      execute(world, { kind: 'descend' });
      if (world.floor === before && !world.won) execute(world, { kind: 'wait' });
      continue;
    }

    const target = findElevator(world);
    if (!target) { advance({ kind: 'wait' }); continue; }
    const path = findPath(navOf(world), p, target);
    if (!path || !path.length) { advance({ kind: 'wait' }); continue; }
    const next = path[0];
    if (!isWalkable(world, next.x, next.y) || actorAt(world, next.x, next.y)) {
      advance({ kind: 'wait' });
      continue;
    }
    advance({ kind: 'step', x: next.x, y: next.y });
  }

  return {
    floor: world.floor,
    turns: world.turn,
    won: world.won,
    killedBy: world.dead ? killedBy : world.won ? 'extracted' : 'timeout',
    kills: world.player.kills,
    instability: world.player.instability,
    grafts: Object.keys(world.player.grafts).length,
    itemsUsed,
    traceAtDescent,
  };
}

function findElevator(world: World): { x: number; y: number } | null {
  for (let i = 0; i < world.tiles.length; i++) {
    if (world.tiles[i] === Tile.Elevator) {
      return { x: i % world.w, y: Math.floor(i / world.w) };
    }
  }
  return null;
}

function histogram(values: number[], max: number): string {
  const counts = new Array(max + 1).fill(0);
  for (const v of values) counts[Math.min(max, v)]++;
  const peak = Math.max(1, ...counts);
  return counts
    .map((c, i) => {
      const bar = '#'.repeat(Math.round((c / peak) * 34));
      return `  SUB-0${i} ${String(c).padStart(4)}  ${bar}`;
    })
    .slice(1)
    .join('\n');
}

function main(): void {
  const runs = Number(process.argv[2] ?? 200);
  const results: RunResult[] = [];
  const started = Date.now();

  for (let i = 0; i < runs; i++) results.push(playRun(`balance-${i}`));

  const wins = results.filter((r) => r.won).length;
  const deaths: Record<string, number> = {};
  for (const r of results) deaths[r.killedBy] = (deaths[r.killedBy] ?? 0) + 1;

  const median = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    return s.length ? s[Math.floor(s.length / 2)] : 0;
  };
  const allDescentTrace = results.flatMap((r) => r.traceAtDescent);

  console.log(`\nNEON DESCENT — balance report`);
  console.log(`${runs} runs in ${((Date.now() - started) / 1000).toFixed(1)}s\n`);

  console.log('DEPTH REACHED');
  console.log(histogram(results.map((r) => r.floor), FINAL_FLOOR));
  console.log(`\n  win rate            ${((wins / runs) * 100).toFixed(1)}%`);
  console.log(`  median turns/run    ${median(results.map((r) => r.turns))}`);
  console.log(`  median kills/run    ${median(results.map((r) => r.kills))}`);
  console.log(`  median grafts       ${median(results.map((r) => r.grafts))}`);
  console.log(`  median instability  ${median(results.map((r) => r.instability))}`);
  console.log(`  median trace at descent ${median(allDescentTrace)}`);

  console.log('\nCAUSE OF DEATH');
  const sorted = Object.entries(deaths).sort((a, b) => b[1] - a[1]);
  for (const [cause, count] of sorted) {
    const pct = (count / runs) * 100;
    const flag = pct > 25 && cause !== 'extracted' && cause !== 'timeout' ? '  <-- over 25%, balance bug' : '';
    console.log(`  ${cause.padEnd(18)} ${String(count).padStart(4)}  ${pct.toFixed(1)}%${flag}`);
  }

  console.log('');
  // Any single enemy causing more than a quarter of deaths is a balance bug,
  // and CI should say so out loud.
  const worst = sorted.find(([cause]) => cause !== 'extracted' && cause !== 'timeout');
  if (worst && worst[1] / runs > 0.25) {
    console.log(`WARN: ${worst[0]} causes ${((worst[1] / runs) * 100).toFixed(1)}% of all deaths.`);
  }
}

main();
