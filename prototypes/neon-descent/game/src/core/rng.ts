/**
 * Deterministic RNG (ARCHITECTURE.md §5).
 *
 * A run is a pure function of (seed, ordered player intents). That buys the
 * Daily Challenge, replayable bug reports and the balance harness — so every
 * random draw in the game comes from a named stream, never Math.random().
 */

/** xmur3 string hash — turns a seed string into 32-bit state words. */
function hashSeed(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** sfc32 — small, fast, good distribution, and trivially serializable. */
export class RNG {
  private a = 0;
  private b = 0;
  private c = 0;
  private d = 0;

  constructor(seed: string) {
    const h = hashSeed(seed);
    this.a = h();
    this.b = h();
    this.c = h();
    this.d = h();
    // Discard the first few draws; sfc32 correlates slightly right after seeding.
    for (let i = 0; i < 12; i++) this.next();
  }

  /** Uniform float in [0, 1). */
  next(): number {
    this.a >>>= 0; this.b >>>= 0; this.c >>>= 0; this.d >>>= 0;
    let t = (this.a + this.b) | 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) | 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.d = (this.d + 1) | 0;
    t = (t + this.d) | 0;
    this.c = (this.c + t) | 0;
    return (t >>> 0) / 4294967296;
  }

  /** Integer in [0, n). */
  int(n: number): number {
    return Math.floor(this.next() * n);
  }

  /** Integer in [lo, hi], inclusive both ends. */
  range(lo: number, hi: number): number {
    return lo + this.int(hi - lo + 1);
  }

  chance(p: number): boolean {
    return this.next() < p;
  }

  pick<T>(items: readonly T[]): T {
    return items[this.int(items.length)];
  }

  /** Weighted pick. `weights[i]` corresponds to `items[i]`. */
  pickWeighted<T>(items: readonly T[], weights: readonly number[]): T {
    let total = 0;
    for (const w of weights) total += w;
    let roll = this.next() * total;
    for (let i = 0; i < items.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  /** Full internal state, so a save resumes the exact sequence. */
  save(): number[] {
    return [this.a, this.b, this.c, this.d];
  }

  load(state: number[]): void {
    [this.a, this.b, this.c, this.d] = state;
  }
}

/**
 * Per-subsystem streams. A single global RNG would mean one changed combat
 * roll reshuffles every future map; named streams keep subsystems independent.
 */
export type StreamName = 'mapgen' | 'loot' | 'combat' | 'ai' | 'cosmetic';

export function streamFor(seed: string, name: StreamName, index = 0): RNG {
  return new RNG(`${seed}::${name}::${index}`);
}
