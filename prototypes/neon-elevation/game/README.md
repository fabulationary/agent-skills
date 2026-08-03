# NEON ELEVATION — Act I vertical slice

Playable prototype. TypeScript + canvas, no runtime dependencies, no external assets.

```bash
npm install
npm run dev        # http://localhost:5173 — resize the window narrow to see portrait
npm test           # 49 tests: FOV symmetry, mapgen properties, determinism, the family and subversion rules, palette lint
npm run balance    # headless bot plays 250 runs and reports the distributions
npm run build      # typecheck + bundle (currently 21.5 KB gzipped)
```

## Controls

| Touch | Keyboard (desktop playtest) |
| --- | --- |
| Swipe (8-way) — move/attack | `WASD` + `QEZC`, or arrows |
| Tap a tile — path there and auto-run | — |
| Tap yourself — wait, or use the tile you're on | `.` wait, `>` ascend |
| Long-press — inspect, costs no turn | — |
| Tap an action slot, then a target | — |
| Back / `Esc` — cancel targeting, close panel | `Esc` |

Standing on the lift and tapping yourself ascends. Standing on a terminal and
tapping yourself jacks in for POWER and a map fragment.

## What's implemented

- Energy-scheduler turn engine; enemy energy accrues relative to player speed, so speed grafts buy real turns
- Symmetric shadowcasting FOV, three-state fog (visible / remembered / unknown), actors never drawn in remembered tiles
- Act I freight-yard generator, 4 tiers, connectivity guaranteed by construction and verified by test
- Trace clock: all five states, escalating waves, the Hunter-Killer at PURGE
- Combat: melee, SMG with a Trace bill per shot, three spikes, flat armor
- **The family rule** (DESIGN.md §6.5): machines are spikeable, EMP-able, leak Trace when killed, and lose you when you break line of sight. Biosynths are none of those — they track by scent through walls and never forget, and only a Scent Baffle sheds them
- **Subversion** (DESIGN.md §6.6, `sim/suborn.ts`): Nirvana's machines were always there and never stop working — but the biosynths have been getting into them, at a rate that climbs from 20% to 85% across Act III. A suborned machine is fed your position by anything with your scent (so cover stops paying), costs 55% instead of 85% to spike, and reverts the moment the last biosynth on the tier dies. Implemented and tested; not reachable by play in the Act I slice
- Enemies: picker (flees and fetches friends), dock drone (explodes), grafted, dock turret, **stray** (the Act I biosynth, and the whole Act III reveal placed eight tiers early), sec-drone, Hunter-Killer, and THE WARDEN in a gantried loading bay on tier 4
- Grafts: 12 implants across 6 slots, Instability tiers with the FRACTURE glitches wired to the renderer, and an install screen that states the consequence before you accept it
- Items: 7 kinds including the Scent Baffle, unidentified graft chips and ampoules
- Portrait UI at 180px logical width, integer-scaled; autosave every turn; death → salvage → meta-progression
- Deterministic from `(seed, intents)`: named RNG streams, state in the save

Not in the slice: Acts II (the Climb) and III (Nirvana), the Stevedore, the Firstborn, the full biosynth roster, audio, vendors, the Daily Challenge, three of the four archetypes.

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
   always closed, contradicting the design's promise that you can run for the lift.
   It caused 60% of all deaths. At speed 100 it never closes while you keep moving and
   takes back every turn you spend on anything else.

Current report (250 runs, greedy bot):

```
TIER REACHED                         CAUSE OF DEATH
  TIER 02   18  ####                  GRAFTED          25.2%  <-- at the line
  TIER 03  152  #####################  THE WARDEN      18.0%
  TIER 04   80  ##################     SEC-DRONE       15.2%
                                       PICKER           9.6%
  win rate 7.6%                        DOCK DRONE       9.6%
  median turns/run 169                 STRAY            8.0%
  median trace at ascent 72            extracted        7.6%
                                       DOCK TURRET      6.8%
```

**Adding the Stray fixed the concentration problem on its own.** Grafted went from 32.8% of
deaths to 25.2% and the win rate nearly doubled (4.0% → 7.6%) without touching a single stat —
because a threat that answers to none of the player's machine-facing tools spreads the pressure
that one fast melee enemy used to carry alone. That is the family rule paying for itself in the
distribution, not just in the fiction.

Grafted is now exactly at the 25% line rather than well past it. Left there deliberately: the
bot still melees everything adjacent and never uses a spike, a baffle or a retreat, so the
fastest melee enemy will always over-index against it. Whether the remaining margin is real is a
human-playtest question.

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
