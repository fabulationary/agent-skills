# CARFIGHT TACTICS ADVANCED
## Game Design Document — Companion to the Concept Pitch

> **Design authority:** Drafted by the Game Systems Designer for the CARFIGHT franchise, reviewed and approved by the Showrunner. This document is the systems-depth companion to the approved concept pitch (`pitch.md`) — read the pitch first for the hook, pillars, and core loop; this document goes one level deeper on how each system actually works. Canon vocabulary and naming are locked per Showrunner ruling.

**Status:** Approved design document. Internal tuning numbers (exact costs, drop rates, research pricing, and balance formulas) are intentionally omitted here — they live in the production GDD and change during tuning; what follows is the systems, structures, and rules that define how the game plays.

---

## 1. THE REEL GRAMMAR, IN FULL

Every contested action resolves on three core reels — **CREW**, **MACHINE**, **WORLD** — each a visible strip of symbol faces: **HIT, TRUE** (a critical upgrade), **MISS, JAM** (mechanical unreliability), **DRIFT** (the world improvises), and **ECHO** (a crew's legend answers for them). Nothing about a spin's odds is ever hidden: every face on every reel, including the ones an opponent is about to spin, can be inspected before it's committed.

**One rule holds everything else together — the accuracy firewall:** whether an action connects is decided by the three core reels alone, always. Nothing else in the game — a piece of equipment, a crew member's fame, the region you're standing in — is ever allowed to change whether a shot hits. They can only change *what a hit costs, what a miss triggers, and what happens next.* This is the single design law every other system below has to obey.

**Phantom reels** are how gear, crew, and depth make themselves felt without breaking that law. As a build gets stranger — deep-provenance salvage, a driver famous enough to be sung about, a region past the Rim — narrow secondary reels dock onto the sides of the core three. They add consequences, trigger follow-up effects, and modify what happens next. They never decide hit or miss. A player can always see exactly which phantom reels are docked, and a hard cap keeps the display (and the decision space) from becoming unreadable — a build only ever has to track a small, bounded set of reels in play at once, never an unbounded pile of modifiers.

- **Gear-sourced phantom reels** dock when a car is fitted with unusual, deep-provenance, or not-yet-settled inward salvage. They surface a piece of equipment's undiscovered quirks — some of which the player hasn't found out about yet, and finds out about the first time the reel lands.
- **Crew-sourced phantom reels** dock for drivers famous enough to have real ballads sung about them. They let a crew's own legend perform their signature move for them — which is exactly as much of a gift as it is a loss of control, since a famous driver doesn't always do what the player asked.
- **Region-sourced phantom reels** dock automatically in the stranger regions of the world, each one a physical version of that region's own rule about reality. A player entering a new region always knows, from the loading screen onward, exactly what they're about to be up against.

**Depth changes the reels, not the rules.** Near the world's edges, the reels are honest to the point of feeling like a hand of cards you can read in advance — this is a design promise, not an accident. The deeper a convoy drives, the more the WORLD reel argues back, and the more phantom reels accrete onto the sides of the machine. One rulebook, every depth.

---

## 2. COMBAT SYSTEMS

### 2.1 Initiative

Turn order is driven by a driver's nerve and a car's responsiveness — how quickly a rig actually reacts, which is a function of its frame class, its tires, and its suspension tune, adjusted down for every step a build is carrying past its rated weight. This produces a legible spread: a scout bike with a green driver still typically acts before a heavily armored rig with a veteran commander, because that's the whole point of fielding a scout bike. Initiative is **not** locked at the start of a round — it recomputes live whenever something changes it (a part destroyed, a driver hurt or healed, an ally wrecked, a crew's morale spiking on a legendary result), always moving forward through the turn order rather than rewriting anything already resolved.

### 2.2 Movement — momentum on hexes

Every car carries velocity as a real stat, not an abstraction. Two numbers govern it every turn: how much speed a car can gain or shed (set by its engine against its total mass, including cargo and any overload it's carrying), and how many forward hexes a facing change costs, which scales with current speed against the frame's handling. A motorbike can pivot in place at a walking pace; a fully loaded semi-tractor at speed needs a straightaway to turn at all. Momentum carries between turns — a car does not stop just because its turn ended — which means the tactical puzzle of every battle is arriving at the right hex, at the right speed, with the right facing, because facing is armor: damage addresses a car's plates by which side took the hit, and crossing an enemy's tail at speed is the game's fundamental scoring position.

**Stunts** — handbrake turns, drift-slides, ramps, deliberate sideswipes — are movement actions resolved on the reels exactly like an attack, with the driver's own skill, the car's suspension, and the road surface each loading a different reel. **Ramming** ("the last word") scales damage with closing speed and mass difference, and the defending car spins its own suspension save; a motorbike does not ram a semi and expect to walk away from it.

### 2.3 Actions and damage

Every car takes one or two actions a turn — firing a mount, activating a gadget, reloading, bracing, swapping crew seats, repairing in motion. Damage is addressed to specific plates and parts, not a shared health bar: kill the wheels to strand a car, kill the gunner to silence a turret, kill the engine to end a pursuit. There is no such thing as generic hit points ticking down — every hit lands somewhere specific, and a battle's story is told in which parts a convoy is missing by the end of it.

### 2.4 Drivers and crew

Every car fields a driver and, on larger frames, additional crew seats — gunner, mechanic, spotter — and it's the people, not the machine, who load the CREW reel. Four stats govern a crew member: nerve (initiative and grit under pressure), hands (movement and stunt skill), eye (aim), and grit (how much they can take before they're hurt or worse). Temperaments give crews real personality with a mechanical cost and benefit: a zealot rigs cheap but won't second-guess a spin; a skeptic is the team's best defense against an opponent's luck but can't fully commit to a called shot; a showboat earns real rewards for style and feeds the fame economy faster than anyone else on the crew — for better and for worse. Injuries are persistent, not a temporary debuff timer, and death is permanent: a driver lost in a wreck is lost for good, along with anything they alone had learned and never taught a crewmate — unless a surviving driver had been deliberately mentored by them beforehand.

**Canon cameos:** the show's own leads — Dess, Angelo, and Fay — appear as rare, recruitable legends, and their kits are built from who they are on screen. Dess is the deepest well of skepticism on any crew she joins, capable of unraveling an opponent's luck more than anyone else in the game, at the cost of never fully committing to her own called shots. Angelo's presence alone keeps a convoy's well-maintained gear running cleaner for longer. Fay's own gear runs hotter and stranger than the label promises, in both directions — which, once you understand where the whole resolution system actually comes from, makes perfect sense.

---

## 3. VEHICLE FRAMES

Seven frame classes span the full range the brief promised, from motorbike to armored crawler to salvaged aircraft — each one a different answer to the triangle of mass, momentum, and initiative:

| Frame | Identity |
|---|---|
| **Spoke** (motorbike, trike) | The scout and the knife. One mount, absurd initiative and turn radius, dies to weather. |
| **Runner** (muscle car, buggy) | The duelist chassis. Fast, two mounts, built to win a fair fight. |
| **Pursuit** (interceptor, war-sedan) | The classic CARFIGHT silhouette — balanced, duel-legal. |
| **Hauler** (pickup, box truck) | The cargo bed is the run's wallet. Mid armor, real carrying capacity. |
| **Longhaul** (semi-tractor + trailer) | Massive weight load, multi-section on the grid — the tractor and trailer articulate independently, and jackknifing is a real failure state as well as a real stunt. |
| **Bulwark** (salvaged tank, armored crawler) | Tracked: it ignores the standard turn-radius rule entirely, crawls, shrugs off rams, and drinks fuel like grief. |
| **Kite** (ultralight, rocket-glider, autogyro) | Recovered, never built. Flies only away from the world's edge — hauled to the starting region, a Kite simply will not start. Occupies an air layer immune to ground hazards, lands to reload, and degrades faster than anything else a player can own. |

**Every build is triple-budgeted:** weight, power, and ammo, checked against the frame's ratings before a car is ever allowed to leave the garage. Overloading past a frame's rated capacity is legal, but it costs — slower reactions, worse acceleration, less reliable gear — in a small number of clearly priced steps, never an open-ended spiral. Every part on a car carries three properties: its **Grade** (how well it was made), its **Condition** (how worn it is, which shows up as visible unreliability the longer it goes unmaintained), and its **Provenance** (where it came from, and how long someone has kept faith with it). Parts a player maintains across many runs earn **Kept** status — proven, and more resistant to the world trying to reinterpret them.

---

## 4. ARSENAL

**Two arsenals, one law: provenance is destiny.**

- **Rim iron** — machine guns, cannons, harpoons, rams, mortars, mines, flame — is reliable, ammo-hungry, and honest. It is built, not found, and it never surprises you, which becomes its own kind of superpower the deeper you drive.
- **Inward salvage** — arc-casters, grav snares, phase claddings, and the rest of the wasteland's "maybe" gadget tradition — is never manufactured, only recovered. Every piece carries a depth of origin and a hidden quirk discovered through play, and every piece **goes soft** over time: carry it too long, too deep, or somewhere that flatly disagrees with it, and it slowly stops behaving like the thing it was built to be. Well-kept gear goes soft slower. Freshly recovered salvage is genuinely unsettled for a stretch after recovery — stronger and stranger if mounted immediately, safer and more predictable if given time to settle first, a real pickup decision every time a run turns up something new.

**No free technology.** There is no research path that manufactures inward salvage from nothing. Research only ever teaches a crew to understand, maintain, and rig what the world has already given up — the Rim's own consensus builds engines and bullets, and everything stranger than that is borrowed, at interest.

---

## 5. ARENAS

Eleven regions plus a withheld final tier, drawn from the show's own map, ordered along the world's bands — physics gets less reliable the deeper a convoy drives, and every region's signature strangeness is a physical expression of its own governing faction's worldview.

### Launch regions (band: the world's edge, physics played straight or nearly so)

- **Crosshaul Interchange** — the control-group arena: no environmental strangeness at all, ever. A toll gate cycles open and closed on a fixed schedule, and live convoy traffic runs its own lane on a fixed route — the timetable, not the enemy, is often the real clock.
- **Sparkwell Fields** — fuel is a battlefield object here, not an abstraction. Fires spread deterministically from spill to spill, flare stacks burn ambient damage until destroyed (and detonate once when they go), and "free" fuel pickups are sometimes flagged as fire risks — always shown to the player before they commit to collecting one.
- **Creed Reaches** — wreck-shrine hexes grant a positional initiative bonus to the faction that reveres them. Ancestor-cars sit at the field's edges, always facing inward, and are never, under any circumstance, seen to move.

### Launch regions (one band deeper — the world starts to answer back)

- **Mileage Longways** — a confident, banked-up convoy can compress the road ahead of it; objective points relocate every round until a crew stops to verify and pin them in place. This is the first region where a crew's growing legend starts to show up physically on the battlefield rather than just in how people treat them.
- **Boneyard Tiers** — loud actions here have a cost: autofire, rams, and explosions add a small chance a unit's own next action stumbles, and enough of that concussion collapses the wreck-stacks that provide the battlefield's cover. Salvage here is also grave-flagged, and taking it without a moment's respect costs standing with the people who bury their dead in it.

### Post-launch regions (deeper again — the world's rules start to bend around a region's own belief)

- **Verdance Aisles** — leave the road here and your gear pays for it: exposed metal loses condition every round spent off the marked path, and the region's own green life will reach out, root a car in place, and strip an unbolted piece of gear rather than destroy it outright.
- **Signal Coast Relays** — buffs here are auctioned mid-battle between both sides using a battle-scoped currency of standing rather than fuel, and the region's signature hazard plays with what a driver can trust their own eyes to tell them — always disclosed, never actually hidden from a proper inspection.
- **Hourglass Terraces** — the region runs on a strict, visible metronome. Every so many rounds, one named rule mutates for the following cycle, always shown to the player in advance; falling out of rhythm with the count is its own kind of danger.
- **Weighed Roads** — every rigging tool a crew spends here is tallied, visibly, as a running debt, clearable only by stopping to make amends; let the tally climb too high and it's collected, forcibly, from whoever's bent the battle hardest.
- **The Hush** — an expanding zone of silence spreads across the field. Inside it, results can simply not happen at all — no damage, no effect, ammo spent for nothing — which is the single scariest outcome the game has to offer, specifically because "nothing happened" is a legal, expected result here.
- **The Penance Roads** *(public working name)* — an unmapped enclave where unforgiven machinery refuses to act at all rather than fail outright; a handful of checkpoints exist to earn a car's gear back before a fight, and skipping them is a real, chosen risk, never a soft lock.

### Final tier

- **Court of the Answer** — withheld. Final-run content, kept sealed until the show's own story has earned it.

**One design rule holds across every region, at every depth:** the old highways always stay the most stable ground in the world. Leaving the road is always a choice, and it always has a price.

---

## 6. RUN STRUCTURE & ECONOMY

A run is a branching road chart, oriented inward from a home garage. Every node on the map is a battle, a waystation (barter, repairs, rumors), a hazard crossing, or a narrative event. Fuel and ammo spent along the way do not come back until the run ends — a dry tank stranded deep in hostile country is the worst, and most on-brand, way for a run to end. The map never forces an end: at every node, a player can see exactly what it costs in fuel to turn around and go home, and turning back early is always legal, always solvent, and always quieter in the songs that get sung about it. The road home reruns the same ground in reverse, heavier with salvage, hotter with risk, and hunted — the richest haul is always the loudest target.

Between runs, three things persist regardless of whether the run itself succeeded: **research** (teardown of recovered salvage, unlocking new frames, mounts, and rigging techniques — always understanding and maintenance, never manufacture), **reputation** (a standing with each of the world's factions, moved by how a crew treats that faction's own worldview, unlocking arenas, prices, and patronage), and **ballads**.

---

## 7. BALLAD-MAKING AND BROADSIDES

After every run, the game drafts verses from a crew's actual deeds — the spins, the stunts, the mercies, the called shots. Commissioning a verse turns it into a lasting part of a driver's legend, and a legend is armor: at the world's edge, fame works entirely on the people around a crew — hesitation, price breaks, who flinches first — and only once a convoy has driven deep enough does that same fame start to act directly on the battlefield itself, the same moment a crew discovers their own legend got there first. And a legend is also a trap: enough songs sung about the same signature move start to make a crew *do* that move whether or not it was the smart play, and a rival faction can even publish a false verse about a crew, handing them a reputation they never earned and a reason to go set the record straight. Late in a campaign, the real game is curation — deciding which of a crew's true stories can afford to become famous.

**Broadsides** are the game's social-share feature: a shareable card or clip built from a commissioned verse, a witnessed spin, or a fallen driver's epitaph, rendered in the style of whichever faction's singers composed it, showing off a convoy's own liveries and paint. Broadsides display a crew's reels and results — they never touch them. Sharing one confers no gameplay advantage of any kind; it exists purely to let a player show off the build and the moment, which is also the entire point of a cosmetic economy.

---

## 8. CAMERA & TOUCH UX

The camera is isometric, player-owned, and built for a thumb: three fixed zoom levels (a cinematic close view, a tactical default, and a full-map overview), six rotation snap points matching the hex grid's own six facings so a car's armor always reads correctly no matter how the camera is turned, and one-finger panning with momentum. Movement is drag-to-shape: tap a car, see its full range of legal moves rendered instantly with arrival speed and facing color-coded, drag along the fan, and confirm with an explicit second tap — nothing destructive ever commits on a single touch. The reel-resolution screen lives as a bottom sheet, always within thumb's reach regardless of zoom level, with an auto-spin option for anyone who'd rather tap once than swipe. Every reel face is legible by shape as well as color, so no part of the game's central mechanic depends on color vision alone.

---

## 9. TECHNICAL APPROACH

Built in Godot as a 2D isometric game: a hex-based tilemap for terrain and hazards, independently animated vehicle sprites (rather than tile-based units) so cars can carry continuous rotation, damage states, and mounted-gear overlays, and a palette-swap shader for livery so the cosmetic economy stays cheap to produce at scale. All battle logic resolves through a single, seeded, deterministic random source — the foundation for save-anywhere, for asynchronous "beat my spin log" challenges, and for generating a Broadside's replay clip after the fact, all without needing to re-simulate anything on a server. The game targets a smooth frame rate in combat on mid-tier phones, with a lower frame cap and reduced visual effects out of combat and in a battery-saver mode, in service of the short, commute-length sessions the whole design is built around.

---

## 10. CONTENT ROADMAP

A vertical slice proves the core loop in a single region with two frame classes and no phantom reels yet — the deterministic, seeded battle system is the first technical milestone, since everything else depends on it. Launch ships five regions, five frame classes, and the gear- and crew-sourced phantom reels; the tracked and airborne frame classes follow shortly after as a fast-follow update, since neither needs a new region to be legal in. From there, content arrives in seasonal drops that carry the game two regions deeper at a time, introducing the world's stranger, region-specific phantom reels as the world gets stranger — timed, always, to land in step with the show's own story rather than ahead of it.

---

## 11. MONETIZATION & COMPLIANCE

**The firewall, restated as policy:** no real-money purchase may ever add, remove, or weight a reel face, on any reel, core or phantom — full stop. Monetization is cosmetic-only: liveries, portraits, garage trim, Broadside styles. There are no randomized reward containers of any kind, cosmetic or otherwise, because even a cosmetic loot box would turn the game's own resolution metaphor into an actual gambling mechanic — precisely the thing the firewall exists to prevent. Every probability in the game is visible before it's spent, on every reel, without exception, which the team treats as the honest answer to any gambling-optics concern rather than a mitigation to argue around.

---

*This document is a systems companion to the approved concept pitch. Sealed, final-tier, and show-timeline-sensitive content is withheld by design, consistent with the pitch's own commitment to keep the show's secrets.*
