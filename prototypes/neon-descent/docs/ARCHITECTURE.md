# NEON DESCENT — Technical Architecture

**Version:** 0.1 (pre-prototype, for review)
**Stack:** TypeScript + HTML5 Canvas 2D + Vite → Capacitor → Android
**Companion docs:** [DESIGN.md](DESIGN.md), [ART-DIRECTION.md](ART-DIRECTION.md)

---

## 1. Why this stack

The game is turn-based, 16×16 sprites, and never has more than ~60 actors on screen. That
workload does not need a game engine. A hand-written canvas renderer costs less to ship
(no engine runtime in the APK), starts faster, and — the part that actually matters — lets the
**entire simulation be a pure TypeScript library with no rendering dependency**, which is what
makes the headless test harness in §7 possible.

Capacitor wraps the same build into an APK with a native shell, so one codebase serves browser
playtesting (fast iteration, shareable links) and the Android target.

**Rejected alternatives, briefly:** Godot 4 exports beautifully to Android but couples the sim
to the engine's node tree, and GDScript makes the headless balance harness harder. Kotlin +
LibGDX gives the best native performance headroom, which this game does not need, at the cost
of losing browser playtesting entirely.

**The one real risk:** WebView performance on low-end Android. Mitigated by §6 (the renderer
does almost no work per frame) and bounded by the renderer sitting behind an interface, so a
WebGL2 backend is a swap and not a rewrite.

---

## 2. Resolution and scaling

The core constraint of portrait pixel art: **integer scaling only.** Non-integer scaling
destroys pixel art, and there is no acceptable amount of it.

**Fixed logical width: 180 px.** Chosen because it divides every common Android width exactly:

| Device width | Scale | Rendered width | Waste |
| --- | --- | --- | --- |
| 720 px | ×4 | 720 | 0 |
| 1080 px | ×6 | 1080 | 0 |
| 1440 px | ×8 | 1440 | 0 |
| 1284 px (odd flagship) | ×7 | 1260 | 24 px, letterboxed |

**Variable logical height.** `logicalHeight = floor(deviceHeight / scale)`, giving ~320 on a
16:9 device and ~400 on a 20:9 device. Layout is anchored, not stretched:

```
┌──────────────────────────────┐  180 logical px wide
│  STATUS BAR            34 px │  HP · POWER · TRACE bar · floor · credits
├──────────────────────────────┤
│                              │
│  MAP VIEWPORT                │  11 tiles wide (176 px, 2 px margins)
│  11 × 13..15 tiles           │  13 rows minimum, capped at 15
│  208..240 px                 │
│                              │
├──────────────────────────────┤
│  MESSAGE LOG        22..40 px │  2 lines min; surplus height lands here
├──────────────────────────────┤
│  ACTION BAR            52 px │  5 slots + inventory, mirrorable L/R
└──────────────────────────────┘
```

**The viewport is capped at 15 rows on purpose.** A player on a 20:9 phone must not see more
of the map than a player on a 16:9 phone — that would make the Daily Challenge unfair and
would silently change encounter difficulty by device. Surplus vertical space goes to the log
and to safe-area padding, never to tiles.

Safe-area insets (notch, gesture bar) are applied as padding on the container element via
`env(safe-area-inset-*)`; the canvas letterboxes within whatever is left. Letterbox fill is
`#05030d`, the palette's void black, so the bars read as part of the art.

---

## 3. Module layout

```
src/
├── core/                    # No game knowledge. Pure, dependency-free.
│   ├── rng.ts               #   sfc32 + seed derivation, named streams (§5)
│   ├── grid.ts              #   Point, Rect, Direction8, bit-packed tile grids
│   ├── scheduler.ts         #   Energy-based turn queue
│   ├── entity.ts            #   id + component maps (an "ECS-lite", not a library)
│   └── events.ts            #   Typed sim → presentation event bus
│
├── sim/                     # The game. Pure TS. Imports no DOM API, ever.
│   ├── world.ts             #   Aggregate state; the single serializable root
│   ├── turn.ts              #   execute(Intent) → Event[]  (the one public entry point)
│   ├── fov.ts               #   Symmetric shadowcasting
│   ├── path.ts              #   A* + Dijkstra maps for AI
│   ├── combat.ts            #   Damage, armor, accuracy
│   ├── trace.ts             #   Trace accrual + escalation state machine
│   ├── chrome.ts            #   Slots, Instability tiers
│   ├── items.ts             #   Inventory, identification, use effects
│   ├── ai/                  #   One file per behavior tree; no per-enemy special cases
│   └── mapgen/              #   act1-caves.ts, act2-bsp.ts, act3-stack.ts, prefabs.ts, validate.ts
│
├── content/                 # Data, not code. Tables only, no logic.
│   ├── tiles.ts  actors.ts  weapons.ts  chrome.ts  quickhacks.ts  items.ts
│   └── prefabs/*.json
│
├── render/                  # Reads world state. Never mutates it.
│   ├── surface.ts           #   Offscreen logical-res canvas + integer blit
│   ├── atlas.ts             #   Texture atlas lookup
│   ├── camera.ts
│   ├── layers/              #   terrain (cached) · actors · effects · hud
│   └── fx.ts                #   Glow quads, shake, glitch, damage numbers
│
├── input/
│   ├── gestures.ts          #   Raw pointer → Gesture (swipe8 / tap / longpress / pinch)
│   ├── dpad.ts              #   Alternate source, emits identical Intents
│   └── intent.ts            #   Gesture + UI state → Intent
│
├── ui/                      # Panels: inventory, chrome install, vendor, pause, death
├── platform/                # storage.ts · haptics.ts · lifecycle.ts — the only Capacitor imports
└── main.ts                  # Composition root and frame loop
```

**The load-bearing rule of this whole design:** `sim/` and `core/` import nothing from
`render/`, `input/`, `ui/`, or `platform/`, and touch no browser global. Enforced by an ESLint
`no-restricted-imports` rule that fails the build, not by discipline. Everything in §7 depends
on this holding.

---

## 4. The turn pipeline

One direction of data flow, no exceptions:

```
 pointer event
      ↓  input/gestures.ts
 Gesture { kind: 'swipe', dir: NE }
      ↓  input/intent.ts   (consults UI mode: targeting? panel open?)
 Intent  { kind: 'move', dir: NE }
      ↓  sim/turn.ts       ← the ONLY mutation entry point in the codebase
 Event[] [ {moved}, {enemySpotted}, {traceThreshold, to:'HUNT'}, {damage} ]
      ↓  render + audio + haptics consume events
 animation queue drains; world state is already final
```

`execute(world, intent)` resolves the player's action, then runs the scheduler until the player
has energy again — so a single call may produce a whole round of enemy actions. It returns a
flat, ordered event list. **The world is fully updated before the first frame of animation
plays.** Animation is presentation only; it can be skipped, fast-forwarded, or disabled
entirely (reduced-motion setting) with zero effect on outcomes.

Corollary: tapping during an animation fast-forwards the queue instead of queuing an input.
Mis-taps on mobile are common and a queued input executed 400 ms later is how runs die to the
interface instead of the game.

**Auto-run** is a loop of `execute(world, {kind:'step-along-path'})` that halts on any of:
enemy entering FOV, HP loss, Trace threshold crossed, item underfoot, path blocked, or player
touch. Halt conditions are checked against the returned events — the same events the renderer
sees — so there is exactly one definition of "something interesting happened."

---

## 5. Determinism

The run is a pure function of `(seed, ordered list of player intents)`. This is worth real
engineering effort because it buys four things at once: the Daily Challenge, reproducible bug
reports (ship the seed + intent log, replay it locally), the balance harness in §7, and
save-scum resistance.

**Named RNG streams.** A single global RNG would mean that changing one combat roll reshuffles
every future map. Instead, each subsystem derives its own stream:

```ts
const rng = {
  mapgen : streamFor(seed, 'mapgen', floor),   // per-floor, so floor 7 is stable
  loot   : streamFor(seed, 'loot',   floor),
  combat : streamFor(seed, 'combat'),
  ai     : streamFor(seed, 'ai'),
  cosmetic: streamFor(seed, 'cosmetic'),       // never affects outcomes
};
```

Algorithm is sfc32 seeded by a hash of `(seed, streamName, index)`. `Math.random()` is banned
by lint rule — cosmetic effects use the cosmetic stream so that even glitch visuals replay
identically.

Every RNG stream's call count is part of the save file, so loading a save resumes the exact
sequence.

---

## 6. Rendering and battery

A turn-based game that runs a 60 Hz render loop while the player stares at a static screen
deciding their move is a battery bug. This one is **event-driven**:

- The frame loop runs only while `dirty || animations.length > 0 || tileAnimClock.due()`.
- Idle state redraws at **6 fps**, and only the neon-flicker layer's dirty rects — enough for
  ambient life, cheap enough to leave running.
- The terrain layer is drawn to a cached offscreen canvas and only redrawn when the explored
  set or lighting changes — typically once per player move, not per frame.
- Actors, effects and HUD draw per animating frame.
- Final present is one `drawImage` of the 180×N logical surface, integer-scaled, with
  `imageSmoothingEnabled = false`.

**Budgets** (Snapdragon 6-series class device, the target floor):

| Metric | Budget |
| --- | --- |
| Frame time while animating | < 8 ms (60 fps with headroom) |
| Turn resolution, typical | < 4 ms |
| Turn resolution, worst case (60 actors, full pathing) | < 16 ms |
| Cold start to playable | < 2 s |
| Memory | < 150 MB |
| APK | < 30 MB |
| JS bundle | < 200 KB gzipped |

The worst-case turn budget is the one that will bite. Mitigation: AI shares Dijkstra maps
(one flow field to the player per faction per turn, not one A* per actor), and off-screen
actors outside a 20-tile radius tick on a cheap approximate policy.

---

## 7. Testing

Because `sim/` is pure, the interesting tests need no browser.

**Unit (vitest).** FOV against hand-verified reference grids including the symmetry property
(`visible(a,b) === visible(b,a)` for every pair in 500 random maps). Pathfinding optimality.
Combat and Trace arithmetic. Instability tier transitions.

**Property/golden.** Mapgen over 10,000 seeds per act asserting: elevator reachable from
spawn, no orphaned regions, prefab placement never overlaps, guaranteed-item counts hold. This
is the test that prevents the single worst bug class in a roguelike — an unwinnable floor.

**Headless balance harness.** A scripted bot policy (greedy: fight if favorable, flee if not,
descend when Trace > 60) plays 1,000 runs nightly in CI and reports:

- depth-reached histogram and win rate
- death-cause distribution — if any one enemy causes >25% of deaths, that's a balance bug
- median turns per floor, and Trace state at descent
- chrome install rate and Instability distribution at death
- items that are never picked up (dead content) and items picked up >90% of the time (mandatory content, which means it isn't a choice)

Regressions in these distributions fail CI. This is how a one-person-scale project keeps a
roguelike balanced without a QA team.

**Shell smoke tests (Playwright).** Boot, start a run, make 20 moves, background/restore the
app, confirm the save round-trips. Small suite; it exists to catch integration breakage, not
game logic.

---

## 8. Persistence

| Data | Store | Frequency |
| --- | --- | --- |
| Active run (full world) | Capacitor Filesystem, one JSON file | **Every turn** |
| Meta-progression, settings | Capacitor Preferences | On change |
| Seed + intent log (replay) | Filesystem, appended | Every turn |

Full-state serialization every turn is unusual and deliberate — it is Pillar 4 (Interruptible)
made concrete. The world serializes to roughly 60–150 KB; writes are async and off the critical
path, debounced to the idle callback, with a **forced synchronous flush on `pause`,
`visibilitychange`, and the Android back button**. Those three moments are when phones actually
kill apps.

Saves are versioned with an explicit `schemaVersion` and a migration chain. A save that fails
to migrate is quarantined, not deleted, and the player is offered a fresh run rather than a
crash.

**No cloud save in v1.** Adding an account system to a single-player roguelike buys the player
almost nothing and buys the project a backend, a privacy policy, and a support burden.

---

## 9. Asset pipeline

Individual 16×16 PNGs → build script → single atlas PNG + JSON frame table. The build step
also runs a **palette linter** that fails the build if any sprite:

- uses a color outside the 36-color master palette (ART-DIRECTION.md §1), or
- uses more than 12 colors in a single 16×16 sprite, or
- lacks the mandated 1 px outline on an actor sprite.

Style consistency is the thing that dies first on a pixel-art project with more than one
contributor and no enforcement. This makes it a CI failure instead of a matter of taste.

Fonts are bitmap, not TTF: a 5×7 pixel font for the log and a 7×9 for headings, rendered from
the atlas, so text is pixel-exact at every integer scale.

---

## 10. Android shell

- `android:screenOrientation="portrait"` — portrait-locked, no rotation handling anywhere
- Immersive sticky fullscreen; system bars swipe-revealed
- **Back button:** cancel targeting → close top panel → pause menu. Never exits the app on the
  first press, never mid-turn
- `appStateChange` → flush save, pause animation clock, mute audio
- minSdk 26 (Android 8.0). Hardware acceleration on; WebView is a Chrome dependency, so no
  legacy WebView quirks below that line
- Permissions requested: **none**. No network, no storage, no analytics SDK in v1. A
  single-player offline roguelike has no honest reason to ask for anything, and shipping with
  an empty permission list is a feature worth advertising
- Haptics via the Capacitor Haptics plugin: light tick on hit, medium on Trace threshold
  crossing, heavy on death. Off by default in the settings for battery, discoverable in the
  first-run prompt

---

## 11. Build and CI

```
npm run dev        # Vite dev server, browser playtest at forced portrait aspect
npm run test       # vitest — sim unit + property tests
npm run balance    # headless 1,000-run harness, prints the §7 report
npm run atlas      # rebuild texture atlas + run the palette linter
npm run build      # typecheck, lint, test, bundle
npm run android    # cap sync && cap open android
```

CI on every push: typecheck → lint (including the layering and `Math.random` rules) → unit →
mapgen property tests → bundle-size check. Nightly: the balance harness, with the report
committed to a `balance/` directory so distribution drift is visible in the diff.

---

## 12. Sequencing

Roughly ordered by what unblocks the most downstream work. Each step ends at something
runnable — no step is "build the framework."

1. **Skeleton that moves.** Canvas surface, integer scaling, atlas loader, a hardcoded room, an
   @ that walks with swipes. Proves the resolution strategy on a real phone before anything
   depends on it.
2. **Turn engine + FOV.** Scheduler, shadowcasting, one dumb enemy that chases. The game is now
   a game.
3. **Mapgen Act I + descent.** Caves, prefabs, connectivity validation, elevator, 4 floors.
4. **Combat + items + inventory UI.** Melee, one gun, consumables, the portrait inventory panel.
5. **Trace.** The clock, the 5 states, the Hunter-Killer. *This is the earliest point the game
   is worth playtesting for fun rather than for bugs.*
6. **Chrome + Instability.** Install flow, 8 implants, tier effects.
7. **The Warden.** Boss encounter, floor-4 arena prefab.
8. **Save/restore, autosave, back-button handling, death → meta screen.** Closes the loop.
9. **Capacitor wrap, on-device profiling, first APK.**
10. **Balance harness + the tuning pass it enables.**

Steps 1–2 are where the unknowns are, and they are also cheap — which is the argument for
starting there rather than with content.
