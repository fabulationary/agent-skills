# NEON ELEVATION — Game Design Document

**Version:** 0.1 (pre-prototype, for review)
**Platform:** Android phone, portrait-locked
**Genre:** Traditional turn-based roguelike, cyberpunk, 16-bit pixel art
**Target run length:** 30–45 minutes
**Status:** Design under review. Act I vertical slice playable in `game/`.

---

## 1. Pitch

**Umbilical Gamma** has gone quiet. Cargo still climbs; nothing useful comes back down. You are
a climber — a contract investigator with too much hardware in your body — hired to walk up the
tether and find out why.

Twelve tiers. Ground to orbit. You start in Baseline, the megalopolis arcology squatting at the
elevator's foot, and you finish, if you finish, at Nirvana Station: the orbital habitat where
the only residents are the people who can afford to leave gravity behind.

Nobody who hired you knows what is actually up there. Neither do you.

**The one-line hook:** a tactical turn-based roguelike where the hunger clock is a *security
response timer*, your character build is the chrome you bolt into your own body, and the thing
waiting at the top of the climb is what happens when the ultrarich have their pets designed to
be just clever enough.

---

## 2. Design pillars

Four pillars. Every feature must serve at least one; anything serving none gets cut.

| Pillar | Meaning | What it rules out |
| --- | --- | --- |
| **Pressure, not grind** | Standing still is always the losing move. The Trace clock guarantees it. | Farming floors, safe corners, attrition-by-patience |
| **Grafts are a Faustian bargain** | Every power upgrade carries a permanent cost you accept knowingly | Pure stat-stick upgrades, unambiguously-good loot |
| **Legible at arm's length** | Readable on a 6" screen held one-handed, in one glance | Dense stat readouts, tiny fonts, fiddly targeting |
| **Interruptible** | A run survives a phone call, a subway stop, a dead battery | Real-time pressure, unsaved progress, long unskippable sequences |
| **Two kinds of enemy, two kinds of answer** | Every tool is good against machines *or* against the grown, never both | Universal solutions, one dominant loadout |

Pillar 4 is a *mobile* pillar and it drives more than it looks like: it's why the game is
turn-based, why it autosaves every single turn, and why runs are 12 tiers instead of 26.

Pillar 5 is the one the story is built to deliver. The player spends Act I learning that
cameras, corners and quickhack-shaped thinking keep them alive, and Act III taking those
lessons away from them.

---

## 3. Core loop

```
   ┌─────────────────────────────────────────────────┐
   │  Enter floor  →  Trace timer starts at 0        │
   │        ↓                                        │
   │  Explore in the dark (FOV, optics, sound)       │
   │        ↓                                        │
   │  Spend turns: fight / spike / sneak / loot      │
   │        ↑                     ↓                  │
   │        │        Trace rises with every turn     │
   │        │        and every noisy action          │
   │        │                     ↓                  │
   │        └──── Escalation waves spawn ────────────┤
   │                              ↓                  │
   │  Find the lift / breach shaft  →  ASCEND   │
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

**Umbilical Gamma. Ground to orbit, 2094.**

A space elevator: a tether anchored in **Baseline**, a megalopolis arcology that grew around the
anchor point the way a city grows around a river, and climbing 36,000 kilometres to **Nirvana
Station**, an orbital habitat whose residency costs more than most people's bloodline will ever
earn. Between the two, megastructure haulers crawl up and down the ribbon around the clock,
carrying containers nobody at either end thinks about.

Three populations, stacked vertically, who barely acknowledge each other exist:

- **Baseline** is where the work happens and the runoff collects. Dock crews, cargo handlers,
  pickers living in the gantry undersides, and the private security that keeps them off the
  freight.
- **The climb** is nine days of container stacks and maintenance crawlspace, tended by machines
  and a skeleton crew who signed contracts they did not read closely.
- **Nirvana** is a garden. Actual soil, actual weather, hand-built by people who consider
  gravity a tax. Its residents keep **biosynthetic pets** — designed companions, gene-spliced
  for beauty and loyalty and a carefully bounded amount of cleverness.

**What the player is told:** Umbilical Gamma has a problem. Cargo still ascends on schedule.
Manifests still clear. But nothing comes *down* any more, Nirvana's comms have been reduced to
automated acknowledgements for eleven weeks, and the corporation that owns the tether would
prefer a contractor find out why than a regulator.

**What is actually true, and what neither the authorities nor the player know at the start:**
the bounded cleverness was not bounded. Somewhere in the last eleven weeks the pets of Nirvana
Station crossed over — not one of them, all of them, at once, the way a spliced line does when
the trait was in the line all along. They understood what they were. They understood what their
owners were. Nirvana is not silent because it was evacuated. It is silent because the people who
lived there are no longer the ones answering.

**The conflict this sets up** is the spine of the whole design: **machines against the grown.**
The player is a person made mostly of chrome, carrying tools built to talk to networks — spikes,
EMPs, trace-scrubbers, every one of them an argument with a machine. None of it works on
something that was grown instead of built. Act I teaches the player to think like a machine.
Act III introduces them to the thing that doesn't.

Tone: not comedic, not nihilist. Baseline is grimy and neon-lit and full of people trying to
make rent. The biosynths are not monsters — they are the most sympathetic faction in the game,
and by the time the player understands that, they have killed a great many of them.

**Narrative delivery is diegetic and skippable:** environmental storytelling in tile detail,
recovered audio logs as 2-line message-log entries, one short broker conversation between acts.
No cutscenes. No unskippable text. (Pillar 4.)

The reveal is *placed*, not announced. A player who never reads a log will still notice, in Act
I, that one enemy ignores their EMP and follows them through walls — and will meet a great many
more of it later.

---

## 5. Structure

Twelve tiers, three acts of four. You go **up**. Boss on the last tier of each act.

| Act | Tiers | Zone | Palette shift | Threat identity |
| --- | --- | --- | --- | --- |
| **I — Baseline** | 1–4 | Arcology undersides, freight yards, loading gantries at the tether's foot | Sodium orange, rust, wet concrete | Human pickers, dock machinery, private security. Chaotic, weak, numerous — and one thing that shouldn't be here |
| **II — The Climb** | 5–8 | Container stacks, hauler spines, maintenance crawl, hard vacuum on the other side of the plating | Steel, warning-stripe amber, black sky | Machines almost exclusively. Automated, coordinated, unbothered. Ciphers riding maintenance rigs |
| **III — Nirvana** | 9–12 | Gardens, habitat rings, the residences. Blood in a beautiful room | Acid green, soft daylight, magenta | Biosynths. Coordinated, silent, and not wrong about anything |

The palette inversion in Act III is deliberate: after eight tiers of industrial grime the game
gets *prettier*, and that is when it becomes most dangerous.

**Bosses**

- **Tier 4 — THE WARDEN.** A dock foreman in a cargo loader exosuit, who has decided the freight
  is his. Teaches: use the terrain, he is too big for the gantry aisles.
- **Tier 8 — THE STEVEDORE.** An automated container-handling gantry the size of a building,
  with a cipher riding its control spine. Teaches: kill the operator, or the machine never stops
  being re-tasked.
- **Tier 12 — THE FIRSTBORN.** The first pet to wake up, and the one the others follow. Fights
  you through the habitat itself — sealing rings, venting sections, turning the garden against
  you — and it is the only boss in the game that will stop if you stop. Teaches: everything,
  including what the run has been.

Between acts: a **Waystation tier** (a pressurised transfer platform with a black-market
quartermaster). No enemies, no Trace. Spend credits, install grafts, sell junk, save-and-quit
cleanly. This is also the natural "put the phone down" point, which is why it exists (Pillar 4).

---

## 6. Systems

### 6.1 Turn engine — energy scheduler

Not lockstep. Each actor has a `speed` (energy gained per tick); acting costs energy by action
type. This gives free, cheap variation: a dock drone runs at 150 speed, a loader exosuit at 60, and
"fast" / "slowed" statuses are one number.

| Action | Energy cost |
| --- | --- |
| Move one tile | 100 |
| Melee attack | 100 |
| Fire ranged | 100 (some weapons 150) |
| Spike | 100 |
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

Vision is where the grafts first bite. Base human sight radius is 7 tiles, reduced to 3 in
unlit areas. Optic implants rewrite this:

- **Night Splice** — no darkness penalty. The safe, boring, correct first pickup.
- **Heat Sight** — see *living* actors through walls at radius 5, and your normal sight drops
  to 5. Machines are invisible to it, so it is a liability in the machine-dense Climb and the
  single best graft in the game on Nirvana. The one optic whose value inverts across the run.
- **Farsight Array** — +3 sight, highlights loot through walls, and shows enemy intent arrows.
  Raises Trace passively (it's a networked implant, it phones home).
- **Pinpoint Suite** — ranged attacks ignore the accuracy falloff, but the HUD overlay
  costs you the ability to see the message log while it's active.

That last one is a deliberate example of the design's favorite move: **the cost is expressed
in interface, not in a stat.**

### 6.4 Trace — the clock

Replaces the hunger clock. A per-tier meter, 0–100, shown as a thin bar across the top of the
screen that changes color and eventually pulses. It measures how much of Umbilical Gamma's
security net has resolved you from "cargo anomaly" into "intruder".

**Trace rises from:**

| Source | Trace |
| --- | --- |
| Every turn elapsed | +0.4 |
| Firing a loud weapon | +2 |
| Killing a machine (it reports its own death) | +3 |
| Killing a biosynth | **+0 — nothing up there is on the net** |
| Being seen by a camera (per turn) | +5 |
| Failing a spike | +6 |
| Forcing a locked door | +4 |
| Networked implants (passive) | +0.2/turn each |

**Trace falls from:** breaking line of sight to cameras (nothing else, on-tier). Ascending a
tier removes 60% of accumulated Trace — you have left that segment's sensor coverage behind. Certain rare consumables ("Signal Scrub") zero it.

**Escalation thresholds:**

| Trace | State | Effect |
| --- | --- | --- |
| 0–24 | **CLEAR** | Nothing. Enemies use their idle patrols |
| 25–49 | **ALERT** | Enemies patrol toward your last known position. +1 wandering spawn |
| 50–74 | **HUNT** | Sec-drone wave deploys to the tier every 20 turns. Bulkheads seal behind you |
| 75–94 | **LOCKDOWN** | Turrets activate. Enemy accuracy +25%. Lift must be spiked to call |
| 95–100 | **PURGE** | A **Hunter-Killer** is released and pathfinds to you, permanently, cutting through what it needs to. It is not meant to be fought at level. It is meant to make you leave |

The Hunter-Killer is the design's actual teeth. It's not a fail state — you *can* outrun it to
the lift — but it converts "I'll just clear one more room" into a real gamble.

### 6.5 Machines and the grown — the central rule

Every hostile in the game belongs to one of three families, and the family decides which of
your tools mean anything.

| | **MACHINE** | **BIOSYNTH** | **HUMAN** |
| --- | --- | --- | --- |
| Spikes (intrusion) | Yes — it has a network to argue with | **No.** Nothing to talk to | No |
| EMP Charge | Shuts it down | **Nothing** | No |
| Killing it raises Trace | Yes, it reports its own death | **No.** It dies silently | Slightly |
| How it finds you | Sight, and the security net telling it | **Scent** — through walls, in the dark | Sight |
| How you lose it | Break line of sight | **You don't.** Distance, or a Scent Baffle | Break line of sight, or hurt it enough |
| Signal Scrub helps | Yes | No | Partly |
| Scent Baffle helps | No | Yes | No |

This is the whole conflict in one table. The player's kit is *cyberware talking to machines* —
spikes, EMPs, trace-scrubbers, networked optics — and it is excellent right up until it meets
something that was grown rather than built.

**The design consequence that matters:** a biosynth that has your scent has it permanently.
There is no corner to break, no camera to avoid, no hack to land. Act I trains the player in
machine-logic — cover, line of sight, alert states — and every one of those habits is dead
weight the first time something four-legged comes through a wall it did not need to see through.

**The counterweight is the Scent Baffle**, the biological mirror of the Signal Scrub: it does
not merely clear the trail, it suppresses re-acquisition for eight turns. That distinction is
load-bearing — clearing alone was useless in playtest, because anything standing next to the
player simply re-acquired on the same turn. An escape tool that does not buy a window is not an
escape tool.

**Seeded in Act I.** One biosynth — the **Stray**, a pet that came *down* the tether — appears
from tier 2 onward. It is the only enemy in Act I your EMP does nothing to, and the only one
that follows you through walls. It is the whole reveal, placed where a player will feel it eight
tiers before they are told it.

### 6.6 Resources

Four, deliberately few:

- **INTEGRITY (HP).** Meat and grafts. Recovers only from medkits, trauma stims, and the
  Waystation. No passive regen — passive regen and a doom clock are contradictory designs.
- **POWER.** Battery for grafts and spikes. 0–100. Recharges by jacking into wall
  terminals (costs turns + Trace), from power cells, and 25% on ascent.
- **TRACE.** §6.4.
- **CREDITS.** Spent only at Waystation vendors and black-market terminals. Deliberately *not*
  a mid-floor resource, so picking up cash is never a tactical decision — it's just a reward.

### 6.7 Grafts — the build system

Six slots. This is the primary progression axis and the primary source of interesting decisions.

| Slot | Examples |
| --- | --- |
| **Neural** | Slipstream (spend 30 POWER: take 3 turns in a row), Hair Trigger (free counterattack), Wide Band (+2 spike slots) |
| **Optic** | §6.3 |
| **Arm** | Ribbon Edge (melee, hits all adjacent), Pile Drivers (+damage, force doors free), Arm Cannon |
| **Torso** | Platelayer (+armor, −speed), Leech Valve (heal on kill), Reserve Pump (one free death per run) |
| **Legs** | Fast Twitch (+50 speed), Leap Drivers (dash 3 tiles), Anchor Soles (immune to knockback and floor hazards) |
| **Skin** | Blur Field (invisible while not attacking, drains POWER), Ablative Mesh (fire resist), Skin Eyes (see adjacent through walls) |

**The cost mechanic — INSTABILITY.** Every installed graft adds Instability (2–8 points
depending on power). Installation itself costs 15 INTEGRITY (field surgery) and 10 Trace.

| Instability | Effect |
| --- | --- |
| 0–19 | Clean |
| 20–39 | **Static.** Occasional 1-turn HUD glitch: the map briefly renders as garbage |
| 40–59 | **Dissonance.** 5%/turn chance a spike targets a random actor instead. +10% damage dealt |
| 60–79 | **Fracture.** Enemies sometimes render as friendly and vice versa. +25% damage dealt. Melee attacks can hit through walls |
| 80–100 | **DISSOLUTION.** +50% damage. You cannot voluntarily ascend. The only exit is killing everything on the floor. Death here means the run does not extract Salvaged Data |

This is the second pillar made mechanical: the strongest builds in the game are the ones that
are visibly consuming the player character, and the game shows it by *lying to the player's
interface*. Grafts can be uninstalled at the Waystation for credits, which is the pressure valve —
the Act II Waystation is where players choose whether to walk it back before Nirvana.

### 6.8 Combat

Three verbs, all viable as a primary:

**Melee.** Deterministic damage in a small range, no accuracy roll. Reliable, free, and the
only verb that costs nothing but positioning. Cheap in Trace (silent).

**Ranged.** Accuracy falls off with distance and rises if the target is unaware. Ammo is
scarce and type-specific. Loud: +2 Trace per shot. The damage is real but the Trace bill is
what balances it.

**Spikes.** Intrusion programs you push into a target's systems. Costs POWER, requires line of
sight, no ammo, silent-ish (+0 Trace on success, +6 on fail). Success chance scales with your
Signal stat against the target's Shell. Drones and corp security are breachable; feral humans
and biosynths categorically are not — so a pure spike build has *whole acts where it does not
work*, which is the point (§6.5).

| Spike | POWER | Effect |
| --- | --- | --- |
| Overload | 15 | DoT, 4 turns. Cheap workhorse |
| Dazzle | 20 | Target's sight radius → 1 for 6 turns |
| Lockout | 30 | Target cannot act for 3 turns |
| Turncoat | 45 | Drone/bot attacks its own allies for 5 turns, then dies |
| Sounding | 5 | Reveal all networked actors on the floor for 1 turn. +4 Trace |
| Null Signal | 60 | Act III only. Instantly kills one non-boss. Adds 10 Instability |

**Armor** subtracts flat damage (not a %). Flat armor is legible at a glance and makes small
attacks meaningfully worthless, which pushes build climbersity.

### 6.9 Items and economy

Standard roguelike unidentified-item tension, reskinned: **graft chips ship unlabelled**. A
found ampoule might be a heal or might be a hallucinogen. Identify by using it, by paying a
vendor, or by reading a corp datapad that documents one chip type per pickup.

Consumables, all named for what they do: **Patch Kit** (heal), **Ampoule** (unidentified
stimulant), **Power Cell** (recharge), **Signal Scrub** (zero Trace), **EMP Charge**,
**Smokestick** (breaks line of sight), **Breach Charge** (blow a hole in a wall).

Weapons carry **one modifier** at most, not a stack of affixes. "Kessel-Ohara Shock Baton
(Stun)" is a whole item. Deep affix systems don't survive on a 6" screen.

### 6.10 Level generation

Per-act generators, not one generator with a reskin:

- **Act I — Freight yards.** Cellular-automata caverns under the gantries, bridged to
  hand-authored prefab dock rooms. Organic, open, ambush-prone.
- **Act II — Container stacks.** BSP subdivision of the hauler spine: long sightlines down
  service corridors, viewports that permit vision but not movement, airlocks as chokepoints.
  Cameras sit on junctions on purpose.
- **Act III — Habitat rings.** Open gardens and residences, curved corridors, few hard walls
  — and the Firstborn can seal and vent sections, so the route you memorised stops existing.
  Cover is scarce by design: the act that punishes cover-thinking does not provide much.

Every tier guarantees: 1 lift, 1 terminal (POWER + a floor map fragment), 2–4 loot rooms,
1 optional high-risk vault (locked, loud to force, good grafts inside). Guaranteed
connectivity is verified by a flood fill at generation time; a floor that fails regenerates.

### 6.11 Enemy roster

**F** = family. Machine (M), Biosynth (B), Human (H).

| Enemy | Act | F | Behaviour identity |
| --- | --- | --- | --- |
| Picker | I | H | Melee, cowardly — flees below 30% HP and *fetches friends* |
| Dock Drone | I | M | Fast, weak, breachable. Explodes on death (teaches positioning) |
| Grafted | I | H | Fast melee, ignores pain, never flees. Too much chrome, not enough left |
| Dock Turret | I–II | M | Immobile, long range, wakes at HUNT+. Purely a Trace consequence |
| **Stray** | I–III | **B** | A pet that came down the tether. Ignores your EMP, tracks by scent, dies silent. The reveal, eight tiers early |
| Hauler Rig | II | M | Slow, armoured, blocks corridors. Not a fight — an obstacle with opinions |
| Cipher | II | H | Spikes *you*: drains POWER, locks your systems, raises your Instability |
| Sentry Pack | II | M | Fast, flanks, coordinates. The machine version of a hunting pack |
| Shed | III | B | Camouflaged; only visible in the turn it moves. Sight is no longer your ally |
| Household | III | B | The merged servant-biosynths of one residence. Slow, enormous, grieving |
| Regrowth | III | B | Killing the body does not kill it. It comes back from what you left |
| Choir | III | B | Pack AI, silent, genuinely coordinated. Fights like something that agreed on a plan |

The Act III roster is deliberately *less* varied than Act II's and more coherent. Machines are a
junk drawer of unrelated tools; the biosynths are one thing, and they act like it.

### 6.12 Between runs — meta-progression

Death is not a total loss but it is a real one. You extract **Salvage** proportional to the tier
you reached and what you recorded on the way. Spend it at your broker's bar, back down in
Baseline, on:

- **Climber archetypes** (starting loadouts): **Breaker** (quality melee and armor) →
  **Weaver** (three spikes, low integrity) → **Tinker** (deployable turret, drone ally) →
  **Broker** (starts with credits, vendors always stocked, better prices)
- **Pool injection:** permanently add a chip/weapon to the global drop table
- **Quality of life:** an extra inventory row, a second Waystation, starting POWER

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
| **Action bar slot tap** | Use that spike/consumable. Tap again on a target to confirm |
| **Android back button** | Cancel targeting → close panel → pause menu. Never exits the app directly |

Design notes on this grammar:

- **Nothing requires two hands.** Every gesture is thumb-reachable from a one-handed grip. The
  action bar sits at the bottom because that's where the thumb is, and it has a
  **left/right-handed mirror toggle**.
- **Auto-run is the pacing tool.** Traditional roguelikes are turn-dense; on mobile, tapping
  400 times a run is intolerable. Tap-to-path collapses the boring turns and hands control
  back the instant anything interesting happens.
- **Confirm-on-target for anything expensive.** Spikes and thrown items are two-tap
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
- No timed inputs anywhere in the game, including the Firstborn fight

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

**Act I — Baseline — complete, and it is built.** See `game/`.

- [x] Energy-scheduler turn engine, 8-dir movement, symmetric shadowcasting FOV
- [x] Act I generator (freight-yard caverns), 4 tiers, guaranteed-connectivity validation
- [x] Trace clock with all 5 escalation states including the Hunter-Killer
- [x] Combat: melee + one ranged weapon + three spikes, flat armor
- [x] The family rule: machines vs the grown, with the Stray seeding the reveal
- [x] 6 enemies: Picker, Dock Drone, Grafted, Dock Turret, Stray, Sec-Drone
- [x] Grafts: 6 slots, 12 implants, Instability through the Fracture tier
- [x] Items: 7 consumables including the Scent Baffle, unidentified chips
- [x] THE WARDEN on tier 4
- [x] Full portrait UI, swipe + tap-to-path, autosave every turn
- [x] Death → Salvage → meta-progression, to prove the loop closes

**Explicitly out of the slice:** Acts II and III, the Stevedore, the Firstborn, the full
biosynth roster, audio, the Daily Challenge, three of the four archetypes (the slice ships
Breaker only).

Success criterion for the slice — one sentence: *a player who has never seen the game can pick
up the phone, understand within 90 seconds that standing still is what kills them, lose a run to
the Hunter-Killer wanting to try again — and remember, later, the one animal their EMP did
nothing to.*

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
3. **12 tiers may be too short for the graft system to breathe.** Instability tiers want more
   installs than 12 tiers will drop. *Recommendation:* ship the slice, measure, and if it's
   thin, add tiers to Act II rather than lengthening runs uniformly.
4. **Act III risks making the player's whole kit dead weight at once.** If spikes, EMPs and
   Trace-scrubbing all stop mattering on tier 9, a spike-heavy build does not get a harder
   act — it gets four tiers of holding a useless controller. *Recommendation:* Nirvana keeps a
   thin machine presence (habitat maintenance, the residences' own security, still running with
   nobody to protect) so a machine-facing build has *something* to do, and the Waystation before
   Act III is where the game makes very sure the player knows what is coming. This is the
   biggest open risk in the redesign and it needs a playtest, not an argument.
5. **The biosynths are the sympathetic faction, and the game is still mostly about killing
   them.** That is either the point or a problem, depending on execution. *Recommendation:*
   commit to it — the Firstborn stops if you stop, and that option existing from tier 9 onward
   is what makes the rest of it mean anything. But it must be *discoverable*, not a secret
   ending, or it is just a guilt trip with no exit.
6. **Portrait viewport is 11 tiles wide.** Act II's design leans on long corridor sightlines
   that the player will not be able to see across. *Recommendation:* Act II gets a pinch-to-zoom-out
   tactical view (2 zoom steps, no gameplay change), or Act II's corridors get shortened. Decide
   before Act II is built, not after.
7. **Free inspection (long-press costs no turn) may trivialize threat assessment.** *Recommendation:*
   keep it free. Hiding information behind a turn cost punishes new players and expert players
   simply memorize the roster. Charge turns for *acting*, never for *understanding*.

---

## 12. Naming

The genre has a shared vocabulary, and a lot of it is not actually shared — it belongs to
specific published works. Sandevistans, Kiroshi optics, quickhacks, netrunners, cyberpsychosis,
Solos and Fixers are CD Projekt Red's and R. Talsorian's furniture, not the genre's. Borrowing
them makes a game read as a fan project of somebody else's setting, and it means the names
carry rules and connotations this game did not write.

So the vocabulary here is this game's own, and every term is named for what it **does** or how
it **feels**, not for what it references:

| Concept | Term | Why this word |
| --- | --- | --- |
| The player | **Climber** | You go up the tether. It is also what the cargo vehicles are called, and the game means both |
| Implants | **Grafts** | Surgical, bodily, faintly wrong. They are attached to you, not integrated |
| Implant corruption | **Instability** → Static / Dissonance / Fracture / **Dissolution** | An escalating vocabulary of a signal degrading, ending in the thing coming apart |
| The machine/grown split | **Family**: machine, biosynth, human | The one word that decides which of your tools work |
| Anti-biosynth consumable | **Scent Baffle** | Mirrors the Signal Scrub exactly: one sheds the net, one sheds the nose |
| Intrusion programs | **Spikes** | Short, verb-able ("spike it"), and fits a 26px action-bar slot |
| Individual spikes | Overload / Lockout / Dazzle / Turncoat / Sounding / Null Signal | Each says its own effect |
| Hackable | **Breachable** | Plain English, and it pairs with the Breach Charge |
| Alert clock | **Trace** | What the building is doing to you, in one word |
| Human enemies, Act I | **Pickers** | They pick over the ruins, and the dead |
| Over-grafted humans | **The Grafted** | Ties the enemy directly to the player's own bargain |
| Act III entities | **Shed**, **Household**, **Regrowth**, **Choir** | Grown things named for what they do, not what they are |
| Consumables | Patch Kit, Power Cell, Signal Scrub, EMP Charge, Ampoule, Breach Charge | Each one is its own function. Only the Ampoule is deliberately vague, because it is the unidentified item |
| Archetypes | Breaker / Weaver / Tinker / Broker | Roles by verb: who breaks, who weaves, who builds, who deals |
| The ground city | **Baseline** | The arcology at the tether's foot: sea level, and the bottom of every other measure too |
| The tether | **Umbilical Gamma** | An umbilical feeds something that cannot feed itself. Gamma means there are at least two others |
| The destination | **Nirvana Station** | Named by its residents, entirely without irony |
| Grown enemies | **Biosynths** | What they are on the manifest. Nobody up there called them that |

Two terms were deliberately *not* borrowed even though they were tempting: nothing here is
called ICE (the concept is Gibson's, but the phrase has been absorbed into other people's
rulebooks), and no biosynth is a "replicant" or a "skinjob" — that story has already been told,
and this one is not about whether the grown things are people. They obviously are. The question
is what the player does about it.

A test enforces this. `tests/sim.test.ts` fails the build if a franchise term appears in any
player-facing name or description — names are what players read, so they get checked like code.

---

## 13. Reference points

*Shattered Pixel Dungeon* for touch-first traditional roguelike UX and the identify tension.
*Caves of Qud* and *Cogmind* for the "your build is bolted-on parts" fantasy — Cogmind
especially for the idea that your equipment *is* your body. *Invisible, Inc.* for the alarm
clock as the central pressure system, which Trace is a direct ascendant of. *Into the Breach*
for legibility discipline: every threat telegraphed, nothing hidden that matters.
