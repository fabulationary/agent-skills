/**
 * Map, actor and effect rendering. Reads world state, never mutates it.
 *
 * The whole scene repaints in one pass, but the frame loop only calls it when
 * something changed or something is animating (see main.ts) — on a turn-based
 * game the screen is static while the player thinks, and running a 60Hz redraw
 * through that is a battery bug (ARCHITECTURE.md §6).
 */

import { RNG } from '../core/rng.ts';
import { tierFor } from '../sim/grafts.ts';
import { Tile, type World } from '../sim/types.ts';
import { cameraOrigin, TILE, type Layout } from './layout.ts';
import { P, SEM } from './palette.ts';
import { drawText } from './font.ts';
import { drawOutline, drawSprite } from './sprites.ts';

export interface FloatText {
  text: string;
  x: number;
  y: number;
  color: string;
  born: number;
}

export interface SceneFx {
  floats: FloatText[];
  shakeUntil: number;
  shakeMag: number;
  glitchUntil: number;
  flashUntil: number;
}

export function newFx(): SceneFx {
  return { floats: [], shakeUntil: 0, shakeMag: 0, glitchUntil: 0, flashUntil: 0 };
}

/** Deterministic per-tile detail: the same tile always looks the same. */
function tileHash(x: number, y: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Floor sits a full ramp step above void. It was one step darker, and in an
 * open cavern — where there are no walls in frame to provide contrast — the
 * map read as an empty black rectangle. Legibility at arm's length beats
 * atmosphere every time (ART-DIRECTION.md §0).
 */
function drawFloorTile(g: CanvasRenderingContext2D, px: number, py: number, x: number, y: number): void {
  g.fillStyle = P.b;
  g.fillRect(px, py, TILE, TILE);
  g.fillStyle = P.a;
  g.fillRect(px, py, TILE, 1);
  g.fillRect(px, py, 1, TILE);
  for (let i = 0; i < 12; i++) {
    const rx = (tileHash(x * 16 + i, y) * TILE) | 0;
    const ry = (tileHash(x, y * 16 + i) * TILE) | 0;
    g.fillStyle = tileHash(x + i, y + i) > 0.5 ? P.c : P.a;
    g.fillRect(px + rx, py + ry, 1, 1);
  }
}

function drawWallTile(g: CanvasRenderingContext2D, px: number, py: number, x: number, y: number): void {
  g.fillStyle = P.d;
  g.fillRect(px, py, TILE, TILE);
  g.fillStyle = P.e;
  g.fillRect(px, py, TILE, 2);
  g.fillStyle = P.c;
  g.fillRect(px, py + 12, TILE, 4);
  g.fillStyle = P.a;
  g.fillRect(px, py + 15, TILE, 1);
  g.fillRect(px + 15, py, 1, TILE);
  g.fillStyle = P.c;
  for (let i = 0; i < 9; i++) {
    const rx = (tileHash(x * 7 + i, y * 3) * 14) | 0;
    const ry = 2 + ((tileHash(x * 3, y * 7 + i) * 11) | 0);
    g.fillRect(px + rx, py + ry, 1, 1);
  }
  if (tileHash(x + 9, y + 4) > 0.72) {
    g.fillStyle = P.x;
    g.fillRect(px + 1, py + 8, 3, 6);
    g.fillRect(px + 4, py + 10, 2, 4);
  }
}

function drawGrateTile(g: CanvasRenderingContext2D, px: number, py: number, x: number, y: number): void {
  drawFloorTile(g, px, py, x, y);
  g.fillStyle = P.b;
  g.fillRect(px + 2, py + 3, 12, 10);
  g.fillStyle = P.a;
  for (let i = 0; i < 10; i += 3) g.fillRect(px + 2, py + 3 + i, 12, 2);
}

function drawRubbleTile(g: CanvasRenderingContext2D, px: number, py: number, x: number, y: number): void {
  drawFloorTile(g, px, py, x, y);
  g.fillStyle = P.b;
  g.fillRect(px + 4, py + 8, 5, 3);
  g.fillRect(px + 9, py + 10, 3, 2);
  g.fillStyle = P.c;
  g.fillRect(px + 5, py + 8, 3, 1);
}

function glow(
  g: CanvasRenderingContext2D,
  cx: number, cy: number, radius: number, color: string, alpha: number,
): void {
  const grad = g.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'transparent');
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = alpha;
  g.fillStyle = grad;
  g.beginPath();
  g.arc(cx, cy, radius, 0, Math.PI * 2);
  g.fill();
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
}

export interface SceneOptions {
  now: number;
  path: { x: number; y: number }[] | null;
  selected: number | null;
  reducedMotion: boolean;
}

export function drawScene(
  g: CanvasRenderingContext2D,
  world: World,
  layout: Layout,
  fx: SceneFx,
  opts: SceneOptions,
): void {
  const p = world.actors[0];
  const cam = cameraOrigin(layout, p.x, p.y, world.w, world.h);
  const tier = tierFor(world.player.instability);

  g.save();
  g.beginPath();
  g.rect(layout.viewX, layout.viewY, layout.viewCols * TILE, layout.viewRows * TILE);
  g.clip();

  // Screen shake, on heavy hits only, <=4px and <=120ms.
  let shakeX = 0;
  let shakeY = 0;
  if (!opts.reducedMotion && opts.now < fx.shakeUntil) {
    const rng = new RNG(`shake${Math.floor(opts.now / 40)}`);
    shakeX = Math.round((rng.next() - 0.5) * fx.shakeMag * 2);
    shakeY = Math.round((rng.next() - 0.5) * fx.shakeMag * 2);
  }
  g.translate(shakeX, shakeY);

  g.fillStyle = SEM.void;
  g.fillRect(layout.viewX - 4, layout.viewY - 4,
    layout.viewCols * TILE + 8, layout.viewRows * TILE + 8);

  // --- terrain -------------------------------------------------------------
  for (let vy = 0; vy < layout.viewRows; vy++) {
    for (let vx = 0; vx < layout.viewCols; vx++) {
      const x = cam.x + vx;
      const y = cam.y + vy;
      if (x < 0 || y < 0 || x >= world.w || y >= world.h) continue;
      const i = y * world.w + x;
      const seen = world.explored[i] === 1;
      if (!seen) continue;

      const px = layout.viewX + vx * TILE;
      const py = layout.viewY + vy * TILE;
      const memory = !world.visible[i];
      g.save();
      if (memory) g.globalAlpha = 0.4;

      switch (world.tiles[i]) {
        case Tile.Wall: drawWallTile(g, px, py, x, y); break;
        case Tile.Grate: drawGrateTile(g, px, py, x, y); break;
        case Tile.Rubble: drawRubbleTile(g, px, py, x, y); break;
        case Tile.Elevator: drawFloorTile(g, px, py, x, y); drawSprite(g, 'elevator', px, py); break;
        case Tile.Terminal: drawWallTile(g, px, py, x, y); drawSprite(g, 'terminal', px, py); break;
        default: drawFloorTile(g, px, py, x, y);
      }
      g.restore();
    }
  }

  // --- glow layer ----------------------------------------------------------
  const flicker = 1 - (tileHash(Math.floor(opts.now / 160), 7) * 0.12);
  for (let vy = 0; vy < layout.viewRows; vy++) {
    for (let vx = 0; vx < layout.viewCols; vx++) {
      const x = cam.x + vx;
      const y = cam.y + vy;
      if (x < 0 || y < 0 || x >= world.w || y >= world.h) continue;
      const i = y * world.w + x;
      if (world.explored[i] !== 1) continue;
      const cx = layout.viewX + vx * TILE + 8;
      const cy = layout.viewY + vy * TILE + 8;
      if (world.tiles[i] === Tile.Elevator) glow(g, cx, cy, 40, P.o, 0.26 * flicker);
      else if (world.tiles[i] === Tile.Terminal) glow(g, cx, cy, 32, P.n, 0.3 * flicker);
    }
  }
  glow(g, layout.viewX + (p.x - cam.x) * TILE + 8, layout.viewY + (p.y - cam.y) * TILE + 8,
    30, P.r, 0.2);

  // --- tap-to-path preview -------------------------------------------------
  if (opts.path) {
    g.fillStyle = P.o;
    g.globalAlpha = 0.5;
    for (const step of opts.path) {
      const vx = step.x - cam.x;
      const vy = step.y - cam.y;
      if (vx < 0 || vy < 0 || vx >= layout.viewCols || vy >= layout.viewRows) continue;
      g.fillRect(layout.viewX + vx * TILE + 7, layout.viewY + vy * TILE + 7, 2, 2);
    }
    g.globalAlpha = 1;
  }

  // --- items (never drawn in remembered tiles: a stale item is a lie) -------
  for (const item of world.items) {
    const i = item.y * world.w + item.x;
    if (!world.visible[i]) continue;
    const vx = item.x - cam.x;
    const vy = item.y - cam.y;
    if (vx < 0 || vy < 0 || vx >= layout.viewCols || vy >= layout.viewRows) continue;
    const px = layout.viewX + vx * TILE;
    const py = layout.viewY + vy * TILE;
    drawSprite(g, spriteForItem(item.kind), px, py);
    glow(g, px + 8, py + 8, 14, P.n, 0.22);
  }

  // --- actors --------------------------------------------------------------
  for (const a of world.actors) {
    const i = a.y * world.w + a.x;
    if (a.faction !== 'player' && !world.visible[i]) continue;
    const vx = a.x - cam.x;
    const vy = a.y - cam.y;
    if (vx < 0 || vy < 0 || vx >= layout.viewCols || vy >= layout.viewRows) continue;
    const px = layout.viewX + vx * TILE;
    const py = layout.viewY + vy * TILE;

    if (a.faction === 'hostile') {
      // FRACTURE: threat colour occasionally lies. The player was warned in
      // plain words at the install screen; that consent is what separates
      // this from a bug (DESIGN.md §11.1).
      let color = a.aware ? SEM.threat : SEM.threatDim;
      let dashed = a.aware;
      if (tier === 'FRACTURE' || tier === 'DISSOLUTION') {
        if (tileHash(a.id, Math.floor(opts.now / 900)) > 0.85) {
          color = SEM.data;
          dashed = !dashed;
        }
      }
      drawOutline(g, a.sprite, px, py, color, dashed);
      if (a.status.lock > 0) glow(g, px + 8, py + 8, 14, P.n, 0.35);
      if (a.status.burn > 0) glow(g, px + 8, py + 8, 16, P.z, 0.4);
    }
    if (a.id === opts.selected) drawOutline(g, a.sprite, px, py, P.o, false);

    drawSprite(g, a.sprite, px, py);
    if (a.big) {
      // Bosses read as 2x2 by drawing a base plate under the 16x16 sprite.
      g.globalAlpha = 0.5;
      g.fillStyle = P.y;
      g.fillRect(px - 3, py + 14, 22, 2);
      g.globalAlpha = 1;
    }

    if (a.faction === 'hostile' && a.hp < a.maxHp) {
      const w = Math.max(1, Math.round((a.hp / a.maxHp) * 14));
      g.fillStyle = P.B;
      g.fillRect(px + 1, py - 3, 14, 2);
      g.fillStyle = P.D;
      g.fillRect(px + 1, py - 3, w, 2);
    }
  }

  // --- floating damage numbers --------------------------------------------
  for (const f of fx.floats) {
    const age = (opts.now - f.born) / 300;
    if (age > 1) continue;
    const vx = f.x - cam.x;
    const vy = f.y - cam.y;
    if (vx < 0 || vy < 0 || vx >= layout.viewCols || vy >= layout.viewRows) continue;
    drawText(g, f.text,
      layout.viewX + vx * TILE + 3,
      layout.viewY + vy * TILE - Math.round(age * 6),
      f.color, 1 - age);
  }

  // --- post ----------------------------------------------------------------
  g.fillStyle = '#000';
  g.globalAlpha = 0.08;
  for (let y = layout.viewY; y < layout.viewY + layout.viewRows * TILE; y += 3) {
    g.fillRect(layout.viewX, y, layout.viewCols * TILE, 1);
  }
  g.globalAlpha = 1;

  // PURGE desaturates everything that isn't an actor, so the Hunter-Killer's
  // outline is the most saturated thing on screen from the moment it lands.
  if (world.traceState === 'PURGE') {
    g.globalAlpha = 0.22;
    g.fillStyle = P.B;
    g.fillRect(layout.viewX, layout.viewY, layout.viewCols * TILE, layout.viewRows * TILE);
    g.globalAlpha = 1;
  }

  const vignette = g.createRadialGradient(
    layout.viewX + (layout.viewCols * TILE) / 2, layout.viewY + (layout.viewRows * TILE) / 2, 40,
    layout.viewX + (layout.viewCols * TILE) / 2, layout.viewY + (layout.viewRows * TILE) / 2, 150,
  );
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, SEM.void);
  g.globalAlpha = 0.5;
  g.fillStyle = vignette;
  g.fillRect(layout.viewX, layout.viewY, layout.viewCols * TILE, layout.viewRows * TILE);
  g.globalAlpha = 1;

  // STATIC and above: horizontal tear. Escalates as a legible progression
  // rather than as random noise.
  if (!opts.reducedMotion && tier !== 'CLEAN' && opts.now < fx.glitchUntil) {
    const rng = new RNG(`tear${Math.floor(opts.now / 60)}`);
    const rows = tier === 'STATIC' ? 1 : tier === 'DISSONANCE' ? 2 : 4;
    for (let i = 0; i < rows; i++) {
      const y = layout.viewY + rng.int(layout.viewRows * TILE - 4);
      const h = 1 + rng.int(3);
      const shift = rng.range(-4, 4);
      const slice = g.getImageData(layout.viewX, y, layout.viewCols * TILE, h);
      g.putImageData(slice, layout.viewX + shift, y);
    }
  }

  g.restore();
}

export function spriteForItem(kind: string): string {
  switch (kind) {
    case 'patchkit': return 'patchkit';
    case 'powercell': return 'powercell';
    case 'scrub': return 'scrub';
    case 'emp': return 'emp';
    case 'ampoule': return 'ampoule';
    default: return 'graftchip';
  }
}
