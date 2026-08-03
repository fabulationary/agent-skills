# NEON DESCENT — Game Design Document

**Version:** 0.1 (pre-prototype, for review)
**Platform:** Android phone, portrait-locked
**Genre:** Traditional turn-based roguelike, cyberpunk, 16-bit pixel art
**Target run length:** 30–45 minutes
**Status:** Design under review. No code written yet.

---

## 1. Pitch

You are a runner jacked into the Kessel Stack — a 400-storey corporate arcology whose lower
levels have been abandoned to the scavengers and whose upper levels have been abandoned to
something worse. You go **down**. Twelve floors. Every floor you spend a turn on, the corp's
intrusion countermeasures get closer to finding you.

Bring back what's in the Core, or don't come back.

**The one-line hook:** a tactical turn-based roguelike where the hunger clock is a *police
response timer*, and your character build is the chrome you bolt into your own body — chrome
that makes you stronger and slowly stops being yours.

---

## 2. Design pillars

Four pillars. Every feature must serve at least one; anything serving none gets cut.

| Pillar | Meaning | What it rules out |
| --- | --- | --- |
| **Pressure, not grind** | Standing still is always the losing move. The Trace clock guarantees it. | Farming floors, safe corners, attrition-by-patience |
| **Chrome is a Faustian bargain** | Every power upgrade carries a permanent cost you accept knowingly | Pure stat-stick upgrades, unambiguously-good loot |
| **Legible at arm's length** | Readable on a 6" screen held one-handed, in one glance | Dense stat readouts, tiny fonts, fiddly targeting |
| **Interruptible** | A run survives a phone call, a subway stop, a dead battery | Real-time pressure, unsaved progress, long unskippable sequences |

Pillar 4 is a *mobile* pillar and it drives more than it looks like: it's why the game is
turn-based, why it autosaves every single turn, and why runs are 12 floors instead of 26.

---

## 3. Core loop

```
   ┌─────────────────────────────────────────────────┐
   │  Enter floor  →  Trace timer starts at 0        │
   │        ↓                                        │
   │  Explore in the dark (FOV, optics, sound)       │
   │        ↓                                        │
   │  Spend turns: fight / hack / sneak / loot       │
   │        ↑                     ↓                  │
   │        │        Trace rises with every turn     │
   │        │        and every noisy action          │
   │        │                     ↓                  │
   │        └──── Escalation waves spawn ────────────┤
   │                              ↓                  │
   │  Find the elevator / breach shaft  →  DESCEND   │
   │        ↓                                        │
   │  Trace decays 60%. Floor theme escalates.       │
   └─────────────────────────────────────────────────┘
                          ↓
              Die  →  extract Salvaged Data  →  meta-unlocks
              Win  →  extract more of it     →  meta-unlocks
```

The moment-to-moment decision the game keeps asking is: **"is this room worth the turns?"**
Every side room is loot the run needs and Trace the run can't afford. That single tension is
the game.

---

## 4. Setting

**The Kessel Stack, Night City–adjacent sprawl, 2094.** A vertical arcology that Kessel-Ohara
Biotech built as a self-contained city and then partially abandoned after an incident on the
Core levels nobody has published a report about. The lower floors flooded with squatters,
scavengers and chrome-addicts. The corporate floors are still climate-controlled, still lit,
still patrolled by security that was never told the building was evacuated. The Core is still
running whatever it was running.

You enter at the top of the abandoned zone and go down. Down is where the value is.

Tone: grimy, neon-lit, wet concrete, dead advertising still cycling on cracked screens. Not
comedic. Not grimdark-nihilist either — the runners have a code, a fixer who worries about
them, and a bar to come back to.

**Narrative delivery is diegetic and skippable:** environmental storytelling in tile detail,
recovered audio logs as 2-line message-log entries, one short fixer conversation between
acts. No cutscenes. No unskippable text. (Pillar 4.)

---

## 5. Structure

Twelve floors, three acts of four. Boss on the last floor of each act.

| Act | Floors | Zone | Palette shift | Threat identity |
| --- | --- | --- | --- | --- |
| **I — The Undercroft** | 1–4 | Flooded service levels, squats, scav camps | Sodium orange, rust, dark | Human scavengers, improvised weapons, junk drones. Chaotic, weak, numerous |
| **II — The Arcology** | 5–8 | Corporate floors, offices, labs, atria | Clean cyan, white, glass | Trained security. Coordinated. Netrunners who hack *you*. Cameras that raise Trace |
| **III — The Core** | 9–12 | Datastack, server cathedrals, the incident zone | Acid green, void black, magenta | Black ICE constructs, daemons, things wearing dead runners |

**Bosses**

- **Floor 4 — THE WARDEN.** A scav boss in a stolen loader exosuit. Teaches: use the terrain,
  he's too big for the side corridors.
- **Floor 8 — PRAETOR.** Corporate quadruped mech with a netrunner riding it. Teaches: kill the
  support first, or the mech never stops getting buffed.
- **Floor 12 — THE ARCHITECT.** The thing in the Core. Fights you through the floor itself —
  possessing dead enemies, rewriting the room layout, quickhacking your own chrome against you.
  Teaches: everything.

Between acts: a **Safehouse floor** (a squatted maintenance bay with a black-market vendor).
No enemies, no Trace. Spend credits, install chrome, sell junk, save-and-quit cleanly. This is
also the natural "put the phone down" point, which is why it exists at all (Pillar 4).

---

## 6. Systems

### 6.1 Turn engine — energy scheduler

Not lockstep. Each actor has a `speed` (energy gained per tick); acting costs energy by action
type. This gives free, cheap variation: a scav runs at 150 speed, a loader mech at 60, and
"fast" / "slowed" statuses are one number.

| Action | Energy cost |
| --- | --- |
| Move one tile | 100 |
| Melee attack | 100 |
| Fire ranged | 100 (some weapons 150) |
| Quickhack | 100 |
| Use item | 100 |
| Wait | 100 |
| Swap weapon | 50 |
| Pick up | 50 |

Everything is 100 by default so that the *default* mental model is "one turn = one action" and
the exceptions are the interesting part.

### 6.2 Movement and grid

**8-directional movement** on a square grid. Diagonals cost the same as orthogonals (no
√2 pricing — it's a tactics game, not a simulation, and touch input makes precise diagonal
economy unfun). Diagonal movement through a diagonal gap between two walls is **not** allowed;
you can't squeeze through corners. Standard, readable, prevents a lot of degenerate kiting.

### 6.3 Vision — FOV and optics

Symmetric shadowcasting. If you can see it, it can see you — this is a *rule the player can
rely on*, which matters more than realism.

Vision is where cyberware first bites. Base human sight radius is 7 tiles, reduced to 3 in
unlit areas. Optic implants rewrite this:

- **Lowlight Optics** — no darkness penalty. The safe, boring, correct first pickup.
- **Thermal Rig** — see living actors through walls at radius 5, but *drones and ICE are
  invisible to it* and your normal sight drops to 5. Excellent in Act I, actively dangerous in
  Act III.
- **Kiroshi Mk4** — +3 sight, highlights loot through walls, and shows enemy intent arrows.
  Raises Trace passively (it's a networked implant, it phones home).
- **Deadeye Targeting** — ranged attacks ignore the accuracy falloff, but the HUD overlay
  costs you the ability to see the message log while it's active.

That last one is a deliberate example of the design's favorite move: **the cost is expressed
in interface, not in a stat.**

### 6.4 Trace — the clock

Replaces the hunger clock. A per-floor meter, 0–100, shown as a thin bar across the top of the
screen that changes color and eventually pulses.

**Trace rises from:**

| Source | Trace |
| --- | --- |
| Every turn elapsed | +0.4 |
| Firing a loud weapon | +2 |
| Killing a networked enemy (bots, corp sec) | +3 |
| Being seen by a camera (per turn) | +5 |
| Failing a quickhack | +6 |
| Forcing a locked door | +4 |
| Networked implants (passive) | +0.2/turn each |

**Trace falls from:** breaking line of sight to cameras (nothing else, on-floor). Descending a
floor removes 60% of accumulated Trace. Certain rare consumables ("Ghost Shunt") zero it.

**Escalation thresholds:**

| Trace | State | Effect |
| --- | --- | --- |
| 0–24 | **CLEAR** | Nothing. Enemies use their idle patrols |
| 25–49 | **ALERT** | Enemies patrol toward your last known position. +1 wandering spawn |
| 50–74 | **HUNT** | Sec-drone wave spawns at the floor's entry point every 20 turns. Doors lock behind you |
| 75–94 | **LOCKDOWN** | Turrets activate. Enemy accuracy +25%. Elevator requires a hack to call |
| 95–100 | **PURGE** | A **Hunter-Killer** spawns and pathfinds to you, permanently, ignoring walls it can cut through. It is not meant to be fought at level. It is meant to make you leave |

The Hunter-Killer is the design's actual teeth. It's not a fail state — you *can* outrun it to
the elevator — but it converts "I'll just clear one more room" into a real gamble.

### 6.5 Resources

Four, deliberately few:

- **INTEGRITY (HP).** Meat and chrome. Recovers only from medkits, trauma stims, and the
  Safehouse. No passive regen — passive regen and a doom clock are contradictory designs.
- **POWER.** Battery for cyberware and quickhacks. 0–100. Recharges by jacking into wall
  terminals (costs turns + Trace), from power cells, and 25% on descent.
- **TRACE.** §6.4.
- **CREDITS.** Spent only at Safehouse vendors and black-market terminals. Deliberately *not*
  a mid-floor resource, so picking up cash is never a tactical decision — it's just a reward.

### 6.6 Chrome — the build system

Six slots. This is the primary progression axis and the primary source of interesting decisions.

| Slot | Examples |
| --- | --- |
| **Neural** | Sandevistan (spend 30 POWER: take 3 turns in a row), Kerenzikov (free counterattack), Bandwidth Amp (+2 quickhack slots) |
| **Optic** | §6.3 |
| **Arm** | Monowire (melee, hits all adjacent), Gorilla Servos (+damage, force doors free), Projectile Launcher |
| **Torso** | Subdermal Plate (+armor, −speed), Blood Pump (heal on kill), Second Heart (one free death per run) |
| **Legs** | Reflex Tendons (+50 speed), Charge Legs (dash 3 tiles), Mag-Boots (immune to knockback and floor hazards) |
| **Skin** | Optical Camo (invisible while not attacking, drains POWER), Thermal Weave (fire resist), Dermal Sensors (see adjacent through walls) |

**The cost mechanic — INSTABILITY.** Every installed piece of chrome adds Instability (2–8
points depending on power). Installation itself costs 15 INTEGRITY (field surgery) and 10 Trace.

| Instability | Effect |
| --- | --- |
| 0–19 | Clean |
| 20–39 | **Static.** Occasional 1-turn HUD glitch: the map briefly renders as garbage |
| 40–59 | **Dissonance.** 5%/turn chance a quickhack targets a random actor instead. +10% damage dealt |
| 60–79 | **Fracture.** Enemies sometimes render as friendly and vice versa. +25% damage dealt. Melee attacks can hit through walls |
| 80–100 | **CYBERPSYCHOSIS.** +50% damage. You cannot voluntarily descend. The only exit is killing everything on the floor. Death here means the run does not extract Salvaged Data |

This is the second pillar made mechanical: the strongest builds in the game are the ones that
are visibly consuming the player character, and the game shows it by *lying to the player's
interface*. Chrome can be uninstalled at the Safehouse for credits, which is the pressure
valve — Act II's Safehouse is where players choose whether to walk it back before the Core.

### 6.7 Combat

Three verbs, all viable as a primary:

**Melee.** Deterministic damage in a small range, no accuracy roll. Reliable, free, and the
only verb that costs nothing but positioning. Cheap in Trace (silent).

**Ranged.** Accuracy falls off with distance and rises if the target is unaware. Ammo is
scarce and type-specific. Loud: +2 Trace per shot. The damage is real but the Trace bill is
what balances it.

**Quickhacks.** Costs POWER, requires line of sight, no ammo, silent-ish (+0 Trace on success,
+6 on fail). Success chance scales with your Bandwidth stat vs the target's Firewall. Drones
and corp sec are hackable; feral humans and Act III entities largely aren't — so a pure
netrunner build has *floors where it doesn't work*, which is the point.

| Quickhack | POWER | Effect |
| --- | --- | --- |
| Overheat | 15 | DoT, 4 turns. Cheap workhorse |
| Blind Optics | 20 | Target's sight radius → 1 for 6 turns |
| System Lock | 30 | Target cannot act for 3 turns |
| Suicide Protocol | 45 | Drone/bot attacks its own allies for 5 turns, then dies |
| Ping | 5 | Reveal all networked actors on the floor for 1 turn. +4 Trace |
| Blackwall Whisper | 60 | Act III only. Instantly kills one non-boss. Adds 10 Instability |

**Armor** subtracts flat damage (not a %). Flat armor is legible at a glance and makes small
attacks meaningfully worthless, which pushes build diversity.

### 6.8 Items and economy

Standard roguelike unidentified-item tension, reskinned: **chips are unlabeled**. A found
combat stim might be a heal or might be a hallucinogen. Identify by using it, by paying a
vendor, or by reading a corp datapad that documents one chip type per pickup.

Consumables: Trauma Kit, Combat Stim, Power Cell, Ghost Shunt (zero Trace), EMP Grenade,
Smoke (breaks LOS), Ripper Charge (blow a hole in a wall — mobility and escape).

Weapons carry **one modifier** at most, not a stack of affixes. "Kessel-Ohara Shock Baton
(Stun)" is a whole item. Deep affix systems don't survive on a 6" screen.

### 6.9 Level generation

Per-act generators, not one generator with a reskin:

- **Act I — Caves + squats.** Cellular-automata flooded caverns bridged to hand-authored
  prefab squat rooms. Organic, open, ambush-prone.
- **Act II — Corporate floorplan.** BSP office subdivision: long sightlines down corridors,
  glass walls that permit vision but not movement, security checkpoints as chokepoints.
  Cameras are placed on corridor junctions on purpose.
- **Act III — The Datastack.** A dense grid of server aisles, with **layout that changes**:
  every ~30 turns the Architect rotates a section of the floor. The map you memorized stops
  being true.

Every floor guarantees: 1 elevator, 1 terminal (POWER + a floor map fragment), 2–4 loot rooms,
1 optional high-risk vault (locked, loud to force, good chrome inside). Guaranteed
connectivity is verified by a flood fill at generation time; a floor that fails regenerates.

### 6.10 Enemy roster (vertical-slice subset)

| Enemy | Act | Behavior identity |
| --- | --- | --- |
| Scav | I | Melee, cowardly — flees below 30% HP and *fetches friends* |
| Scrapper Drone | I | Fast, weak, hackable. Explodes on death (teaches positioning) |
| Chrome-head | I | Fast melee, ignores pain, never flees. Not hackable |
| Turret | I–III | Immobile, long range, activates at HUNT+. Purely a Trace consequence |
| Camera | II | Harmless. Raises Trace 5/turn while it sees you. The most hated enemy in the game |
| Corp Sec | II | Ranged, takes cover, calls for backup, retreats to chokepoints |
| Netrunner | II | Quickhacks *you*: drains POWER, locks your systems, raises your Instability |
| Mech Dog | II | Fast, flanks, pack AI — genuinely coordinates with other dogs |
| Black ICE | III | Only visible while it acts. Immune to hacking. Damages POWER not HP |
| Daemon | III | Possesses corpses on the floor. Killing the body doesn't kill it |

### 6.11 Between runs — meta-progression

Death is not a total loss but it is a real one. You extract **Salvaged Data** proportional to
depth reached and Core objectives completed. Spend it at your fixer's bar on:

- **Runner archetypes** (starting loadouts): Solo (start with quality melee + armor) →
  Netrunner (start with 3 quickhacks, low HP) → Techie (deployable turret, drone ally) →
  Fixer (start with credits, vendors always in stock, better prices)
- **Pool injection:** permanently add a chip/weapon to the global drop table
- **Quality of life:** an extra inventory row, a second Safehouse, starting POWER

**Hard cap on power creep:** meta-progression never grants raw stats. It grants *options*.
A veteran account has more interesting runs, not easier ones.

**Daily Challenge:** a fixed seed, same for every player, one attempt. The RNG is fully
seed-deterministic (see ARCHITECTURE.md §5), so this costs almost nothing to build and gives
the game its long tail.

---

## 7. Controls and portrait UX

See ART-DIRECTION.md §2 for the pixel-exact layout. The input grammar:

| Gesture | Action |
| --- | --- |
| **Swipe** (8-way, 45° cones, 24px dead zone) | Move one tile that direction. Into an enemy = attack |
| **Tap a walkable tile** | A* path there, auto-run. Interrupts on: enemy entering view, HP loss, Trace threshold crossed, item stepped on |
| **Tap a visible enemy** | Attack with equipped weapon if in range; otherwise path to it |
| **Tap self** | Wait one turn |
| **Long-press anything** | Inspect: name, HP, threat rating, description. Free — costs no turn |
| **Two-finger tap** | Toggle full inventory |
| **Action bar slot tap** | Use that quickhack/consumable. Tap again on a target to confirm |
| **Android back button** | Cancel targeting → close panel → pause menu. Never exits the app directly |

Design notes on this grammar:

- **Nothing requires two hands.** Every gesture is thumb-reachable from a one-handed grip. The
  action bar sits at the bottom because that's where the thumb is, and it has a
  **left/right-handed mirror toggle**.
- **Auto-run is the pacing tool.** Traditional roguelikes are turn-dense; on mobile, tapping
  400 times a run is intolerable. Tap-to-path collapses the boring turns and hands control
  back the instant anything interesting happens.
- **Confirm-on-target for anything expensive.** Quickhacks and thrown items are two-tap
  (select, then target) with a visible range overlay. Melee/move is one gesture. Never let a
  mis-swipe spend 45 POWER.
- **Undo does not exist.** But **every turn autosaves**, so a crash, a call, or a dead battery
  never costs the run.

**Accessibility (v1, not deferred):**

- Optional on-screen D-pad + action buttons (the choice the user deferred is a *setting*,
  not a fork — the swipe layer and the D-pad both emit the same intent events)
- Colorblind-safe mode: threat state is encoded by *shape and outline*, never color alone
- Text size: three steps, affecting the log and all panels
- Haptics toggle; reduced-motion toggle (kills screen shake, CRT wobble, glitch effects)
- No timed inputs anywhere in the game, including the Architect fight

---

## 8. Art direction summary

Full spec in ART-DIRECTION.md. The short version: **16×16 tiles, 36-color master palette,
strict per-sprite color budget of 12**, SNES-era discipline — flat fills, hand-placed dither
for gradients, one-pixel dark outline on all actors so they never get lost against a busy
floor. Lighting is faked with additive neon glow quads, not a real light system.

The single most important art rule: **actors must be identifiable in silhouette at 1× scale.**
Everything else is negotiable.

---

## 9. Audio

Dark synthwave; adaptive by Trace state. CLEAR is sparse pads and room tone; ALERT adds a
pulse; HUNT adds percussion; PURGE strips the music down to a single alarm tone and your own
footsteps. The player should be able to hear the Trace meter without looking at it.

SFX are short, crunchy, 22kHz — deliberately lo-fi to match the pixel art. Every sound has a
duck-on-repeat rule so a 6-enemy turn doesn't produce 6 overlapping gunshots.

Everything is off if the phone is muted, and the game is **fully playable with no audio** —
there is no information conveyed by sound alone.

---

## 10. Scope: what the vertical slice is

The next milestone after this document is approved. **Act I only, and all of it:**

- [ ] Energy-scheduler turn engine, 8-dir movement, symmetric shadowcasting FOV
- [ ] Act I generator (caves + squat prefabs), 4 floors, guaranteed-connectivity validation
- [ ] Trace clock with all 5 escalation states including the Hunter-Killer
- [ ] Combat: melee + one ranged weapon + three quickhacks, flat armor
- [ ] 4 enemies: Scav, Scrapper Drone, Chrome-head, Turret
- [ ] Chrome: 6 slots, 8 implants, Instability up to the Fracture tier
- [ ] Items: 6 consumables, unidentified chips, 4 weapons
- [ ] THE WARDEN boss on floor 4
- [ ] Full portrait UI, swipe + tap-to-path, autosave every turn
- [ ] Death → Salvaged Data → one meta-unlock, to prove the loop closes

**Explicitly out of the vertical slice:** Acts II and III, netrunner enemies, the Architect,
audio, the Daily Challenge, all four archetypes (slice ships Solo only).

Success criterion for the slice — one sentence: *a player who has never seen the game can pick
up the phone, understand within 90 seconds that standing still is what kills them, and lose a
run to the Hunter-Killer wanting to try again.*

---

## 11. Risks and open questions

Flagged for review. My recommendation is given in each case, but these are the calls worth
overruling.

1. **Instability lying to the player's UI is the riskiest idea in this document.** Rendering
   enemies as friendly is, viewed uncharitably, a bug generator and a frustration engine.
   *Recommendation:* keep it, but gate the Fracture tier behind explicit informed consent —
   the install screen states plainly what will start happening. A deception the player opted
   into is a mechanic; one they didn't is a bug.
2. **8-directional swipe accuracy on a small screen is unproven.** 45° cones may be too tight
   for a thumb in motion. *Recommendation:* build the slice with a tunable cone angle and a
   telemetry counter for "move immediately reversed," and settle it with real data rather than
   argument. Fallback is 4-dir swipe with diagonals available only via tap-to-path.
3. **12 floors may be too short for the chrome system to breathe.** Instability tiers want more
   installs than 12 floors will drop. *Recommendation:* ship the slice, measure, and if it's
   thin, add floors to Act II rather than lengthening runs uniformly.
4. **Act III's rotating layout may simply feel bad** rather than unsettling. It invalidates
   player knowledge, which is the resource roguelikes are built on. *Recommendation:* prototype
   it in isolation before committing; it is the one system I would cut first.
5. **Portrait viewport is 11 tiles wide.** Act II's design leans on long corridor sightlines
   that the player will not be able to see across. *Recommendation:* Act II gets a pinch-to-zoom-out
   tactical view (2 zoom steps, no gameplay change), or Act II's corridors get shortened. Decide
   before Act II is built, not after.
6. **Free inspection (long-press costs no turn) may trivialize threat assessment.** *Recommendation:*
   keep it free. Hiding information behind a turn cost punishes new players and expert players
   simply memorize the roster. Charge turns for *acting*, never for *understanding*.

---

## 12. Reference points

*Shattered Pixel Dungeon* for touch-first traditional roguelike UX and the identify tension.
*Caves of Qud* and *Cogmind* for the "your build is bolted-on parts" fantasy — Cogmind
especially for the idea that your equipment *is* your body. *Invisible, Inc.* for the alarm
clock as the central pressure system, which Trace is a direct descendant of. *Into the Breach*
for legibility discipline: every threat telegraphed, nothing hidden that matters.
