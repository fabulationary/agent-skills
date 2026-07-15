# CARFIGHT TACTICS ADVANCED
## Concept Pitch — Turn-Based Car Combat Tactics (Mobile Roguelite, Godot)

> **Design authority:** Drafted by the Game Systems Designer for the CARFIGHT franchise; incorporates franchise-owner (stakeholder) mandates; reviewed and approved by the Showrunner with all required revisions incorporated. Canon vocabulary and naming are locked per Showrunner ruling; internal annex on file.

**Status:** Revision 2 (final) — approved concept of record; Showrunner re-approval issued 2026-07-15.

---

## LOGLINE

**A turn-based hex-grid car combat roguelite where every trigger pull is a spin on the Maybe — a gadget the show's own tinkerer built, rated a ten, and stored away, never knowing it's still running — and your whole build, crew, and legend exist to rig it.** Convoy inward from the Rim through regions that agree with you less and less, spend fuel and bullets you cannot replace mid-run, and come home to bank what lasts: research, reputation, and the ballads that make you harder to kill — and harder to be anyone else.

**Elevator comps:** *Into the Breach*'s readable hex tactics × *Slay the Spire*'s run structure × a slot machine that is secretly the physics engine — wearing *Mad Max*'s leathers.

---

## THE HOOK: THE MAYBE (Fay's shelved gadget, and the worlds it dreams)

Somewhere near the Answer sits a machine Fay Quist built years ago and put away: a three-reel contraption in a crate, tagged in her cramped handwriting with what it should do, what it actually did, and a ten. She nicknamed it **the Tumbler**; the wasteland's word for her inventions gives it its true name. It is **the Maybe** — not one of her maybes, *the* Maybe — and she has no idea it is running.

What it is doing, out there where the world is thin: **incepting bubble worlds — faithful, fleeting renditions of the wasteland — and staging carfights inside them.** Every battle in CARFIGHT TACTICS ADVANCED takes place inside one of those bubbles, and every contested action in the game — every shot, ram, stunt, gadget activation, and hazard save — resolves on the Maybe's reels, rendered big, loud, and tactile at the bottom of the touchscreen.

This is not a random-number generator with chrome on it. It is the franchise's core idea made mechanical. In CARFIGHT, what happens is what the situation most credibly *expects* to happen — an outcome shaped by you, by your machine, and by whatever the local world is currently willing to agree is true. The three reels are exactly that:

| Reel | Name | What loads it |
|---|---|---|
| Reel 1 | **CREW** | Driver and gunner stats, injuries, morale, confidence built this battle |
| Reel 2 | **MACHINE** | The weapon/part itself: grade, condition, maintenance history, provenance |
| Reel 3 | **WORLD** | The arena: how deep you are, local faction consensus, hazards, your ballads |

Each reel is a visible strip of symbol faces — **HIT, TRUE (crit), MISS, JAM, DRIFT (the world improvises), ECHO (your legend answers for you)** — and the mix of faces on each strip is built openly from your build and situation. A veteran gunner's CREW reel is mostly HIT. A rust-seized cannon's MACHINE reel is studded with JAM. A Rim arena's WORLD reel is boringly, beautifully honest. Deep arenas are not.

**Why this is diegetic, not decorative:** the Maybe shows you the situation's expectation as a physical object — and then lets you get your fingers into it. In the Rim, the reels are so heavily weighted they behave like dice you can read: tactics-game determinism, earned. Drive inward and the WORLD reel stops being polite. The reels aren't the game being random. They're the world agreeing with you — or arguing back — as rendered by the machine that dreamed the world up.

### What the frame buys (design problems the premise dissolves)

- **One resolution system, every region.** Every arena, from Crosshaul to the Blur, is rendered by the same machine — so everything spinning the same reels isn't an abstraction, it's the premise.
- **Runs are replayable and seedable, diegetically.** A bubble can be re-incepted from the same seed. Save-anywhere, seeded deterministic battles, and the async "beat my spin log" feature stop being conveniences and become what the Maybe *does*.
- **The Rim stays untouched.** These battles are not Rim events. Nothing impossible is ever asserted to have happened in the Rim itself — the bubbles merely render it. And the rendering is faithful: the Maybe draws the Rim as the Rim insists on being, so every Rim-honesty constraint below still binds, as fidelity law rather than loophole.
- **Legends can ride with you.** The series leads appear as recruitable renditions; roster permadeath never touches the show's continuity, because none of this ever "happened" to them.

### Only the maker knows

In-world, exactly one person is aware this machine exists — **Fay, who built it and stored it away** — and even she does not know what it is doing. No other character sees it, names it, or refers to it, ever. Crews inside the bubbles talk the way the Rim talks. (A Rim gunner wouldn't say any of the above. A Rim gunner would say: *some days the gun just knows.*) And the game never explains *why* the Maybe works. Not in tutorials, not in codices, not in marketing. The frame is a hook, not an answer.

**Reveal cadence (what the player knows, and when):**

- **At launch, told:** the premise above, and no more. The opening cinematic is a crate, a paper tag in Fay's handwriting (*should:* — *did:* — *10*), a hum, and a road appearing where there wasn't one. Marketing may state the hook at exactly this altitude.
- **At launch, discovered:** the machine's housing rewards attention — the stenciled nickname, the tag, the hum that syncs to the WORLD reel; phantom reels (below) physically accreting onto the machine are the player's slow evidence that the Maybe is *changing*; and Fay's recruit event is the game's single in-world brush with the frame — a rendition of the tinkerer noticing her own maker's-habits in the world's seams, a ten she once rated, a hum she almost remembers. Never named, never explained, once per player, in her voice.
- **Content seasons:** each region drop adds one deliberate "seam" — a place the rendering briefly shows its hand — deniable in shallow bands, louder inward, always unexplained.
- **Withheld, sealed with the show:** why the Maybe works, why the bubbles form where they form, what waits at the Answer, and how the crate came to rest where it rests. The Court of the Answer tier keeps all of it.

### Rigging the Maybe (the actual game)

Player abilities are **reel manipulations**, spent from a per-battle resource called **NERVE** (the crew's banked confidence — earned by landing hits, executing clean maneuvers, and crew synergy; drained by taking cabin hits and watching allies wreck):

- **HOLD** — lock one reel on its current face before the spin. The signature verb. Cheap on CREW, pricier on MACHINE, expensive on WORLD.
- **NUDGE** — after the spin, bump one reel a single face. The clutch save.
- **DOUBT** — the counterspell. Force an *enemy's* spun reel to respin. Skeptic drivers are walking DOUBT batteries; this is the crew's cynic as a siege weapon, straight from franchise canon.
- **CALL IT** — declare the full result before spinning. If the spin matches, the effect doubles and the crew banks NERVE. If it misses, you eat a morale hit. Confidence is power; bravado is a loan. A successful CALL IT in a witnessed arena also drafts a premium ballad verse — declared shots are exactly what singers sing about.
- **LOADED ROUNDS** — pre-run bench-crafted ammo physically adds guaranteed faces to the MACHINE reel for that magazine. You built certainty at the workbench; now you spend it one round at a time.

The name is the fantasy: the whole game is taking a *maybe* and rigging it into a certainty, one spin at a time.

Three-symbol combinations matter: **HIT-HIT-HIT** is a clean kill on the targeted component; any **TRUE** upgrades the address (armor plate → the part behind it); **DRIFT** results pull from a per-region table of the local world's "improvements" to your intent; triple **ECHO** means the ballads take over — your legend performs its most famous verse, whether or not that's what you ordered.

**Depth changes the reels, not the rules.** Two constraints hold the starting band honest, and both are load-bearing design — the Maybe renders the Rim as the Rim insists on being:

- **In Rim arenas, DRIFT results are strictly plausible.** Ricochets, mechanical flukes, fire finding a fuel spill, weather, a timetable betraying you — never anything a Rim crew couldn't shrug off as a bad day. Stranger DRIFT tables begin in the Drift band and compound inward.
- **In Rim arenas, ECHO is social, not physical.** A sung crew makes enemy gunners hesitate (initiative and morale penalties), rattles NERVE, and moves prices — the things reputation plausibly does to people. From the Drift inward, ECHO faces manifest in full on the grid: cross the line and discover your legend arrived ahead of you.

**One rulebook, every depth.** In Rim arenas the Maybe is ~90% deterministic and plays like a crisp tactics game. By the Blur, the WORLD reel is a carnival. Nothing about the rules changes — only how much the world argues back. That is the franchise thesis as a difficulty curve.

### Phantom Reels (the machine grows)

As the player acquires weirder equipment, weirder crew, and drives deeper toward the Answer, **additional narrow reels stack onto the sides of the Maybe** — visibly bolting onto the housing in the UI, one more thing the machine wasn't built with and has anyway. Phantom reels add new *types* of strange effect. They never touch accuracy.

**What slots them in — three sources, one active reel each:**

- **Gear:** mounting inward salvage of Churn-or-deeper provenance (or any Unsettled piece) docks a **QUIRK reel** carrying that item's behaviors — discovered and not. Example faces: *SPARK* (the arc-caster chains one extra hex), *SPLASH* (borrowed physics leaks into your next movement spin), *VEIL* (an undiscovered quirk: its category is disclosed pre-spin, its effect revealed the first time it lands, and legible forever after).
- **Crew:** fielding a sung driver (3+ ECHO faces) or an inward-born recruit docks a **RUMOR reel** built from their ballads. Example faces: *VERSE* (the song performs — a famous stunt fires as a free action, the song's way), *MISQUOTE* (a sung-wrong verse performs instead; see ballad curation — pruning your legend prunes this reel).
- **Depth:** Churn and Blur arenas dock a **region reel** on entry — the DEBT reel on the Weighed Roads (*TALLY*, *COLLECTOR*), the CHIME reel in the Hourglass Terraces, the HUSH reel in the Quiet's arenas — the ruling creed as physical machinery.

**How rigging reaches them:** HOLD and NUDGE work on phantom reels at +1 NERVE. **DOUBT gains its second canon-perfect use:** a Skeptic may **REFUSE** one phantom reel per battle — the reel locks to its blank face; the crew's cynic simply declines to believe in the extra machinery. CALL IT may optionally include phantom faces in the declaration: bigger doubling, bigger morale bite, and the most premium verse drafts in the game.

**The readability guardrail (the honest spin survives, by construction):**

- **The accuracy firewall:** hit or miss is decided by the core three reels alone, always. Phantom reels decide *what else becomes true*, never *whether you connect*. A player who ignores every phantom reel can still read their to-hit at a glance.
- **Hard caps:** at most 2 phantom reels active at launch, 3 ever. Phantom reels are narrower and peripheral on screen; the core three always dominate.
- **Every phantom face is inspectable pre-spin**, allies' and enemies', same as every other face. VEIL faces disclose their category up front and are the game's *only* sanctioned mystery — bounded, priced, and permanent-legible once witnessed.
- **Phantom reels stay furled in Rim-band arenas** — docked, dark, inert. The Maybe renders the Rim honest, so the strange machinery keeps out of it.

Diegetically, nobody knows why the machine grows. Least of all its maker.

### The reel grammar (how every mechanic speaks one language)

Because all probability lives on visible reel faces, every system in the game expresses itself the same way, and the player audits all of it by eye:

- **Buffs add faces; debuffs add faces.** A "Steady Hands" buff is +2 HIT on CREW. A cracked optic is +2 MISS on MACHINE. Suppression is +1 DOUBT-trigger on CREW. There are no invisible modifiers anywhere in the game.
- **Condition is legible.** As a part's Condition drops, JAM faces visibly accrete on its strip. The player watches their cannon get unreliable one face at a time, and watches a garage service scrape those faces back off.
- **Regions edit the WORLD reel on entry.** Loading into Verdance visibly slots green DRIFT faces into everyone's WORLD strip. The loading screen *is* the difficulty disclosure.
- **Ballads are gold faces — from the Drift inward.** ECHO faces gleam on the strip, and the player can always see exactly how famous they are, and exactly how much of their reel no longer entirely belongs to them. In Rim arenas the gold stays off the reels and shows up where Rim fame lives: in enemy nerves, hiring prices, and who flinches first.
- **Enemy reels are open.** Tap any hostile before it acts and inspect its strips — phantom reels included. Reading the enemy's reels is scouting; changing them (DOUBT, suppression, dazzle rounds, called shots to optics) is the second layer of the tactics game.
- **Phantom reels obey the grammar.** Extra reels may add consequence; they may never add hidden math.

---

## PILLARS

1. **The spin is honest.** No hidden dice, ever. Every probability is a visible face on a visible reel, and every buff, part, ballad, and region is legible as faces added or removed. Phantom reels obey the same law: extra reels add consequence, never accuracy and never hidden math. If a designer can't express a mechanic as reel faces, it doesn't ship.
2. **Everything is counted.** Fuel, ammo, hull, NERVE. Scarcity is Rim physics, not a difficulty slider. Reloading is a turn. The reserve tank is a ceremony.
3. **Physics is a promise the world keeps — until it doesn't.** Momentum, turn radius, and mass are honest, learnable movement rules in the Rim, and they are the first thing each deeper region renegotiates. Mastery of movement is mastery of the game.
4. **Your legend fights beside you, then speaks over you.** Ballads are the meta-progression: fame is armor, and it is a trap, and both halves are mechanical.
5. **Touch-first, session-honest.** One battle = one bus ride (6–12 minutes). A full run = an evening (60–90 minutes across resumable battles). No mechanic requires precision a thumb can't deliver.

---

## CORE LOOP

**Minute (one turn):** Read initiative → move on the hex grid under momentum rules → position facings → commit actions → spin, rig, and ride the Maybe → watch damage land on specific plates and parts.

**Session (one battle, 6–12 min):** One arena, one objective (duel, convoy breach, toll-run, salvage snatch, hazard survival). Battles end decisively: stop, submission, escape, or wreck. Resumable at any turn — a mobile mandate, and diegetically free: a bubble holds its breath as long as it's asked to.

**Run (roguelite, 60–90 min, 6–10 battles):** Outfit a convoy at a Rim garage — frames, mounts, fuel load, hand-loaded magazines. Drive inward along a branching region map. Every battle and every kilometer spends fuel and ammo that do not come back mid-run; wrecked cars stay wrecked; salvage rides in your (finite, weighted) beds. Push deeper for inward salvage and richer song material, or turn for home while you still have the fuel to get there. A run ends at a home garage — or wherever the wasteland says it does. **The road home is the boss fight:** heavy, damaged, low, and carrying things worth killing for.

**Meta (between runs):** Three things survive a run, win or lose:
- **RESEARCH** — teardown of recovered salvage unlocks new mounts, frames, and reel-manipulation techniques.
- **REPUTATION** — per-faction standing that opens arenas, contracts, prices, and patronage (always with strings).
- **BALLADS** — the big one. See Economy. Your deeds become verses; verses become permanent reel faces; the songs start deciding who you are — and Broadsides carry them out of the game entirely.

---

## COMBAT TURN ANATOMY

### 1. Initiative — the Grid Heat order
Initiative = **Driver Nerve + car Responsiveness (power-to-weight, suspension, tire class) ± buffs/debuffs**, recomputed each round so injuries, engine damage, overload, and morale reorder the queue live. A motorbike outruns the queue; a fortress-rig moves last and doesn't care. Some abilities trade reel faces for initiative ("Redline: +3 initiative this round, add one JAM face to your engine's MACHINE reel"). Initiative is where buffs and debuffs bite first.

### 2. Movement — momentum on hexes
The tactical spine. Every car carries **velocity as a stat** (hexes/turn) with facing on the six hex directions:

- **Acceleration/braking caps** per turn come from engine output vs. total mass (armor, cargo, and overload all count — overloaded frames accelerate like apologies).
- **Turn radius:** facing changes cost forward hexes scaled by current speed and handling — a bike pivots in one hex at speed 2; a semi at speed 6 needs a county. Fast is a straight line. Slow is an option.
- **Momentum carries between turns.** You do not stop because your turn ended. Half the puzzle of every battle is arriving at the right hex *at the right speed with the right facing*, because...
- **Facing is armor.** Damage addresses plates by facing (nose/flank/tail/turret skirt). Crossing an enemy's tail at speed is the game's fundamental scoring position.
- **Stunts** (handbrake turns, drift-slides, ramps, deliberate sideswipes) are movement actions resolved on the Maybe — driver skill loads the CREW reel, suspension loads MACHINE, surface loads WORLD. A held HOLD on a bootlegger reverse is the most stylish thing a thumb will do all week.
- **Ramming** ("the last word"): damage scales with closing speed and mass differential; the attacker spins their own suspension save. Bikes do not ram semis. Semis barely notice.

### 3. Actions — spins on the Maybe
Each car takes 1–2 actions (fire a mount, activate a gadget, reload, brace, crew-swap, repair-in-motion). Each contested action builds its reels on screen — the player sees exactly what they're spinning and why — then spends NERVE to rig, spins, and resolves. Damage lands on specific plates and parts: kill wheels to strand, kill the gunner to silence a turret, kill the engine to end a pursuit. Killing downed drivers is possible, catastrophic for reputation, and permanently sung about. There are no health bars. There are addresses.

### A turn in play (worked example, 40 seconds of thumb time)

> **Round 3, Sparkwell Fields.** Initiative queue re-sorts: your bike jumped two slots (enemy hauler took an engine hit last round). You tap the bike — its move fan blooms: at speed 5 it can reach the flare-stack ridge but only arrive facing north-east. You drag the path through a spill hex (risk: fire) to shed one speed, arriving flank-on to the enemy Runner's tail. Confirm.
>
> Action: fire the bike's single mount, a bench-loaded carbine. The Maybe slides up. **CREW** strip: 7 HIT / 2 MISS / 1 TRUE — your duelist is good. **MACHINE**: 6 HIT / 1 JAM / 3 LOADED (guaranteed) — you built this magazine at the bench. **WORLD**: 8 honest faces, 2 DRIFT — Sparkwell is Rim, but you're standing in a fuel spill and fire has opinions. No phantom reels: this is the Rim, and the machine keeps its strange parts furled here. You spend 2 NERVE to HOLD the MACHINE reel on a LOADED face. Swipe. CREW lands TRUE, WORLD lands HIT: **TRUE-LOADED-HIT** — the shot upgrades past the tail plate into the fuel tank. The Runner starts leaking drops onto the grid, one hex per turn.
>
> Now the fuel line you're both parked near is a shared clock, the enemy's next move fan is shaped by a tank it can't stop leaking, and your gunner banked 1 NERVE for the clean call. Next unit in the queue.

That's the whole game in one turn: momentum math you can plan, a spin you can read, a rig you chose to pay for, and consequences that live on the grid.

---

## DRIVERS & CREW (the other half of the build)

Cars don't spin reels; people do. Every vehicle fields a **driver** and, on larger frames, **crew seats** (gunner, mechanic, spotter). People carry the stats that load the CREW reel and the abilities that rig it:

- **Nerve** (initiative + NERVE generation), **Hands** (movement/stunt faces), **Eye** (attack faces), **Grit** (injury resistance, morale).
- **Temperaments** shape rigging style: a *Zealot* HOLDs cheap but may refuse to DOUBT; a *Skeptic* is a DOUBT battery, caps CALL IT, and is the only temperament that can REFUSE a phantom reel; a *Showboat* earns double NERVE from stunts and feeds the ballad economy. Temperament vs. region matters — Skeptics are gold in the deep bands and merely rude in the Rim.
- **Injuries are persistent debuffs** (a winged gunner adds MISS faces until rested at a settlement), and **death is permanent**. Between runs, drivers heal, train, and — if the ballads name them — start developing ECHO faces of their own, and eventually enough legend to dock a RUMOR reel. Famous drivers are stronger and less obedient, which is the theme, priced.
- Frame pairing is real strategy: a Longhaul with a full four-seat crew is a rolling committee of reel manipulations; a Spoke is one perfect nerve and no backup.

**Canon cameos:** the series leads — **Fay, Angelo, and Dess** (the road knows them as TINKERTECH, GEARHEAD, and GUNBUNNY) — appear as rare recruitable legends: renditions inside the bubbles, which is why the show's continuity never bleeds. Their kits are their characters: Dess is the game's deepest DOUBT battery and its most expensive CALL IT (she doesn't call shots she hasn't already made), and the one recruit who can REFUSE two phantom reels — the machine's extra parts simply do not impress her; Angelo's maintenance aura sheds JAM faces from every Kept part in the convoy; Fay's gadgets run hotter and stranger than their labels, in both directions — and her recruit event is the game's single in-world brush with the frame (see the Hook). Recruiting all three onto one crew is the endgame flex the community will chase.

---

## VEHICLE FRAMES & BUILD RULES

Frames span the full range, each a different answer to the mass/momentum/initiative triangle:

| Frame class | Examples | Identity |
|---|---|---|
| **Spoke** | Motorbike, trike | 1 hardpoint, absurd initiative and turn radius, dies to weather. The scout and the knife. |
| **Runner** | Muscle car, buggy | Fast, 2 hardpoints, the duelist chassis |
| **Pursuit** | Interceptor, war-sedan | Balanced, duel-legal, the classic CARFIGHT silhouette |
| **Hauler** | Pickup, box truck | Cargo bed = the run's wallet; mid armor |
| **Longhaul** | Semi-tractor + trailer | Multi-section on the grid (tractor and trailer articulate across hexes; jackknifing is a real failure state and a real stunt), massive weight load |
| **Bulwark** | Salvaged tank, armored crawler | Tracked: ignores turn-radius rules, crawls, shrugs rams, drinks fuel like grief |
| **Kite** | Ultralight, rocket-glider, autogyro | Inward salvage, flown in Drift-band arenas and deeper only — haul one out to the Rim and it simply will not fly; the sky is not load-bearing out here, and the bubbles render that faithfully. Occupies the air layer: immune to ground hazards and rams, capped altitude, fragile, lands to reload, and goes soft faster than anything else you can own |

Every frame defines: **engine class, suspension, tire type, armor plate points, hit locations, hard points (1–6), power bus (charge/turn), fuel tank, and max weight load + overload band.** Overloading is legal and priced: initiative and acceleration penalties, suspension wear, and one added JAM face on movement spins per overload step.

**Builds are triple-budgeted:** every mount and gadget draws **weight** (vs. load), **power** (vs. the engine's charge bus per turn), and **ammo** (finite, loaded pre-run, counted per round). A build that closes all three budgets with room to spare is a build that comes home.

Every part carries **Grade** (engineering quality), **Condition** (wear, visible as JAM faces), and **Provenance** (where it's from and who has kept it). Parts you maintain across runs earn the **Kept** status — fewer JAM faces, better resistance to the deep's reinterpretations. Fuel is measured in **drops**, which is also what money is called where the Derrick Barons set prices; spending it and saving it are the same decision.

Because this is a tactics roguelite, the player fields a **stable of cars and drivers**, not one hero rig: losses must be survivable, rosters must rotate, and every garage slot is a story you're either building or mourning.

---

## ARSENAL PHILOSOPHY: CONVENTIONAL VS. INWARD-SALVAGE

**Two arsenals, one law: provenance is destiny.**

- **Rim iron** (machine guns, cannon, harpoons, rams, mortars, mines, flame): reliable, ammo-hungry, honest. Its MACHINE reels are clean and its faces are earned at the workbench. Rim iron never surprises you, which — deep inward — becomes its superpower.
- **Inward salvage** (the sci-fi shelf: arc-casters, grav snares, phase claddings, the wasteland's "maybe" gadget tradition — the same tradition the resolution device itself comes from): never manufactured, only recovered on runs, and it *remembers where it's from*. Every inward piece carries a **provenance depth** and a hidden **quirk** discovered through play (double-edged, always thematic). Deep-provenance and Unsettled pieces dock QUIRK phantom reels when mounted — the strange arrives with its own machinery. Inward gear is spectacular and it **goes soft** — the travelers' word for the day your trusted gear starts obeying the neighborhood instead of the label. Carry it too long, too deep, or into a region that flatly disagrees with it, and its MACHINE reel visibly sprouts DRIFT faces. Well-kept gear goes soft slower — maintenance is love, and love is armor.
- **The settling rule:** freshly recovered inward salvage is **Unsettled** for a stretch after recovery — Rim custom says nine days in an iron shed, and Rim custom is not always consulted. Mount it now and it's stronger and stranger (extra TRUE faces, extra DRIFT faces, and a QUIRK reel regardless of depth); let it settle in the garage and it becomes a lawful, known part. The forbidden fruit, ported straight into a roguelite pick-up decision.
- **No free technology.** There is no research path that manufactures sci-fi. Research only teaches you to *understand, maintain, and rig* what the deep gives up. The Rim's consensus builds engines and bullets; everything else is borrowed, and the world charges interest.

All equipment obeys the world's rules: nothing works everywhere, nothing exotic is mass-producible, ammo in the Rim is scarce because everyone knows ammo is scarce, and the most trustworthy gun in the deep is the one you've cleaned two hundred times.

### Sample shelf (illustrative, not exhaustive — the GDD owns the tables)

| Item | Origin | Draws (weight / power / ammo) | Reel signature |
|---|---|---|---|
| Belt-fed rotary gun | Rim iron | Heavy / low / hungry | Wide HIT strips, heat adds JAM per sustained burst |
| Harpoon & winch | Rim iron | Mid / mid / 3 bolts | On HIT, tethers hexes — momentum rules now shared |
| The long rifle | Rim iron | Light / none / counted singly | One spin per round; LOADED faces only; converts WORLD DRIFT faces to MISS — the deep can't reinterpret a round this well known, but it can still refuse it |
| Shaped ram prow | Rim iron | Very heavy / none / none | No spin to attack; defender spins the save |
| Arc-caster | Inward salvage (Drift) | Mid / high / none | Chains between wet/metal hexes; quirk discovered in play |
| Grav snare | Inward salvage (Churn) | Light / very high / 2 charges | Nulls a target's momentum for a round; docks a QUIRK reel whose SPLASH faces bleed borrowed physics into *your* next movement spin |
| Phase cladding | Inward salvage (Churn) | Light / high / — | One incoming TRUE per battle downgrades to HIT; goes soft two runs faster than anything else you own |
| The loud speaker | Inward salvage (Signal Coast) | Mid / mid / — | Drift-band and deeper: broadcasts your ballad mid-battle — +1 ECHO to allies, +1 ECHO to *enemies who've heard of you* |

---

## ARENAS BY REGION (Physics Twist + Signature Hazard)

Arenas are the TV show's regions and settlements — as the Maybe renders them — ordered along the world's bands: **Rim → Drift → Churn → Blur**. Physics reliability degrades inward — concretely, the WORLD reel gains wild faces, Churn-and-deeper arenas dock a region phantom reel, and each region rewrites one movement or resolution rule to match its ruling faction's creed. In Rim arenas every twist and hazard stays strictly plausible; the strange starts past the line. One line each:

| Arena | Band | Faction | Physics twist | Signature hazard |
|---|---|---|---|---|
| **Crosshaul Interchange** | Rim | Toll Council | Baseline physics, played utterly straight | Live convoy traffic and toll gates that open/close on a posted schedule — the timetable is the hazard |
| **Sparkwell Fields** | Rim | Derrick Barons | Fuel is combat-legible: leaks, spills, and spray are grid objects | Flare stacks and shootable fuel lines; fire spreads along spill hexes; free fuel pickups that are never actually free |
| **Creed Reaches** | Rim edge | The Piston Creed | Wreck-relic hexes grant Creed units eerie initiative | Ancestor-cars: driverless shrine vehicles, always facing inward, never explained — and never seen moving. They are simply elsewhere when you look back |
| **Mileage Longways** | Drift | The Mileage | Soft distances: map edges wander; the route hex-count changes with your convoy's confidence (NERVE) | Mile-markers that don't reconcile — objective hexes drift each round until "pinned" by a rider's spin |
| **Boneyard Tiers** | Drift | Boneyard Sovereignty | Grave-quiet: loud actions (autofire, rams) add DOUBT faces to your own next spin | Wreck-stack collapses; salvage hexes that are also somebody's tomb, and the Sovereignty keeps score |
| **Verdance Aisles** | Churn | The Root Judges | The green prunes machines: exposed metal loses Condition every round spent off the old roads | Judge-vines that grapple and *disassemble* (not destroy) mounted gear; the roads stay real because even the green believes roads go somewhere |
| **Signal Coast Relays** | Churn | The Networks | Broadcast buffs are auctioned: mid-battle, towers sell WORLD-reel faces to whichever side pays reputation | Echo-light — enemy silhouettes show where you *expect* them for a beat before they are where they are; trust the reels, not your eyes |
| **Hourglass Terraces** | Churn/Blur | The Hourglass Cities | Physics runs on recitation: the CHIME phantom reel mutates movement and resolution rules on a strict, visible metronome cycle | The Chime — every N rounds the arena re-rules itself on schedule; survivors are the ones who kept count |
| **Weighed Roads** | Blur approach | Order of the Weighed Heart | Nothing here is haggled for free: the DEBT phantom reel tallies every HOLD, NUDGE, and DOUBT you spend as visible Debt | Debt collectors — retribution strikes that target whoever has bent the battle most |
| **The Hush** | Blur | The Quiet | Reel faces go blank in silence zones; blank faces resolve as *nothing happens*, the scariest result in the game | Expanding hush fronts that mute engines, guns, and gadgets alike; the exit is wherever someone still believes out loud |
| **The Penance Roads** *(post-launch drop; working name)* | Churn | An unmapped enclave | Machines run only when formally forgiven: unforgiven engines don't break, they *refuse* | Absolution checkpoints mid-battle — skip the rite and watch your MACHINE reels sulk |
| **Court of the Answer** *(final run tier)* | Blur/deepest | *Withheld* | The WORLD reel is wider than the screen | Withheld for the GDD — final-tier content, and the pitch keeps the show's secrets. The frame's withheld questions live here too |

Design rule for all arenas: **the old highways stay honest.** On-road hexes are always the most physics-stable ground in every region, at every depth. Leaving the road is always a choice with a price. This is the franchise's oldest promise, kept in level design — and kept by the rendering.

---

## RUN STRUCTURE & ECONOMY

### Anatomy of a run (the map between battles)

A run is a branching node map drawn as a road chart, oriented **inward**:

1. **Rollout (Rim garage):** pick a contract (the run's spine and payout), pick a convoy (1–4 cars within a caravan weight budget), load fuel and bench ammo. Overpacking costs drops every kilometer; underpacking costs options every battle.
2. **The road in (nodes):** each node is a battle arena, a waystation (barter, patch repairs, rumors), a hazard crossing (resolved as convoy-scale spins on the Maybe), or an **event** written the way the Rim talks. Deeper columns of the map pay better and agree with you less.
3. **The turn decision:** the map has no forced end. Every node shows the fuel arithmetic home. Turning back early is always legal, always solvent, and always a little quieter in the ballads.
4. **The road home:** the map re-runs in reverse with your haul aboard — heavier, hotter, hunted. Inward salvage in the beds adds DRIFT faces to convoy hazard spins until you're back in shallow bands. The richest haul makes the loudest target.
5. **Homecoming:** sell, settle (or don't), research, commission ballads, press Broadsides, bury or promote drivers, next contract.

**Within a run (scarcity):**
- **FUEL (drops):** the map currency. Every region traversal, every battle round at high throttle, every retreat burns drops. Fuel is also money in the Rim — literally the same word — so spending it and saving it are the same decision. Dry tank = stranded convoy = the run's worst ending, on purpose.
- **AMMO:** loaded at the bench before rollout, counted per round, per weapon, never abstract. Bench-loading is the pre-run ritual where the player buys MACHINE-reel certainty one cartridge at a time. Mid-run resupply exists only as loot, barter, and bad ideas.
- **SCRAP & FIELD UPGRADES:** battle salvage buys patch-repairs and temporary mounts at mid-run waystations. Nothing bought mid-run outlives the run except what you haul home.

**Between runs (persistence):**
- **RESEARCH:** teardown of hauled-home salvage. Unlocks frames, mounts, bench recipes, and new reel-manipulation techniques — including phantom-reel handling. Research cost scales with provenance depth — understanding the deep is expensive because it should be.
- **REPUTATION:** per-faction ledgers moved by contracts honored, duels fought clean, drivers spared, and cargo choices. Reputation opens arenas, prices, and patron offers (subsidized fuel, exclusive mounts — always with faction strings and always refusable).
- **BALLAD-MAKING (the crown jewel):** after each run, the game drafts **verses** from your actual deeds — the recorded spins, stunts, kills, mercies, and called shots. The player spends earnings to **commission ballads**: choosing which verses get sung, in which settlements, by which faction's singers. Sung ballads become permanent **ECHO faces** on your reels — fame is armor, mechanically. In Rim arenas that armor works on people: hesitation, morale, prices, who flinches first. From the Drift inward it works on the grid, and the player crosses the line to discover their legend got there ahead of them. **And fame is a trap, mechanically:** every ballad also hardens expectation. Sing enough verses about your rams and the world starts expecting rams — enemies armor their tails, and your triple-ECHO results perform the *song's* version of you, even when you'd written a smarter plan. Sing a driver famous enough and their RUMOR reel docks itself. Factions can also **sing you wrong**: a rival balladry publishes a false verse, handing you an ECHO face you never earned, a MISQUOTE face on your RUMOR reel, and a run objective to live it down. Late-meta play is ballad *curation* — pruning your own legend, buying counter-songs, deciding which of your true stories can afford to be famous. The wasteland listens to stories. Rim singers wouldn't ask why. (Presented in-world as pure reputation economics; the game never explains why the songs work.)

### BROADSIDES (the share feature — your legend, pressed and posted)

Singers press broadsides; so does the game. Any commissioned verse, famous spin, or fallen driver's epitaph can be pressed into a **Broadside** — a shareable card or short replay clip, composed in the settlement singer's style, built to leave the game:

- **What a Broadside shows:** your liveried cars in the deed's key frame (every cosmetic — livery, plate-paint, crew portraits, garage trim — is exactly what a Broadside displays; the reskin economy exists to be *seen*, and this is where it's seen); the spin that made the verse, rendered as the actual reel result (a witnessed triple-TRUE CALL IT is the game's rarest flex, and now it's a post); and the verse itself — run epitaphs for wrecked convoys included, because the worst runs make the best ballads, and now the best posts. One house rule from the singers themselves: the Boneyard style never depicts the dead or their machines — epitaphs pressed in that style are verse and chalk-white ornament only.
- **The firewall holds:** Broadsides display reels; they never touch them. Sharing confers no gameplay currency, no reel faces, no odds — nothing but the showing-off. Cosmetics remain the only thing money buys, and Broadsides are why they're worth buying.
- **Spoiler discipline is pipeline law:** Broadside verses compose from a curated, canon-reviewed string set — the same reviewer gate as all localization; generated content may reference only publicly shipped regions and hazards; reserved language never enters a template; and the frame premise appears in shares only as the approved hook copy, never as generated text. Court-of-the-Answer content does not press.

**Failure is a verse, not a wall:** a wrecked run loses cars, cargo, and fuel — never research, reputation, or songs. The worst runs make the best ballads, and the game says so.

---

## CAMERA & TOUCH UX (Isometric Hex on Mobile, Godot)

- **Isometric camera, player-owned:** pinch to zoom (three detents: cinematic / tactical / overview), two-finger rotate with snap to the six hex-facing angles so plate facings always read at a glance, one-finger pan. Double-tap any unit to frame it.
- **Touch-first turn grammar:** tap unit → momentum-legal move fan renders instantly (reachable hexes, arrival speed, arrival facing color-coded) → drag along the fan to shape the path → release to preview → tap-confirm. No gesture requires precision under 44px; everything destructive is two-step confirm.
- **The Maybe as bottom sheet:** action resolution slides up as a thumb-zone panel — reels big enough to read, HOLD/NUDGE/DOUBT as buttons under each reel, spin by swipe (with an auto-spin toggle, because commutes). Phantom reels dock visibly onto the machine's flanks, narrower by design, so the core three always own the center. The whole hook lives where the thumb lives.
- **Godot fit:** 2D isometric with pre-rendered 3D vehicle sprites (8 facings × damage states) — Godot's 2D pipeline, TileMap layers, and shader stack handle this natively and cheaply on mid-tier phones; the Maybe is a Control-node UI scene (phantom reels are child scenes that dock at runtime), trivially portable to tablets. Deterministic, seeded, replayable battle logic is the vertical slice's first milestone — it is the foundation of save-anywhere, of async challenge features, and of Broadside replay clips, and the frame narrative makes all three diegetic.
- **Session honesty:** save-and-exit any turn, battles sized for transit rides, aggressive battery posture (30fps cap out of combat, no always-on particles), and full offline play for the core run loop. Broadside pressing queues offline and posts when a connection exists.

---

## SCOPE GUARDRAILS (Mobile Roguelite, Say No Early)

- **Launch grid:** ~10–12 arena maps across the first **five** regions (Crosshaul, Sparkwell, Creed Reaches, Mileage, Boneyard). Churn and Blur regions ship as content updates — the roguelite structure is built for seasonal region drops, coordinated with the show's map reveals.
- **Launch garage:** 5 frame classes (Spoke, Runner, Pursuit, Hauler, Longhaul). **Bulwark and Kite are fast-follow** — the air layer and tracked rules are real systems work and must not hold the core hostage.
- **Battle size cap:** ≤ 6 player units vs. ≤ 8 hostiles. Readability and turn time beat spectacle on a phone.
- **Phantom reel cap:** max 2 active at launch, 3 ever; gear- and crew-sourced reels launch, region reels arrive with their Churn regions. The accuracy firewall is permanent.
- **One resolution system.** Everything spins the Maybe — no side minigames, no second combat mode, no on-foot layer at launch. (The frame makes this literal: there is only one machine.)
- **No multiplayer at launch.** Seeded async challenge runs ("beat my spin log") are the cheap, on-theme PvP-adjacent feature for later — and Broadsides are their marketing channel.
- **Broadsides at launch: static cards.** Replay clips fast-follow. The canon-review template gate is launch-blocking; the feature does not ship without it.
- **Monetization firewall (franchise policy for this title):** premium or cosmetic-only. A game whose hook is a slot machine must be untouchable on gambling optics: **no real-money purchase may ever add, remove, or weight a reel face — on any reel, core or phantom.** Cosmetics exist to be shown off, Broadsides exist to show them off, and neither ever touches a spin. Written in ink.
- **Canon gate:** all region flavor text ships at the altitude the Rim talks at; the localization pipeline gets a franchise canon-reviewer gate; the Broadside template set passes the same gate; unexplained hazards stay unexplained — no codex entries, achievement names, or patch notes that wink at them; and the frame premise is stated only at hook altitude, never explained.

---

## RISKS & MITIGATIONS (named now, so the greenlight is honest)

- **Gambling optics.** A slot machine hook on mobile will draw scrutiny from platforms, press, and ratings boards. Mitigation: no real-money interaction with reels, ever, core or phantom (see guardrails); all odds fully visible pre-spin (the anti-slot-machine slot machine — a fairness disclosure most tactics games don't offer); rating submissions framed around "visible probability manipulation," which is our genuine design truth.
- **RNG resentment in a tactics audience.** Tactics players hate coin-flip losses. Mitigation: Rim determinism (~90% locked faces early), all randomness pre-disclosed, and every rigging tool the game sells the player is a tool for *deleting* variance. The fantasy is beating the house, and the design keeps that promise.
- **Reel sprawl.** Phantom reels are the feature most likely to erode the honest-spin pillar through sheer accumulation. Mitigation: the accuracy firewall (core three decide hit/miss, always), the hard cap of 2–3, peripheral screen placement, Rim furling, and a standing kill rule — any phantom reel that playtests as "noise you learn to ignore" is cut, because a reel you ignore is a hidden modifier wearing a costume.
- **Spoiler surface area.** The frame premise and generated Broadside content both widen the canon gate's job. Mitigation: the premise ships at hook altitude only and is never explained anywhere in the product; Broadsides compose exclusively from the canon-reviewed template set and reference only shipped content; the reserved-language check applies to every generated string; and the reveal cadence's withheld tier is contractual, not aspirational.
- **Turn-time bloat on mobile.** Enemy phases and reel ceremonies can drag — and phantom reels add faces to the ceremony. Mitigation: battle size caps, parallel enemy resolution animation, phantom reels resolve simultaneously with the core spin (one swipe, one result), auto-spin toggle, and a hard internal budget — median player turn under 30 seconds, full round under 90.
- **Scope gravity.** Seven frame classes, twelve regions, an air layer, and a share pipeline is a AAA menu on a mobile budget. Mitigation: the launch guardrails above are the contract, not a wish — five regions, five frames, one resolution system, cards before clips.

---

## AUDIENCE & POSITION

- **Primary:** the franchise's core gearhead demographic (16–30) on the platform they actually carry — deep buildcraft, skill expression, short honest sessions.
- **Secondary:** mobile tactics/roguelite players (*Into the Breach* mobile, *Slay the Spire* mobile, *Warbits*, auto-battler graduates) who have never seen the show; the Maybe is a marketable hook in a screenshot and a 15-second clip — and now every player presses those clips themselves.
- **Transmedia function:** the game is the franchise's *hands-on lore instrument*. The frame premise gives it a canonical seat at the table — a story the show will never tell but quietly owns. Regions ship as content seasons that can track the show's map reveals; ballads give community marketing an in-world voice ("this week the wasteland sings about...") and Broadsides put that voice in players' own feeds; and nothing in it spoils what the show hasn't aired.

---

## WHY THIS GAME, WHY NOW

The TV series sells the world's question; this game hands the player the lever. A game can do what a show cannot: let the player feel the world agreeing — and arguing back — every single turn, under their thumb. The Maybe is a franchise hook no competitor can copy without our canon to justify it — it is literally a canon character's gadget, dreaming carfights she doesn't know about — the hex-momentum layer gives it tactics-genre depth, the phantom reels give the deep game a visible, growing strangeness that never betrays the honest spin, and the ballad economy turns retention mechanics into the IP's actual theme: you are what the wasteland sings about you. Now with Broadsides, so is your feed. It fits a phone, it fits a commute, and it fits the world.

---

*End of concept pitch. Full GDD (systems math, reel-face tables, phantom reel specs, arena specs, economy tuning, Broadside pipeline, Godot technical plan) follows under the approved vocabulary, pending Showrunner re-approval of this revision.*
