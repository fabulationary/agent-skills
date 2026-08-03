# NEON DESCENT — Act I vertical slice

Playable prototype. TypeScript + canvas, no runtime dependencies, no external assets.

```bash
npm install
npm run dev        # http://localhost:5173 — resize the window narrow to see portrait
npm test           # 35 tests: FOV symmetry, mapgen properties, determinism, palette lint
npm run balance    # headless bot plays 250 runs and reports the distributions
npm run build      # typecheck + bundle (currently 20.9 KB gzipped)
```

## Controls

| Touch | Keyboard (desktop playtest) |
| --- | --- |
| Swipe (8-way) — move/attack | `WASD` + `QEZC`, or arrows |
| Tap a tile — path there and auto-run | — |
| Tap yourself — wait, or use the tile you're on | `.` wait, `>` descend |
| Long-press — inspect, costs no turn | — |
| Tap an action slot, then a target | — |
| Back / `Esc` — cancel targeting, close panel | `Esc` |

Standing on the elevator and tapping yourself descends. Standing on a terminal and
tapping yourself jacks in for POWER and a map fragment.

## What's implemented

- Energy-scheduler turn engine; enemy energy accrues relative to player speed, so speed grafts buy real turns
- Symmetric shadowcasting FOV, three-state fog (visible / remembered / unknown), actors never drawn in remembered tiles
- Act I cave generator, 4 floors, connectivity guaranteed by construction and verified by test
- Trace clock: all five states, escalating waves, the Hunter-Killer at PURGE
- Combat: melee, SMG with a Trace bill per shot, three spikes, flat armor
- Enemies: picker (flees and fetches friends), scrapper drone (explodes), grafted, turret, sec-drone, Hunter-Killer, and THE WARDEN in a pillared arena on floor 4
- Grafts: 12 implants across 6 slots, Instability tiers with the FRACTURE glitches wired to the renderer, and an install screen that states the consequence before you accept it
- Items: 6 kinds, unidentified graft chips and ampoules
- Portrait UI at 180px logical width, integer-scaled; autosave every turn; death → salvage → meta-progression
- Deterministic from `(seed, intents)`: named RNG streams, state in the save

Not in the slice: Acts II and III, cipher enemies, the Architect, audio, vendors, the Daily Challenge, three of the four archetypes.

## What the harness found

The balance harness is not decoration — it found three real bugs during the build.

1. **A* disagreed with the turn pipeline.** `findPath` exempted the goal tile from the
   diagonal corner-cutting rule, so it could return a first step `execute` legally
   refuses. Refused moves cost no turn, so the caller retried forever: a silent
   soft-lock on tap-to-path, and an infinite loop in the harness that masqueraded as a
   "timeout". Fixed, and locked down by a test asserting every returned path is
   walkable step-by-step under the pipeline's own rules.
2. **Targeting used a second line-of-sight implementation.** Shooting and hacking ran
   Bresenham while vision ran shadowcasting; where they disagreed, an enemy you could
   plainly see refused to be shot, and burned no turn doing it. Targeting now reads the
   player's own FOV.
3. **The Hunter-Killer could not be outrun.** At speed 120 against the player's 100 it
   always closed, contradicting the design's promise that you can run for the elevator.
   It caused 60% of all deaths. At speed 100 it never closes while you keep moving and
   takes back every turn you spend on anything else.

Current report (250 runs, greedy bot):

```
DEPTH REACHED                        CAUSE OF DEATH
  SUB-02   41  ########               GRAFTED          32.8%  <-- over 25%
  SUB-03  166  #####################  SCRAPPER DRONE   18.4%
  SUB-04   43  #########              SEC-DRONE        13.2%
                                      PICKER           13.2%
  win rate 4.0%                       SEC TURRET        9.6%
  median turns/run 153                THE WARDEN        8.8%
  median trace at descent 74          extracted         4.0%
```

**The Grafted are still over the 25% line** (down from 42% after a speed and damage cut).
The caveat matters: this bot melees everything adjacent and never uses a spike or
retreats, so the fastest melee enemy in the game will over-index against it. Whether
32.8% is a real balance problem or a bot artifact is a question for human playtest data,
not further blind tuning.

## Layout

```
src/core/     rng (named streams), grid, swipe cones
src/sim/      world, turn pipeline, fov, path, mapgen, combat, ai, trace, grafts
src/content/  actor / item / grafts / spike tables — data, no logic
src/render/   palette, 5x7 bitmap font, inline sprites, layout, scene, hud
src/input/    gesture recognizer (tunable cone, 4-way fallback, reversal telemetry)
src/platform/ storage — swap for Capacitor Filesystem on Android
tools/        headless balance harness
```

`sim/` and `core/` import no browser global. That constraint is what makes the harness
and the tests possible, and it is the first thing to protect when extending this.
