/**
 * Touch grammar (DESIGN.md §7): swipe to move, tap to path, long-press to
 * inspect. Every gesture is thumb-reachable from a one-handed grip.
 *
 * `coneDeg` is deliberately a knob. 8-way swipe accuracy on a phone is the
 * open question flagged in DESIGN.md §11.2 — `reversalCount` here is the
 * telemetry that settles it, and `fourWay` is the fallback if the data says so.
 */

import { vectorToDir } from '../core/grid.ts';

export type Gesture =
  | { kind: 'swipe'; dir: number }
  | { kind: 'tap'; x: number; y: number }
  | { kind: 'longpress'; x: number; y: number };

export interface GestureConfig {
  coneDeg: number;
  fourWay: boolean;
  swipeThresholdPx: number;
  longPressMs: number;
}

export const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  coneDeg: 45,
  fourWay: false,
  swipeThresholdPx: 24,
  longPressMs: 400,
};

export class GestureRecognizer {
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private active = false;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private fired = false;

  /** Telemetry: swipes immediately undone by their opposite (DESIGN.md §11.2). */
  reversalCount = 0;
  swipeCount = 0;
  private lastDir: number | null = null;
  private lastDirTime = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly toLogical: (clientX: number, clientY: number) => { x: number; y: number },
    private readonly emit: (g: Gesture) => void,
    public config: GestureConfig = { ...DEFAULT_GESTURE_CONFIG },
  ) {
    canvas.addEventListener('pointerdown', this.onDown, { passive: false });
    canvas.addEventListener('pointermove', this.onMove, { passive: false });
    canvas.addEventListener('pointerup', this.onUp, { passive: false });
    canvas.addEventListener('pointercancel', this.onCancel, { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onDown = (e: PointerEvent): void => {
    e.preventDefault();
    this.canvas.setPointerCapture(e.pointerId);
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startTime = performance.now();
    this.active = true;
    this.fired = false;
    this.longPressTimer = setTimeout(() => {
      if (!this.active || this.fired) return;
      this.fired = true;
      const p = this.toLogical(this.startX, this.startY);
      this.emit({ kind: 'longpress', x: p.x, y: p.y });
    }, this.config.longPressMs);
  };

  private onMove = (e: PointerEvent): void => {
    if (!this.active) return;
    e.preventDefault();
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    // Moving past the threshold cancels a pending long-press.
    if (Math.hypot(dx, dy) > 8 && this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  };

  private onUp = (e: PointerEvent): void => {
    if (!this.active) return;
    e.preventDefault();
    this.active = false;
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    if (this.fired) return;

    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const travelled = Math.hypot(dx, dy);

    if (travelled >= this.config.swipeThresholdPx) {
      const cone = this.config.fourWay ? 90 : this.config.coneDeg;
      let dir = vectorToDir(dx, dy, cone);
      if (dir !== null && this.config.fourWay && dir % 2 === 1) dir = null;
      if (dir !== null) {
        this.recordDir(dir);
        this.emit({ kind: 'swipe', dir });
      }
      return;
    }
    if (performance.now() - this.startTime < this.config.longPressMs) {
      const p = this.toLogical(e.clientX, e.clientY);
      this.emit({ kind: 'tap', x: p.x, y: p.y });
    }
  };

  private onCancel = (): void => {
    this.active = false;
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  };

  private recordDir(dir: number): void {
    const now = performance.now();
    this.swipeCount++;
    if (this.lastDir !== null && now - this.lastDirTime < 1200 && (this.lastDir + 4) % 8 === dir) {
      this.reversalCount++;
    }
    this.lastDir = dir;
    this.lastDirTime = now;
  }
}
