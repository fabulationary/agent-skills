/**
 * Status bar, message log and action bar (ART-DIRECTION.md §2).
 *
 * The Trace bar is the widest single element on screen and sits under the
 * eye's resting position, because it is the most important number in the game.
 */

import { SPIKES, ITEMS } from '../content/items.ts';
import { tierFor } from '../sim/grafts.ts';
import type { SpikeKind, World } from '../sim/types.ts';
import { drawText, textWidth } from './font.ts';
import type { Layout } from './layout.ts';
import { P, SEM } from './palette.ts';
import { spriteForItem } from './scene.ts';
import { drawSprite } from './sprites.ts';

export interface SlotDef {
  id: string;
  label: string;
  kind: 'spike' | 'item' | 'shoot' | 'inventory';
  itemId?: number;
  spike?: SpikeKind;
  count: number;
  ready: boolean;
}

const TRACE_COLOR: Record<string, string> = {
  CLEAR: P.d, ALERT: P.A, HUNT: P.z, LOCKDOWN: P.C, PURGE: P.D,
};

function meter(
  g: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, pct: number, fill: string,
): void {
  g.fillStyle = P.a;
  g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle = P['1'];
  g.fillRect(x, y, w, h);
  g.fillStyle = fill;
  g.fillRect(x, y, Math.max(0, Math.round(w * Math.max(0, Math.min(1, pct)))), h);
  g.fillStyle = P.c;
  g.fillRect(x - 1, y - 1, w + 2, 1);
  g.fillRect(x - 1, y + h, w + 2, 1);
  g.fillRect(x - 1, y - 1, 1, h + 2);
  g.fillRect(x + w, y - 1, 1, h + 2);
}

export function drawStatus(
  g: CanvasRenderingContext2D,
  world: World,
  layout: Layout,
  now: number,
): void {
  const p = world.actors[0];
  g.fillStyle = SEM.void;
  g.fillRect(0, 0, layout.logicalW, layout.viewY);

  meter(g, 4, 3, 72, 6, p.hp / p.maxHp, P.C);
  meter(g, 104, 3, 72, 6, world.player.power / world.player.maxPower, P.u);
  drawText(g, 'HP', 4, 12, P.h);
  drawText(g, `${Math.max(0, p.hp)}/${p.maxHp}`, 22, 12, P.e);
  drawText(g, 'PWR', 104, 12, P.t);
  drawText(g, `${Math.round(world.player.power)}`, 128, 12, P.e);

  const traceColor = TRACE_COLOR[world.traceState] ?? P.d;
  // PURGE pulses. Three channels carry a threshold crossing; this is one.
  const pulse = world.traceState === 'PURGE' && Math.floor(now / 250) % 2 === 0;
  meter(g, 4, 21, 172, 5, world.trace / 100, pulse ? P.L : traceColor);

  // y=26, not 28: a 7-row glyph at 28 runs to row 34, which is the first row
  // of the map viewport, and the status line lost its bottom pixel to it.
  drawText(g, `SUB-0${world.floor}`, 4, 26, SEM.interactive);
  const state = world.traceState;
  drawText(g, state, Math.round((layout.logicalW - textWidth(state)) / 2), 26, traceColor);
  const cred = `$${world.player.credits + world.salvage}`;
  drawText(g, cred, layout.logicalW - 4 - textWidth(cred), 26, P.A);

  // Instability tier is right-aligned on the meter row. It used to sit at x=78,
  // where a four-letter tier abbreviation ran straight into the PWR label.
  const tier = tierFor(world.player.instability);
  if (tier !== 'CLEAN') {
    const abbr = tier.slice(0, 4);
    drawText(g, abbr, layout.logicalW - 4 - textWidth(abbr), 12,
      tier === 'DISSOLUTION' ? P.r : P.q);
  }
}

export function drawLog(
  g: CanvasRenderingContext2D,
  world: World,
  layout: Layout,
): void {
  g.fillStyle = SEM.void;
  g.fillRect(0, layout.logY, layout.logicalW, layout.logH);
  g.fillStyle = P.b;
  g.fillRect(0, layout.logY, layout.logicalW, 1);

  const rows = Math.max(2, Math.floor((layout.logH - 2) / 9));
  const tone: Record<string, string> = {
    info: P.e, good: P.v, bad: P.D, alert: P.z,
  };

  // 29 glyphs is the widest line that fits 180px at 6px per glyph. Long
  // messages wrap onto continuation rows rather than truncating — a message
  // cut off at "SUBLEVEL 1. THE STACK IS AW" is worse than no message.
  const wrapped: { text: string; color: string }[] = [];
  for (const line of world.log.slice(-rows)) {
    const suffix = line.count > 1 ? ` X${line.count}` : '';
    const words = `> ${line.text}${suffix}`.split(' ');
    let current = '';
    for (const word of words) {
      if (current && (current + ' ' + word).length > 29) {
        wrapped.push({ text: current, color: tone[line.tone] });
        current = `  ${word}`;
      } else {
        current = current ? `${current} ${word}` : word;
      }
    }
    if (current) wrapped.push({ text: current, color: tone[line.tone] });
  }

  const shown = wrapped.slice(-rows);
  shown.forEach((line, i) => {
    drawText(g, line.text.slice(0, 29), 3, layout.logY + 3 + i * 9, line.color,
      i === shown.length - 1 ? 1 : 0.6);
  });
}

export function drawActionBar(
  g: CanvasRenderingContext2D,
  world: World,
  layout: Layout,
  slots: SlotDef[],
  activeSlot: number | null,
): void {
  g.fillStyle = SEM.void;
  g.fillRect(0, layout.barY, layout.logicalW, layout.logicalH - layout.barY);
  g.fillStyle = P.b;
  g.fillRect(0, layout.barY, layout.logicalW, 1);

  slots.forEach((slot, i) => {
    const x = 2 + i * 30;
    const y = layout.barY + 8;
    const size = 26;
    g.fillStyle = i === activeSlot ? P['2'] : P['1'];
    g.fillRect(x, y, size, size);
    const border = i === activeSlot ? P.o : slot.ready ? P.c : P.b;
    g.fillStyle = border;
    g.fillRect(x, y, size, 1);
    g.fillRect(x, y + size - 1, size, 1);
    g.fillRect(x, y, 1, size);
    g.fillRect(x + size - 1, y, 1, size);

    g.save();
    g.globalAlpha = slot.ready ? 1 : 0.35;
    drawSlotIcon(g, slot, x + 5, y + 5);
    g.restore();

    if (slot.count >= 0) {
      const label = String(slot.count);
      drawText(g, label, x + size - textWidth(label) - 2, y + size - 8,
        slot.ready ? SEM.textBright : P.h);
    }
  });

  const weapon = world.player.ammo > 0 ? 'SMG + CUTTER' : 'CUTTER';
  drawText(g, weapon, 3, layout.barY + 40, P.e);
  const ammo = `${world.player.ammo}/${world.player.maxAmmo}`;
  drawText(g, ammo, layout.logicalW - 4 - textWidth(ammo), layout.barY + 40, P.A);
}

function drawSlotIcon(g: CanvasRenderingContext2D, slot: SlotDef, x: number, y: number): void {
  if (slot.kind === 'inventory') {
    g.fillStyle = SEM.interactive;
    for (let i = 0; i < 3; i++) g.fillRect(x + 1, y + 3 + i * 5, 14, 2);
    return;
  }
  if (slot.kind === 'shoot') {
    g.fillStyle = P.c;
    g.fillRect(x, y + 5, 13, 4);
    g.fillStyle = P.b;
    g.fillRect(x + 4, y + 9, 4, 5);
    g.fillStyle = P.e;
    g.fillRect(x, y + 5, 13, 1);
    return;
  }
  if (slot.kind === 'spike') {
    const tint = slot.spike === 'overload' ? P.z : slot.spike === 'lockout' ? P.n : P.v;
    g.fillStyle = P.t;
    g.fillRect(x + 1, y + 2, 14, 12);
    g.fillStyle = tint;
    g.fillRect(x + 3, y + 4, 10, 8);
    g.fillStyle = P.w;
    g.fillRect(x + 6, y + 6, 4, 4);
    return;
  }
  // Items reuse their world sprite, drawn into the 16px icon area.
  drawSprite(g, slot.id, x - 2, y - 2);
}

/** Builds the six action-bar slots from current inventory and spikes. */
export function buildSlots(world: World): SlotDef[] {
  const slots: SlotDef[] = [];
  slots.push({
    id: 'shoot', label: 'SMG', kind: 'shoot',
    count: world.player.ammo, ready: world.player.ammo > 0,
  });

  for (const spikeKind of ['overload', 'lockout'] as const) {
    const template = SPIKES[spikeKind];
    slots.push({
      id: spikeKind, label: template.name, kind: 'spike', spike: spikeKind,
      count: template.power, ready: world.player.power >= template.power,
    });
  }

  // Two most-useful consumables get a slot; the rest live in the inventory.
  const priority = ['patchkit', 'scrub', 'powercell', 'emp', 'ampoule', 'graftchip'];
  const shown: string[] = [];
  for (const kind of priority) {
    if (shown.length >= 2) break;
    const items = world.player.inventory.filter((i) => i.kind === kind);
    if (!items.length) continue;
    shown.push(kind);
    slots.push({
      id: spriteForItem(kind),
      label: ITEMS[kind].name,
      kind: 'item',
      itemId: items[0].id,
      count: items.length,
      ready: true,
    });
  }
  while (slots.length < 5) {
    slots.push({ id: 'empty', label: '', kind: 'item', count: -1, ready: false });
  }

  slots.push({ id: 'inventory', label: 'PACK', kind: 'inventory', count: -1, ready: true });
  return slots;
}
