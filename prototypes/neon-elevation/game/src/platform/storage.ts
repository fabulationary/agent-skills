/**
 * Persistence (ARCHITECTURE.md §8).
 *
 * The run autosaves every single turn. That is unusual and deliberate — it is
 * the Interruptible pillar made concrete: a phone call, a subway stop or a
 * dead battery must never cost a run. Writes are debounced to idle and force
 * -flushed on pause/visibilitychange, which are the moments phones actually
 * kill apps.
 *
 * On Android this swaps to Capacitor Filesystem for the run and Preferences
 * for settings; the interface is the same, which is the point of the split.
 */

const RUN_KEY = 'neon-elevation/run/v1';
const META_KEY = 'neon-elevation/meta/v1';
const SETTINGS_KEY = 'neon-elevation/settings/v1';

export interface MetaProgress {
  bestFloor: number;
  totalSalvage: number;
  runs: number;
  wins: number;
}

export interface Settings {
  reducedMotion: boolean;
  haptics: boolean;
  leftHanded: boolean;
  fourWaySwipe: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  reducedMotion: false,
  haptics: true,
  leftHanded: false,
  fourWaySwipe: false,
};

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // private mode, quota, or no storage at all — never fatal
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* a failed save must never break the game loop */
  }
}

let pending: string | null = null;
let scheduled = false;

/** Debounced to idle; call `flushRun` on pause to force the write out. */
export function saveRun(serialized: string): void {
  pending = serialized;
  if (scheduled) return;
  scheduled = true;
  const run = () => {
    scheduled = false;
    if (pending !== null) {
      write(RUN_KEY, pending);
      pending = null;
    }
  };
  if (typeof requestIdleCallback === 'function') requestIdleCallback(run, { timeout: 500 });
  else setTimeout(run, 0);
}

export function flushRun(): void {
  if (pending !== null) {
    write(RUN_KEY, pending);
    pending = null;
  }
}

export function loadRun(): string | null {
  return read(RUN_KEY);
}

export function clearRun(): void {
  pending = null;
  try {
    localStorage.removeItem(RUN_KEY);
  } catch {
    /* ignore */
  }
}

export function loadMeta(): MetaProgress {
  const raw = read(META_KEY);
  if (!raw) return { bestFloor: 0, totalSalvage: 0, runs: 0, wins: 0 };
  try {
    return { bestFloor: 0, totalSalvage: 0, runs: 0, wins: 0, ...JSON.parse(raw) };
  } catch {
    return { bestFloor: 0, totalSalvage: 0, runs: 0, wins: 0 };
  }
}

export function saveMeta(meta: MetaProgress): void {
  write(META_KEY, JSON.stringify(meta));
}

export function loadSettings(): Settings {
  const raw = read(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  write(SETTINGS_KEY, JSON.stringify(settings));
}
