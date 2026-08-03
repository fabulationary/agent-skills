/**
 * Composition root and frame loop.
 *
 * This is the only file allowed to know about both the simulation and the DOM.
 * Input becomes an Intent, `execute` resolves the whole turn, and the returned
 * events drive presentation — the world is already final before the first
 * frame of animation plays (ARCHITECTURE.md §4).
 */

import { GRAFTS, SPIKES, ITEMS } from './content/items.ts';
import { tierFor, TIER_WARNING } from './sim/grafts.ts';
import { findPath } from './sim/path.ts';
import { execute } from './sim/turn.ts';
import {
  Tile, type Intent, type SimEvent, type SpikeKind, type World,
} from './sim/types.ts';
import {
  actorAt, createWorld, deserialize, isWalkable, navOf, serialize, tileAt,
} from './sim/world.ts';
import { drawText, textWidth } from './render/font.ts';
import { buildSlots, drawActionBar, drawLog, drawStatus, type SlotDef } from './render/hud.ts';
import { cameraOrigin, computeLayout, TILE, type Layout } from './render/layout.ts';
import { P, SEM } from './render/palette.ts';
import { drawScene, newFx, spriteForItem, type SceneFx } from './render/scene.ts';
import { drawSprite } from './render/sprites.ts';
import { DEFAULT_GESTURE_CONFIG, GestureRecognizer, type Gesture } from './input/gestures.ts';
import {
  clearRun, flushRun, loadMeta, loadRun, loadSettings, saveMeta, saveRun, saveSettings,
  type Settings,
} from './platform/storage.ts';

type Mode = 'play' | 'inventory' | 'targeting' | 'install' | 'over';

const screen = document.getElementById('screen') as HTMLCanvasElement;
const out = screen.getContext('2d')!;
const buffer = document.createElement('canvas');
const g = buffer.getContext('2d', { alpha: false })!;

let layout: Layout = computeLayout(window.innerWidth, window.innerHeight);
let settings: Settings = loadSettings();
let meta = loadMeta();
let world: World;
let fx: SceneFx = newFx();
let mode: Mode = 'play';
let slots: SlotDef[] = [];
let pendingSpike: SpikeKind | null = null;
let activeSlot: number | null = null;
let pendingInstallItemId: number | null = null;
let autoPath: { x: number; y: number }[] | null = null;
let autoNext = 0;
let inspectText = '';
let inspectUntil = 0;
let dirty = true;

// --- boot -------------------------------------------------------------------

function startRun(seed?: string): void {
  const chosen = seed ?? `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
  world = createWorld(chosen);
  fx = newFx();
  mode = 'play';
  autoPath = null;
  meta.runs++;
  saveMeta(meta);
  persist();
  dirty = true;
}

const restored = loadRun();
const restoredWorld = restored ? deserialize(restored) : null;
if (restoredWorld && !restoredWorld.dead && !restoredWorld.won) {
  world = restoredWorld;
  fx = newFx();
} else {
  startRun();
}

function persist(): void {
  saveRun(serialize(world));
}

// --- layout / scaling -------------------------------------------------------

function resize(): void {
  layout = computeLayout(window.innerWidth, window.innerHeight);
  buffer.width = layout.logicalW;
  buffer.height = layout.logicalH;
  screen.width = layout.logicalW * layout.scale;
  screen.height = layout.logicalH * layout.scale;
  screen.style.width = `${screen.width}px`;
  screen.style.height = `${screen.height}px`;
  out.imageSmoothingEnabled = false;
  g.imageSmoothingEnabled = false;
  dirty = true;
}
window.addEventListener('resize', resize);
resize();

function toLogical(clientX: number, clientY: number): { x: number; y: number } {
  const rect = screen.getBoundingClientRect();
  return {
    x: (clientX - rect.left) / layout.scale,
    y: (clientY - rect.top) / layout.scale,
  };
}

// --- event consumption ------------------------------------------------------

function haptic(ms: number): void {
  if (!settings.haptics) return;
  try {
    navigator.vibrate?.(ms);
  } catch { /* unsupported */ }
}

function consume(events: SimEvent[]): void {
  const now = performance.now();
  for (const e of events) {
    switch (e.t) {
      case 'attack': {
        const target = world.actors.find((a) => a.id === e.targetId);
        if (target) {
          fx.floats.push({
            text: `-${e.dmg}`, x: target.x, y: target.y,
            color: target.faction === 'player' ? SEM.threat : SEM.textBright,
            born: now,
          });
        }
        if (e.crit || (target && target.faction === 'player')) {
          fx.shakeUntil = now + 120;
          fx.shakeMag = e.crit ? 3 : 2;
        }
        haptic(target?.faction === 'player' ? 30 : 12);
        break;
      }
      case 'trace':
        fx.flashUntil = now + 300;
        haptic(60);
        break;
      case 'glitch':
        fx.glitchUntil = now + 400 * e.severity;
        break;
      case 'explode':
        fx.shakeUntil = now + 140;
        fx.shakeMag = 4;
        haptic(45);
        break;
      case 'descend':
        fx.floats.length = 0;
        autoPath = null;
        break;
      case 'blocked':
        autoPath = null;
        break;
    }
  }
  fx.floats = fx.floats.filter((f) => now - f.born < 400);

  // Instability keeps a low-level tear running once you are past CLEAN.
  if (tierFor(world.player.instability) !== 'CLEAN' && Math.random() < 0.04) {
    fx.glitchUntil = now + 200;
  }
  dirty = true;
}

/** Any of these means "something interesting happened" — stop auto-running. */
function interrupts(events: SimEvent[]): boolean {
  return events.some((e) =>
    e.t === 'attack' || e.t === 'trace' || e.t === 'spawn' ||
    e.t === 'blocked' || e.t === 'pickup' || e.t === 'explode' || e.t === 'shoot');
}

function act(intent: Intent): void {
  if (world.dead || world.won) return;
  const events = execute(world, intent);
  consume(events);
  if (interrupts(events)) autoPath = null;
  if (world.dead || world.won) {
    mode = 'over';
    autoPath = null;
    meta.bestFloor = Math.max(meta.bestFloor, world.floor);
    meta.totalSalvage += world.salvage;
    if (world.won) meta.wins++;
    saveMeta(meta);
    clearRun();
  } else {
    persist();
  }
}

// --- input ------------------------------------------------------------------

function visibleEnemyAt(x: number, y: number) {
  const a = actorAt(world, x, y);
  if (!a || a.faction !== 'hostile') return undefined;
  return world.visible[y * world.w + x] ? a : undefined;
}

function tileUnder(lx: number, ly: number): { x: number; y: number } | null {
  if (ly < layout.viewY || ly >= layout.viewY + layout.viewRows * TILE) return null;
  const p = world.actors[0];
  const cam = cameraOrigin(layout, p.x, p.y, world.w, world.h);
  const vx = Math.floor((lx - layout.viewX) / TILE);
  const vy = Math.floor((ly - layout.viewY) / TILE);
  if (vx < 0 || vy < 0 || vx >= layout.viewCols || vy >= layout.viewRows) return null;
  return { x: cam.x + vx, y: cam.y + vy };
}

function slotIndexUnder(lx: number, ly: number): number | null {
  if (ly < layout.barY + 6 || ly > layout.barY + 36) return null;
  const i = Math.floor((lx - 2) / 30);
  return i >= 0 && i < 6 ? i : null;
}

function onGesture(gesture: Gesture): void {
  if (mode === 'over') {
    if (gesture.kind === 'tap') startRun();
    return;
  }
  if (mode === 'install') {
    handleInstallTap(gesture);
    return;
  }
  if (mode === 'inventory') {
    if (gesture.kind === 'tap') handleInventoryTap(gesture.x, gesture.y);
    return;
  }

  if (gesture.kind === 'swipe') {
    if (mode === 'targeting') {
      mode = 'play';
      pendingSpike = null;
      activeSlot = null;
      dirty = true;
      return;
    }
    autoPath = null;
    act({ kind: 'move', dir: gesture.dir });
    return;
  }

  if (gesture.kind === 'longpress') {
    const tile = tileUnder(gesture.x, gesture.y);
    if (!tile) return;
    inspect(tile.x, tile.y);
    return;
  }

  // tap
  const slot = slotIndexUnder(gesture.x, gesture.y);
  if (slot !== null) { onSlotTap(slot); return; }

  const tile = tileUnder(gesture.x, gesture.y);
  if (!tile) return;
  const p = world.actors[0];

  if (mode === 'targeting') {
    const enemy = visibleEnemyAt(tile.x, tile.y);
    if (enemy && pendingSpike) act({ kind: 'spike', spike: pendingSpike, targetId: enemy.id });
    else if (enemy) act({ kind: 'shoot', targetId: enemy.id });
    mode = 'play';
    pendingSpike = null;
    activeSlot = null;
    dirty = true;
    return;
  }

  if (tile.x === p.x && tile.y === p.y) {
    // Tapping yourself: use the tile you are standing on, else wait.
    const here = tileAt(world, p.x, p.y);
    if (here === Tile.Elevator) act({ kind: 'descend' });
    else if (here === Tile.Terminal) act({ kind: 'splice' });
    else act({ kind: 'wait' });
    return;
  }

  const enemy = visibleEnemyAt(tile.x, tile.y);
  if (enemy && Math.max(Math.abs(enemy.x - p.x), Math.abs(enemy.y - p.y)) === 1) {
    act({ kind: 'step', x: enemy.x, y: enemy.y });
    return;
  }

  if (!isWalkable(world, tile.x, tile.y)) return;
  if (world.explored[tile.y * world.w + tile.x] !== 1) return;
  const path = findPath(navOf(world), p, tile);
  if (path && path.length) {
    autoPath = path;
    autoNext = 0;
  }
}

function onSlotTap(index: number): void {
  const slot = slots[index];
  if (!slot) return;
  autoPath = null;

  if (slot.kind === 'inventory') {
    mode = mode === 'inventory' ? 'play' : 'inventory';
    dirty = true;
    return;
  }
  if (!slot.ready) return;

  if (slot.kind === 'shoot') {
    mode = 'targeting';
    pendingSpike = null;
    activeSlot = index;
    dirty = true;
    return;
  }
  if (slot.kind === 'spike') {
    mode = 'targeting';
    pendingSpike = slot.spike!;
    activeSlot = index;
    dirty = true;
    return;
  }
  if (slot.kind === 'item' && slot.itemId !== undefined) {
    const item = world.player.inventory.find((i) => i.id === slot.itemId);
    if (item?.kind === 'graftchip') {
      pendingInstallItemId = item.id;
      mode = 'install';
      dirty = true;
      return;
    }
    act({ kind: 'use', itemId: slot.itemId });
  }
}

function handleInventoryTap(lx: number, ly: number): void {
  const rowH = 14;
  const top = layout.viewY + 24;
  const index = Math.floor((ly - top) / rowH);
  if (ly < top || index < 0 || index >= world.player.inventory.length) {
    mode = 'play';
    dirty = true;
    return;
  }
  void lx;
  const item = world.player.inventory[index];
  if (item.kind === 'graftchip') {
    pendingInstallItemId = item.id;
    mode = 'install';
    dirty = true;
    return;
  }
  mode = 'play';
  act({ kind: 'use', itemId: item.id });
}

/**
 * The install screen states in plain words what the next Instability tier will
 * do to the player's interface before they accept it. Consented deception is a
 * mechanic; unconsented deception is a bug (DESIGN.md §11.1).
 */
function handleInstallTap(gesture: Gesture): void {
  if (gesture.kind !== 'tap') return;
  const confirmY = layout.viewY + layout.viewRows * TILE - 34;
  const itemId = pendingInstallItemId;
  mode = 'play';
  pendingInstallItemId = null;
  dirty = true;
  if (gesture.y >= confirmY && gesture.y <= confirmY + 20 && itemId !== null) {
    act({ kind: 'use', itemId });
  }
}

function inspect(x: number, y: number): void {
  const i = y * world.w + x;
  const enemy = world.visible[i] ? actorAt(world, x, y) : undefined;
  const item = world.visible[i] ? world.items.find((it) => it.x === x && it.y === y) : undefined;
  if (enemy) {
    inspectText = `${enemy.name} ${enemy.hp}/${enemy.maxHp} ARM${enemy.armor}${enemy.breachable ? ' HACKABLE' : ''}`;
  } else if (item) {
    inspectText = `${ITEMS[item.kind].name}: ${ITEMS[item.kind].desc}`;
  } else if (world.explored[i] === 1) {
    const t = world.tiles[i];
    inspectText = t === Tile.Elevator ? 'SHAFT DOWN. TAP YOURSELF HERE TO DESCEND.'
      : t === Tile.Terminal ? 'TERMINAL. STAND ON IT AND TAP TO SPLICE IN.'
      : t === Tile.Wall ? 'CONCRETE AND REBAR.' : 'FLOOR.';
  } else {
    inspectText = 'UNKNOWN.';
  }
  inspectUntil = performance.now() + 2600;
  haptic(10);
  dirty = true;
}

new GestureRecognizer(screen, toLogical, onGesture, {
  ...DEFAULT_GESTURE_CONFIG,
  fourWay: settings.fourWaySwipe,
});

// Android back button / Escape: cancel targeting, then close a panel.
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (mode === 'targeting' || mode === 'install' || mode === 'inventory') {
      mode = 'play';
      pendingSpike = null;
      pendingInstallItemId = null;
      activeSlot = null;
      dirty = true;
    }
    return;
  }
  // Keyboard is a desktop-playtest convenience, not a shipping input path.
  const keyDirs: Record<string, number> = {
    ArrowUp: 0, ArrowRight: 2, ArrowDown: 4, ArrowLeft: 6,
    w: 0, d: 2, s: 4, a: 6, q: 7, e: 1, z: 5, c: 3,
  };
  if (mode === 'over') { startRun(); return; }
  if (e.key in keyDirs) { autoPath = null; act({ kind: 'move', dir: keyDirs[e.key] }); }
  else if (e.key === '.') act({ kind: 'wait' });
  else if (e.key === '>') act({ kind: 'descend' });
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushRun();
});
window.addEventListener('pagehide', flushRun);

// --- panels -----------------------------------------------------------------

function drawPanel(title: string, height: number): { x: number; y: number; w: number } {
  const x = 6;
  const w = layout.logicalW - 12;
  const y = layout.viewY + 8;
  g.fillStyle = P['0'];
  g.fillRect(x, y, w, height);
  g.fillStyle = P.m;
  g.fillRect(x, y, w, 1);
  g.fillRect(x, y + height - 1, w, 1);
  g.fillRect(x, y, 1, height);
  g.fillRect(x + w - 1, y, 1, height);
  drawText(g, title, x + 4, y + 5, SEM.interactive);
  return { x, y, w };
}

function drawInventory(): void {
  const height = layout.viewRows * TILE - 16;
  const panel = drawPanel('PACK', height);
  const inv = world.player.inventory;
  if (!inv.length) {
    drawText(g, 'EMPTY.', panel.x + 6, panel.y + 26, P.e);
  }
  inv.forEach((item, i) => {
    const y = layout.viewY + 24 + i * 14;
    if (y > panel.y + height - 12) return;
    drawSprite(g, spriteForItem(item.kind), panel.x + 2, y - 5);
    const name = item.kind === 'graftchip' && !world.player.identified[item.graftKind ?? '']
      ? 'GRAFT CHIP'
      : item.kind === 'graftchip'
        ? GRAFTS[item.graftKind!].name
        : ITEMS[item.kind].name;
    drawText(g, name.slice(0, 22), panel.x + 20, y, SEM.textBright);
  });
  drawText(g, 'TAP AN ENTRY TO USE IT', panel.x + 4, panel.y + height - 10, P.e, 0.7);
}

function drawInstallPrompt(): void {
  const item = world.player.inventory.find((i) => i.id === pendingInstallItemId);
  if (!item?.graftKind) { mode = 'play'; return; }
  const grafts = GRAFTS[item.graftKind];
  const height = layout.viewRows * TILE - 16;
  const panel = drawPanel('FIELD SURGERY', height);

  let y = panel.y + 20;
  drawText(g, grafts.name.slice(0, 26), panel.x + 4, y, SEM.you);
  y += 12;
  for (const line of wrap(grafts.desc, 27)) {
    drawText(g, line, panel.x + 4, y, P.e);
    y += 9;
  }
  y += 6;
  drawText(g, 'COST: 15 INTEGRITY', panel.x + 4, y, P.z);
  y += 9;
  drawText(g, '      10 TRACE', panel.x + 4, y, P.z);
  y += 9;
  drawText(g, `INSTABILITY +${grafts.instability}`, panel.x + 4, y, P.q);
  y += 12;

  const after = tierFor(world.player.instability + grafts.instability);
  const before = tierFor(world.player.instability);
  if (after !== before && TIER_WARNING[after]) {
    // Two lines: "THIS PUSHES YOU TO DISSOLUTION:" does not fit in 29 glyphs.
    drawText(g, 'THIS PUSHES YOU TO', panel.x + 4, y, SEM.threat);
    y += 9;
    drawText(g, `${after}:`, panel.x + 4, y, SEM.threat);
    y += 10;
    for (const line of wrap(TIER_WARNING[after], 27)) {
      drawText(g, line, panel.x + 4, y, SEM.threat);
      y += 9;
    }
  }

  const confirmY = layout.viewY + layout.viewRows * TILE - 34;
  // Hint sits above the button: below it fell outside the panel and clipped.
  drawText(g, 'TAP ELSEWHERE TO BACK OUT', panel.x + 4, confirmY - 11, P.e, 0.7);
  g.fillStyle = P.p;
  g.fillRect(panel.x + 4, confirmY, panel.w - 8, 20);
  g.fillStyle = P.r;
  g.fillRect(panel.x + 4, confirmY, panel.w - 8, 1);
  g.fillRect(panel.x + 4, confirmY + 19, panel.w - 8, 1);
  const label = 'INSTALL IT';
  drawText(g, label, panel.x + (panel.w - textWidth(label)) / 2, confirmY + 7, SEM.textBright);
}

function drawGameOver(): void {
  const height = layout.viewRows * TILE - 16;
  const panel = drawPanel(world.won ? 'EXTRACTED' : 'FLATLINED', height);
  let y = panel.y + 24;
  const lines = world.won
    ? ['THE WARDEN IS DOWN.', 'YOU RODE THE SHAFT OUT WITH', 'EVERYTHING YOU COULD CARRY.']
    : ['THE STACK KEEPS WHAT IT KILLS.', 'YOUR BROKER WILL HEAR ABOUT IT', 'FROM SOMEONE ELSE.'];
  for (const line of lines) {
    drawText(g, line, panel.x + 4, y, world.won ? P.v : P.D);
    y += 10;
  }
  y += 8;
  drawText(g, `DEPTH      SUB-0${world.floor}`, panel.x + 4, y, P.e); y += 10;
  drawText(g, `TURNS      ${world.turn}`, panel.x + 4, y, P.e); y += 10;
  drawText(g, `KILLS      ${world.player.kills}`, panel.x + 4, y, P.e); y += 10;
  drawText(g, `SALVAGE    ${world.salvage}`, panel.x + 4, y, P.A); y += 10;
  drawText(g, `INSTABILITY ${world.player.instability}`, panel.x + 4, y, P.q); y += 14;
  drawText(g, `BEST DEPTH SUB-0${meta.bestFloor}`, panel.x + 4, y, P.e); y += 10;
  drawText(g, `RUNS ${meta.runs}  WINS ${meta.wins}`, panel.x + 4, y, P.e);

  const label = 'TAP TO RUN AGAIN';
  drawText(g, label, panel.x + (panel.w - textWidth(label)) / 2,
    panel.y + height - 14, SEM.interactive);
}

function wrap(text: string, cols: number): string[] {
  const words = text.toUpperCase().split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > cols) {
      lines.push(line.trim());
      line = w;
    } else {
      line = `${line} ${w}`;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function drawTargetingOverlay(): void {
  const p = world.actors[0];
  const cam = cameraOrigin(layout, p.x, p.y, world.w, world.h);
  const range = pendingSpike ? SPIKES[pendingSpike].range : 8;
  g.globalAlpha = 0.5;
  for (const a of world.actors) {
    if (a.faction !== 'hostile') continue;
    if (!world.visible[a.y * world.w + a.x]) continue;
    if (Math.max(Math.abs(a.x - p.x), Math.abs(a.y - p.y)) > range) continue;
    // Only bracket what this action can actually affect. Marking an unbreachable
    // picker as a valid spike target is the interface lying for free.
    if (pendingSpike && !a.breachable) continue;
    const vx = a.x - cam.x;
    const vy = a.y - cam.y;
    if (vx < 0 || vy < 0 || vx >= layout.viewCols || vy >= layout.viewRows) continue;
    g.fillStyle = SEM.interactive;
    const px = layout.viewX + vx * TILE;
    const py = layout.viewY + vy * TILE;
    for (let i = 0; i < 5; i++) {
      g.fillRect(px + i, py, 1, 1);
      g.fillRect(px + 15 - i, py, 1, 1);
      g.fillRect(px + i, py + 15, 1, 1);
      g.fillRect(px + 15 - i, py + 15, 1, 1);
    }
  }
  g.globalAlpha = 1;
  const label = pendingSpike ? `${SPIKES[pendingSpike].name}: PICK A TARGET` : 'FIRE: PICK A TARGET';
  g.fillStyle = P['0'];
  g.fillRect(0, layout.viewY, layout.logicalW, 11);
  drawText(g, label, 3, layout.viewY + 2, SEM.interactive);
}

// --- frame loop -------------------------------------------------------------

let lastTileAnim = 0;

function frame(now: number): void {
  // Auto-run advances on a timer so the player can watch it and interrupt.
  if (autoPath && mode === 'play' && !world.dead && !world.won && now >= autoNext) {
    const step = autoPath[0];
    autoPath = autoPath.slice(1);
    autoNext = now + 70;
    act({ kind: 'step', x: step.x, y: step.y });
    if (autoPath && autoPath.length === 0) autoPath = null;
  }

  const animating =
    now < fx.shakeUntil || now < fx.glitchUntil || now < fx.flashUntil ||
    fx.floats.length > 0 || autoPath !== null ||
    world.traceState === 'PURGE' || now < inspectUntil;

  // 6fps ambient tick for neon flicker; everything else is event-driven.
  const tick = now - lastTileAnim > 166;
  if (tick) lastTileAnim = now;

  if (dirty || animating || tick) {
    slots = buildSlots(world);
    g.fillStyle = SEM.void;
    g.fillRect(0, 0, layout.logicalW, layout.logicalH);

    drawScene(g, world, layout, fx, {
      now,
      path: autoPath,
      selected: null,
      reducedMotion: settings.reducedMotion,
    });
    drawStatus(g, world, layout, now);
    drawLog(g, world, layout);
    drawActionBar(g, world, layout, slots, mode === 'targeting' ? activeSlot : null);

    if (now < inspectUntil && mode === 'play') {
      g.fillStyle = P['0'];
      g.fillRect(0, layout.logY - 11, layout.logicalW, 11);
      drawText(g, inspectText.slice(0, 29), 3, layout.logY - 9, SEM.interactive);
    }
    if (mode === 'targeting') drawTargetingOverlay();
    if (mode === 'inventory') drawInventory();
    if (mode === 'install') drawInstallPrompt();
    if (mode === 'over') drawGameOver();

    out.imageSmoothingEnabled = false;
    out.drawImage(buffer, 0, 0, screen.width, screen.height);
    dirty = false;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Expose a tiny debug surface for playtesting from the console.
Object.assign(window as unknown as Record<string, unknown>, {
  ND: {
    world: () => world,
    restart: (seed?: string) => startRun(seed),
    settings: () => settings,
    setSettings: (patch: Partial<Settings>) => {
      settings = { ...settings, ...patch };
      saveSettings(settings);
      dirty = true;
    },
  },
});
