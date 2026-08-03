# NEON DESCENT — Art Direction & UI Layout

**Version:** 0.1 (pre-prototype, for review)
**Companion docs:** [DESIGN.md](DESIGN.md), [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 0. The one rule

**Every actor must be identifiable in silhouette, at 1× scale, against a busy floor, on a phone
held at arm's length.**

Everything below is in service of that. When a rule here conflicts with looking cool, this rule
wins — a game where you die because you misread a sprite is not atmospheric, it's broken.

---

## 1. Palette — SPRAWL-36

A 36-color master palette, organized as eight ramps. **No color outside this list ships**, and
the build fails if one does (ARCHITECTURE.md §9). 16-bit-era discipline is not nostalgia here —
a hard color budget is what forces sprites to read as a set rather than a pile.

### VOID — shadow, unexplored, letterbox
`#05030d` `#0d0a1f` `#171236` `#241a52` `#33266f`

### STEEL — architecture, floors, walls, machinery
`#14161f` `#23283a` `#3a4257` `#566076` `#7c869c` `#aab4c7`

### FLESH — human actors
`#3d1c2b` `#6e3342` `#a85a5c` `#d68d76` `#f0c3a4`

### CYAN — interface, data, terminals, loot glint
`#06323f` `#0c6f80` `#1fc3d6` `#7df2ff`

### MAGENTA — neon signage, the player's accent
`#46082f` `#9b1067` `#ee2b8e` `#ff8ecd`

### ACID — hacking, ICE, POWER, toxicity
`#0b3418` `#1c8038` `#46dc63` `#b2ffbc`

### SODIUM — hazard light, fire, Act I ambience
`#45210a` `#9c5010` `#ee9320` `#ffcf78`

### BLOOD — damage, HP, alert
`#4a0510` `#c01228` `#ff3b52`

### LIGHT — text, speculars
`#e9f1ff`

### Color is semantic, not decorative

These meanings are fixed across the whole game. A player learns them once in Act I and relies
on them in Act III:

| Meaning | Color | Where it appears |
| --- | --- | --- |
| **You** | MAGENTA | Player sprite accent, your projectiles, your area indicators |
| **Threat** | BLOOD | Enemy outlines when hostile-and-aware, damage numbers, HP |
| **Data / hackable** | ACID | Hackable actors' glint, POWER meter, quickhack overlays |
| **Interactive** | CYAN | Terminals, doors, loot glint, all UI chrome and text frames |
| **Hazard (environmental)** | SODIUM | Fire, electrified floor, steam, Act I lighting |
| **Unknown / unexplored** | VOID | Fog, remembered-but-not-visible tiles at 40% |

**Never** use BLOOD for a non-threat or ACID for a non-hackable. The palette is a language.

### Colorblind mode

Threat state is *additionally* encoded by outline shape, never by hue alone: hostile-aware
actors get a 1 px dashed outline, hostile-unaware get solid, neutral gets none. Deuteranopia
and protanopia are the binding cases (BLOOD vs ACID collapse), and the dash pattern survives
both. Verified with a simulation pass over the atlas as part of the palette lint.

---

## 2. Screen layout — pixel-exact at 180 logical px wide

Coordinates are logical pixels. Multiply by 6 for a 1080p phone.

```
 x=0                                              x=180
 ┌──────────────────────────────────────────────────┐ y=0
 │ ▓▓▓▓▓▓▓▓▓▓▓▓▓ HP        ░░░░░░░░░░░░░ POWER      │  STATUS BAR
 │ ══════════════════ TRACE ════════════════════    │  h=34
 │ SUB-04              HUNT                 ¤1,240  │
 ├──────────────────────────────────────────────────┤ y=34
 │                                                  │
 │                                                  │
 │                MAP VIEWPORT                      │  11 × 13 tiles
 │             11 × 13 tiles @ 16 px                │  176 × 208 px
 │                x=2 .. x=178                      │  x margin 2
 │                                                  │
 │                                                  │
 ├──────────────────────────────────────────────────┤ y=242
 │ > The scav bleeds out.                           │  MESSAGE LOG
 │ > TRACE: HUNT. Sec-drones inbound.               │  h=22 (2 lines)
 ├──────────────────────────────────────────────────┤ y=264
 │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                   │  ACTION BAR
 │  │▓▓│ │▓▓│ │▓▓│ │▓▓│ │▓▓│ │≡ │                   │  h=52
 │  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘                   │  6 × 26 px, 4 px gaps
 │  MONOWIRE                          ·· 12/24      │
 └──────────────────────────────────────────────────┘ y=316
```

**Status bar (y 0–33)**

| Element | Rect | Notes |
| --- | --- | --- |
| HP bar | x4 y3 w72 h6 | BLOOD fill, VOID track, 1 px STEEL frame |
| POWER bar | x104 y3 w72 h6 | ACID fill |
| TRACE bar | x4 y13 w172 h5 | Color *is* the state: STEEL → SODIUM → BLOOD → pulsing BLOOD |
| Floor label | x4 y22 | 5×7 font, CYAN |
| Trace state word | centered y22 | CLEAR/ALERT/HUNT/LOCKDOWN/**PURGE** |
| Credits | right-aligned x176 y22 | SODIUM |

The TRACE bar is the widest single element on screen and sits directly under the eye's resting
position. That is deliberate: it is the most important number in the game.

**Map viewport (y 34–241).** 11 × 13 tiles minimum, growing to 11 × 15 on taller devices, then
capped (ARCHITECTURE.md §2). Camera keeps the player centered with a 2-tile dead zone so small
moves don't scroll the world.

**Message log (y 242–263).** Two lines, 5×7 bitmap font, newest at the bottom. Older lines
render at 60% alpha. Tapping the log expands it to a 10-line scrollback panel. Grows to 4 lines
on tall devices.

**Action bar (y 264–315).** Six 26×26 buttons: five quick slots plus an inventory toggle.
Buttons are 26 logical px = **156 device px on a 1080p phone ≈ 9.2 mm**, comfortably above the
7 mm minimum touch target. Mirrorable left/right for handedness. The strip below shows the
equipped weapon name and ammo.

**Why the action bar is worth 16% of the screen:** the alternative is putting quickhacks behind
a menu, and a quickhack behind a menu is a quickhack that never gets used. Abilities the player
can't see, they don't play.

---

## 3. Tiles and sprites

**Grid:** 16×16. Bosses and large mechs occupy 2×2 tiles and use a 32×32 sprite.

**Per-sprite budget:** 12 colors maximum, drawn from the ramps above. Most sprites use 6–8.

**Outlines:** every actor gets a 1 px outline in `#05030d`, plus a second selective outline in
its threat color on the side facing the player. Terrain gets no outline — that separation is
what makes actors pop off the floor.

**Shading:** light comes from above-left in Act I and II. Act III has no consistent light
source, which is a storytelling decision as much as an art one. Flat fills with hand-placed
dither for transitions — no anti-aliasing, no soft gradients, ever.

**Animation budget** (frames per actor, and this is a ceiling, not a target):

| State | Frames | Rate |
| --- | --- | --- |
| Idle | 2 | 4 fps |
| Walk | 2 | driven by move animation |
| Attack | 3 | 12 fps |
| Death | 4 | 12 fps, ends on a corpse tile |

Eight frames of movement would look better and would cost four times the art. Idle-bob at
4 fps plus a strong silhouette reads as "alive" for a fraction of the price.

**Slice atlas budget:** ~40 terrain tiles, 8 actors × ~8 frames, 30 item icons, ~20 effect
frames, 2 bitmap fonts. Fits in a single 512×512 atlas with room to spare, which means one
texture bind and no atlas paging.

---

## 4. Lighting and effects

There is no real lighting system. There is a **glow layer**: additive radial quads composited
with `globalCompositeOperation = 'lighter'`, tinted per source, drawn after terrain and before
actors.

| Source | Tint | Radius | Flicker |
| --- | --- | --- | --- |
| Neon sign | MAGENTA/CYAN | 3–5 tiles | Yes, 6% amplitude |
| Terminal screen | CYAN | 2 tiles | Slow pulse |
| Fire / hazard | SODIUM | 2–4 tiles | Yes, 15% |
| Muzzle flash | LIGHT | 2 tiles | 1 frame |
| The Architect | ACID | 6 tiles | Irregular |

Flicker is driven by the *cosmetic* RNG stream (ARCHITECTURE.md §5), so a replayed run flickers
identically — a small thing that makes bug videos match bug reports.

**Post effects, all optional and all off under reduced-motion:**

- **Scanlines:** 1 px darkening every 3 logical px, 8% alpha. Subtle enough to be atmosphere,
  not a filter.
- **Chromatic aberration:** only during Instability glitches and Architect attacks. Never
  ambient — permanent aberration on a 6" screen is a headache, not a mood.
- **Vignette:** static, VOID, strengthens with Trace state. Doubles as a peripheral warning.
- **Screen shake:** 2–4 px, ≤120 ms, on heavy hits only.

**Fog of war:** three states. Visible = full color. Explored-but-not-visible = terrain only,
desaturated toward VOID at 40% alpha, **actors and items hidden** (a remembered enemy position
is a lie the player will act on). Unexplored = `#05030d`, nothing.

---

## 5. The Instability glitch language

Instability (DESIGN.md §6.6) is expressed visually, and the escalation is legible as a
progression rather than as random noise:

| Tier | Visual |
| --- | --- |
| **Static** (20–39) | Occasional 1-frame horizontal tear across the viewport; log text briefly shows corrupted glyphs |
| **Dissonance** (40–59) | Persistent faint chromatic fringe on the player sprite; quickhack targeting reticle jitters 1 px |
| **Fracture** (60–79) | Enemy threat outlines occasionally render in the *wrong* semantic color; short blocks of the terrain layer redraw from a stale frame |
| **Cyberpsychosis** (80+) | The palette itself shifts — STEEL ramp desaturates toward VOID, BLOOD saturates. The world stops looking like the world. HUD text renders in MAGENTA |

The rule that keeps this from being cheap: **the glitches always tell the truth about the
player's state, even when they lie about the world's.** A player who sees the palette drain
knows exactly what has happened to them. That's the difference between a mechanic and a bug.

---

## 6. Typography

Bitmap fonts rendered from the atlas — no TTF, no subpixel hinting, pixel-exact at every
integer scale.

- **5×7** — message log, item names, numbers. Uppercase-preferred, mixed-case supported
- **7×9** — panel headings, boss names, the death screen

Three accessibility text-size steps scale the *layout* (log line count, panel padding), not the
font bitmaps — a 1.5× bitmap font is a blurry bitmap font. Larger steps swap to the 7×9 face
and reduce lines shown.

---

## 7. Feel checklist

Small things, listed because they get forgotten and they are most of what "juice" actually is:

- Damage numbers rise 6 px over 300 ms and fade; crits are 7×9 and shake
- Hits push the target sprite 2 px away from the attacker and back over 120 ms
- Kills leave a corpse tile that persists for the floor's lifetime — Act III's Daemons make
  this mechanically load-bearing
- Descending fades to VOID over 400 ms, holds 200 ms, then fades in with the new floor's
  ambient tint — the palette shift between acts should be felt on arrival
- Crossing a Trace threshold flashes the TRACE bar, ticks the haptic motor, and drops one
  message-log line. Three channels, because this is the one event the player must not miss
- The PURGE state desaturates the entire non-actor palette by 30%, so the Hunter-Killer's
  BLOOD outline is the most saturated thing on screen from the moment it spawns
