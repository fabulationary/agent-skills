/**
 * 16x16 sprites, <=12 colors each, drawn from ELEVATION-36 (ART-DIRECTION.md §3).
 *
 * Defined inline rather than as a PNG atlas: the whole slice has no external
 * assets, so cold start is a parse and nothing else. The build-time palette
 * linter described in ARCHITECTURE.md §9 becomes a unit test against these
 * tables once sprites move to PNGs.
 */

import { P } from './palette.ts';

export type Sprite = string[];

export const SPRITES: Record<string, Sprite> = {
  player: [
    '................',
    '.....000000.....',
    '....0jjjjjj0....',
    '....0jkkkkj0....',
    '....0jnnkkj0....',
    '....0jkkkkj0....',
    '.....0kkkk0.....',
    '....0qrrrrq0....',
    '...0qrrrrrrq0...',
    '...0qrrrrrrq0...',
    '...0qrccccrq0...',
    '....0rrrrrr0....',
    '....0bb00bb0....',
    '....0bb..bb0....',
    '....0cc..cc0....',
    '.....00..00.....',
  ],
  picker: [
    '................',
    '................',
    '.....000000.....',
    '....0hiiiih0....',
    '....0hiDDih0....',
    '....0hiiiih0....',
    '.....0iiii0.....',
    '....0yzzzzy0....',
    '...0yzzzzzzy0...',
    '...0yzzzzzzy0...',
    '....0zzzzzz0....',
    '....0zz00zz0....',
    '....0bb..bb0....',
    '....0bb..bb0....',
    '.....00..00.....',
    '................',
  ],
  grafted: [
    '................',
    '.....000000.....',
    '....0feeeef0....',
    '....0fDDDDf0....',
    '....0feeeef0....',
    '....0fe00ef0....',
    '.....0eeee0.....',
    '....0dcccdd0....',
    '...0dcccccdd0...',
    '...0dcffffcd0...',
    '...0dcccccdd0...',
    '....0cccccc0....',
    '....0cc00cc0....',
    '....0dd..dd0....',
    '....0cc..cc0....',
    '.....00..00.....',
  ],
  drone: [
    '................',
    '................',
    '................',
    '....00....00....',
    '...0cc0000cc0...',
    '...0cccccccc0...',
    '....0cbbbbc0....',
    '...0cbvvvvbc0...',
    '...0cbvwwvbc0...',
    '...0cbvvvvbc0...',
    '....0cbbbbc0....',
    '.....0cccc0.....',
    '......0000......',
    '.......vv.......',
    '................',
    '................',
  ],
  turret: [
    '................',
    '................',
    '................',
    '.....000000.....',
    '....0bccccb0....',
    '....0cCCCCc0....',
    '...0cCDDDDCc0...',
    '...0cCDDDDCc0...',
    '....0cCCCCc0....',
    '....0bccccb0....',
    '...0bbbbbbbb0...',
    '..0bbcccccc bb0.',
    '..0bbbbbbbbbb0..',
    '..000000000000..',
    '................',
    '................',
  ],
  hunter: [
    '.....000000.....',
    '....0DDDDDD0....',
    '...0DCCCCCCD0...',
    '...0CaaaaaaC0...',
    '...0CaDDDDaC0...',
    '...0CaDwwDaC0...',
    '...0CaDDDDaC0...',
    '...0CaaaaaaC0...',
    '..0CCaaaaaaCC0..',
    '..0CaaaaaaaaC0..',
    '..0Caa0000aaC0..',
    '..0Ca0....0aC0..',
    '..0aa0....0aa0..',
    '..0CC0....0CC0..',
    '..000......000..',
    '................',
  ],
  warden: [
    '................',
    '..000000000000..',
    '..0zzzzzzzzzz0..',
    '..0zyyyyyyyyz0..',
    '.00zy0DDDD0yz00.',
    '.0zzy0DwwD0yzz0.',
    '.0zzy0DDDD0yzz0.',
    '.0zzyyyyyyyyzz0.',
    '00zzzyyyyyyzzz00',
    '0zzzzzyyyyzzzzz0',
    '0zz0zzzzzzzz0zz0',
    '0z0.0zz00zz0.0z0',
    '000..0z0.0z0..00',
    '.....0y0.0y0....',
    '.....0z0.0z0....',
    '.....000.000....',
  ],
  terminal: [
    '................',
    '................',
    '..0000000000....',
    '..0bbbbbbbb0....',
    '..0blllllll0....',
    '..0blnnnnnl0....',
    '..0blnooonl0....',
    '..0blnnnnnl0....',
    '..0blllllll0....',
    '..0bbbbbbbb0....',
    '..0cccccccc0....',
    '..0000000000....',
    '................',
    '................',
    '................',
    '................',
  ],
  lift: [
    '0000000000000000',
    '0aaaaaaaaaaaaaa0',
    '0abbbbbbbbbbbba0',
    '0ab00000000000a0',
    '0ab0llllllll00a0',
    '0ab0lmmmmmml0aa0',
    '0ab0lmnnnnml0aa0',
    '0ab0lmnoonml0aa0',
    '0ab0lmnnnnml0aa0',
    '0ab0lmmmmmml0aa0',
    '0ab0llllllll00a0',
    '0ab00000000000a0',
    '0abbbbbbbbbbbba0',
    '0aaaaaaaaaaaaaa0',
    '0aaaaaaaaaaaaaa0',
    '0000000000000000',
  ],
  graftchip: [
    '................',
    '................',
    '................',
    '................',
    '.....0000000....',
    '....0mmmmmmm0...',
    '....0mnnnnnm0...',
    '....0mnoooam0...',
    '....0mnnnnnm0...',
    '....0mmmmmmm0...',
    '.....0000000....',
    '......0.0.0.....',
    '................',
    '................',
    '................',
    '................',
  ],
  patchkit: [
    '................',
    '................',
    '................',
    '.....000000.....',
    '....0BBBBBB0....',
    '....0BCCCCB0....',
    '....0BCLLCB0....',
    '....0CLLLLC0....',
    '....0CLLLLC0....',
    '....0BCLLCB0....',
    '....0BCCCCB0....',
    '.....000000.....',
    '................',
    '................',
    '................',
    '................',
  ],
  powercell: [
    '................',
    '................',
    '................',
    '.......00.......',
    '.....000000.....',
    '.....0uuuu0.....',
    '.....0uvvu0.....',
    '.....0uvvu0.....',
    '.....0uwwu0.....',
    '.....0uvvu0.....',
    '.....0uuuu0.....',
    '.....000000.....',
    '................',
    '................',
    '................',
    '................',
  ],
  scrub: [
    '................',
    '................',
    '................',
    '......0000......',
    '.....0nnnn0.....',
    '....0nooooon0...',
    '....0no0.0on0...',
    '....0nooooon0...',
    '....0nnnnnnn0...',
    '.....0n0n0n0....',
    '......00000.....',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  emp: [
    '................',
    '................',
    '................',
    '.......00.......',
    '......0nn0......',
    '.....0nnnn0.....',
    '....0nnoonn0....',
    '....0noLLon0....',
    '....0nnoonn0....',
    '.....0nnnn0.....',
    '......0nn0......',
    '.......00.......',
    '................',
    '................',
    '................',
    '................',
  ],
  ampoule: [
    '................',
    '................',
    '................',
    '.......00.......',
    '.......0z0......',
    '......0zA0......',
    '......0zA0......',
    '.....0zzAA0.....',
    '.....0zAAA0.....',
    '.....0zzAA0.....',
    '.....000000.....',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  /**
   * Biosynth. FLESH ramp, never ACID — acid means *breachable* in this
   * palette, and a biosynth is the one thing in the game that isn't. They are
   * grown from the same stock we are, and they are meant to look it.
   * Identity comes from silhouette instead: low, long, four-legged, nothing
   * else in the roster stands like this.
   */
  stray: [
    '................',
    '................',
    '................',
    '..00............',
    '..0hh0..........',
    '..0hiih0........',
    '..0hLiLh00000...',
    '.0hiiiihiiiih0..',
    '.0hiiiiiiiiiih0.',
    '.0hjjiiiiiiiih0.',
    '..0hiiiiiiiih0..',
    '...h..h...h..h..',
    '...h..h...h..h..',
    '...0..0...0..0..',
    '................',
    '................',
  ],
  baffle: [
    '................',
    '................',
    '.......00.......',
    '......0jj0......',
    '.....0jkkj0.....',
    '....0jk00kj0....',
    '....0jk..kj0....',
    '....0jk00kj0....',
    '.....0jkkj0.....',
    '......0jj0......',
    '.......00.......',
    '.....0..0..0....',
    '....0..0..0.....',
    '................',
    '................',
    '................',
  ],
  corpse: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '...0BB0..0BB0...',
    '..0BgggBBgggB0..',
    '..0BggggggggB0..',
    '...0BBBBBBBB0...',
    '.....000000.....',
    '................',
  ],
};

export function drawSprite(
  g: CanvasRenderingContext2D,
  name: string,
  px: number,
  py: number,
  alpha = 1,
): void {
  const s = SPRITES[name];
  if (!s) return;
  g.globalAlpha = alpha;
  for (let r = 0; r < 16; r++) {
    const row = s[r];
    for (let c = 0; c < 16; c++) {
      const k = row[c];
      if (k === '.' || k === ' ') continue;
      const color = P[k];
      if (!color) continue;
      g.fillStyle = color;
      g.fillRect(px + c, py + r, 1, 1);
    }
  }
  g.globalAlpha = 1;
}

/**
 * Threat outline hugging the sprite silhouette. Dashed means the enemy has
 * seen you, solid means it hasn't — shape, not just hue, so the read survives
 * deuteranopia (ART-DIRECTION.md §1).
 */
export function drawOutline(
  g: CanvasRenderingContext2D,
  name: string,
  px: number,
  py: number,
  color: string,
  dashed: boolean,
): void {
  const s = SPRITES[name];
  if (!s) return;
  const solid = (r: number, c: number) =>
    r >= 0 && c >= 0 && r < 16 && c < 16 && s[r][c] !== '.' && s[r][c] !== ' ';
  g.fillStyle = color;
  for (let r = -1; r < 17; r++) {
    for (let c = -1; c < 17; c++) {
      if (solid(r, c)) continue;
      if (!(solid(r - 1, c) || solid(r + 1, c) || solid(r, c - 1) || solid(r, c + 1))) continue;
      if (dashed && ((r + c) >> 1) % 2) continue;
      g.fillRect(px + c, py + r, 1, 1);
    }
  }
}
