# NEON ELEVATION — Act I vertical slice

Playable prototype. TypeScript + canvas, no runtime dependencies, no external assets.

```bash
npm install
npm run dev        # http://localhost:5173 — resize the window narrow to see portrait
npm test           # 53 tests: FOV symmetry, mapgen properties, determinism, the family and subversion rules, palette lint
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
| Long-press the action bar — reopen the legend | `?` or `H` |

Standing on the lift and tapping yourself ascends. Standing on a terminal and
tapping yourself jacks in for POWER and a map fragment.

## What's implemented

- Energy-scheduler turn engine; enemy energy accrues relative to player speed, so speed grafts buy real turns
- Symmetric shadowcasting FOV, three-state fog (visible / remembered / unknown), actors never drawn in remembered tiles
- Act I freight-yard generator: Rogue-style rooms and corridors over a 3x3 sector grid, 4 tiers, connectivity guaranteed by a spanning tree and verified by flood fill over 1,200 generated floors
- Start-screen legend showing every sprite in the game, labelled, with the machine/grown rule stated in words — the one place it is
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
  TIER 02    3  #                     THE WARDEN       36.8%  (boss)
  TIER 03  100  ##################    GRAFTED          21.2%
  TIER 04  136  ########################  SEC-DRONE    12.4%
                                      DOCK TURRET       7.6%
  win rate 6.8%                       extracted         6.8%
  median turns/run 218                DOCK DRONE        6.0%
  median trace at ascent 74           PICKER            4.8%
                                      STRAY             3.6%
BOSS
  reached tier 4   136
  beat the Warden   17  (12.5% of arrivals)
```

No regular enemy is over the 25% line. The Warden is exempt from that rule and
measured separately — a final boss on the last tier of the slice concentrates deaths by
construction, since every run that arrives either beats it or dies to it. The number that
actually matters for a boss is the 12.5% arrival win rate, achieved by a bot that never
kites, never conserves ammo and melees everything adjacent.

Three tuning passes got here, each driven by a measurement rather than a hunch:

- **Grafted 130 → 115 speed, 5–9 → 4–8 damage.** It caused 42% of all deaths.
- **Adding the Stray** took Grafted from 32.8% to 25.2% with no further stat change —
  a threat that answers to none of the machine-facing tools spreads pressure that one fast
  melee enemy used to carry alone.
- **Warden armor 5 → 2, HP 130 → 100.** Armor 5 against a 6–11 starting weapon meant melee
  landed 3.5 a hit: 38 turns to kill while it killed you in 9. A player out of SMG rounds
  could not win at all. That was never "use the terrain", it was a dead verb — and the
  room-and-corridor generator is what finally made it visible, because the old caves gave
  enough open space to avoid finding out.

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
