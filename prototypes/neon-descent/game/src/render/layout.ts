/**
 * Resolution and layout (ARCHITECTURE.md §2).
 *
 * Fixed logical width of 180px because it divides 720/1080/1440 exactly, so
 * integer scaling — the only kind that doesn't destroy pixel art — is free on
 * every common Android width. Height is variable; the surplus goes to the log,
 * never to extra map rows, so a taller phone never sees more of the floor.
 */

export const LOGICAL_W = 180;
export const TILE = 16;
export const VIEW_COLS = 11;
export const STATUS_H = 34;
export const BAR_H = 52;
export const MIN_LOGICAL_H = 316;
export const MAX_LOGICAL_H = 420;
export const MIN_VIEW_ROWS = 13;
export const MAX_VIEW_ROWS = 15;

export interface Layout {
  scale: number;
  logicalW: number;
  logicalH: number;
  viewX: number;
  viewY: number;
  viewCols: number;
  viewRows: number;
  logY: number;
  logH: number;
  barY: number;
}

export function computeLayout(deviceW: number, deviceH: number): Layout {
  let scale = Math.max(1, Math.floor(deviceW / LOGICAL_W));
  while (scale > 1 && Math.floor(deviceH / scale) < MIN_LOGICAL_H) scale--;

  const logicalH = Math.min(MAX_LOGICAL_H, Math.max(MIN_LOGICAL_H, Math.floor(deviceH / scale)));
  const spare = logicalH - STATUS_H - BAR_H;
  const viewRows = Math.min(MAX_VIEW_ROWS, Math.max(MIN_VIEW_ROWS, Math.floor((spare - 22) / TILE)));
  const viewY = STATUS_H;
  const logY = viewY + viewRows * TILE;

  return {
    scale,
    logicalW: LOGICAL_W,
    logicalH,
    viewX: (LOGICAL_W - VIEW_COLS * TILE) / 2,
    viewY,
    viewCols: VIEW_COLS,
    viewRows,
    logY,
    logH: logicalH - BAR_H - logY,
    barY: logicalH - BAR_H,
  };
}

/** Camera origin in tiles: player-centred, clamped to the map. */
export function cameraOrigin(
  layout: Layout,
  px: number,
  py: number,
  mapW: number,
  mapH: number,
): { x: number; y: number } {
  const x = Math.max(0, Math.min(mapW - layout.viewCols, px - (layout.viewCols >> 1)));
  const y = Math.max(0, Math.min(mapH - layout.viewRows, py - (layout.viewRows >> 1)));
  return { x, y };
}
