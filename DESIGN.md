# SAHAJA YOGA Design Language

> An immersive Sahaja Yoga meditation website and web app, for regular practitioners first and new seekers second. Visually extraordinary while exploring; composed and nearly silent while meditating.

**Sources:**
- Extracted from `references/approved-current-hero.png`, the source of truth. Colours were sampled from the pixels.
- `references/buttermax-composition-reference.png` informs composition only.
- Hardened with `ui-ux-pro-max` (accessibility, touch and motion rules; its generic "wellness/neumorphism/lavender" match was rejected as off-direction) and `taste-design` (anti-slop bans; four exceptions are documented in §7).

**Approved concept:** Bloom → Ascent → Return (see §12).

**Status:** v1 draft · 16 Oct 2026 · L1 (first DESIGN.md)

---

## 1. Visual Theme

**Theme statement:** warm, monumental, sacred stillness.

**Character:** A warm ivory room lit from the upper left. One pearlescent object sits in front of monumental serif type, and almost nothing else is there. The site feels like a hushed gallery, not an app. Colour enters only when the subtle system is entered: each chakra turns the whole world its own colour, the way Buttermax lets one colour own a screen. While meditating, everything recedes except a single anchor, a beautiful number and the user's own rhythm.

**Dials:**
- **Density 2:** "art-gallery airy".
- **Variance 3:** centred and symmetrical by design. The lotus is an axis, and the spine of the Ascent is vertical.
- **Motion:** 6 while exploring ("cinematic but slow"), **1 while meditating** ("static restrained").

**References:**
1. The approved SAHAJA hero: warm ivory, a pearl lotus, monumental serif.
2. Buttermax: monumental type with one foreground object, three controls, one colour owning the screen.
3. Noomo Labs: a reversible hold-to-commit ritual and a scroll-scrubbed 3D story.
4. Büro: editorial type discipline and a single typeface doing all the hierarchy.
5. Official Sahaja Yoga USA chakra guides: chakra colours and mandala geometry.

---

## 2. Color Palette

### 2.1 Ground: the ivory room (hero, app chrome, library, practice)
| Token | Value | Role |
|---|---|---|
| `ground-0` | `#F6F0E8` | Lightest highlight, upper-left light pool |
| `ground-1` | `#EFE6DB` | Header band, primary page surface (sampled) |
| `ground-2` | `#E7D9CB` | Mid ground, drawer surfaces |
| `ground-3` | `#DAC8B2` | Champagne: the median ground tone (sampled) |
| `ground-4` | `#CAB49C` | Lower ground; **text may sit here only in `ink-1`** |
| `ground-5` | `#B49B81` | Vignette edge. **No text allowed.** |
| `ground-6` | `#A48971` | Deepest vignette corner (sampled p10). Decorative only. |

The ground is a soft radial field from `ground-0` (upper left) to `ground-4`, with `ground-5`/`-6` confined to the outer 12% of the edges. A 2–3% monochrome paper grain sits on a fixed pseudo-element. **Correction to the reference:** the bottom band under the CTAs must stay ≥ `ground-4`, never darker, so the CTAs pass contrast.

### 2.2 Ink
| Token | Value | Contrast | Role |
|---|---|---|---|
| `ink-1` | `#3E3531` | 9.7 on ground-1 · 6.0 on ground-4 | Display type, primary text, primary CTA, pill strokes (sampled) |
| `ink-2` | `#4F4239` | 7.8 on ground-1 · 4.9 on ground-4 | Secondary text, secondary CTA |
| `ink-3` | `#5C4E43` | 6.5 on ground-1 · 4.9 on ground-3 | Sublines, captions (**replaces the reference's `#78695B`, which fails AA**) |
| `ink-hair` | `rgba(62,53,49,0.22)` | — | Hairlines, dividers, inactive markers. Never used for text. |

No pure black anywhere (`#000000` is banned). Ink is always warm.

### 2.3 Lotus material (3D only)
| Token | Value | Role |
|---|---|---|
| `pearl-hi` | `#FBEFE5` | Petal specular highlight (sampled p99.5) |
| `pearl` | `#EADFD5` | Petal base colour |
| `pearl-shade` | `#C2AD9E` | Petal turned away from light |
| `pearl-root` | `#A78465` | Gold-umber at the petal bases (sampled) |
| `core-glow` | `#FDE0BD` | Emissive heart of the lotus (sampled) |
| `core-light` | `#FFD3A1` | Warm point light inside the lotus |

### 2.4 Accent (one only)
| Token | Value | Role |
|---|---|---|
| `gold` | `#B8925F` | **The single accent:** focus rings, lap markers when lit, the active-state dot. Saturation ~41%. Never a fill for large areas, never a glow. |

### 2.5 Chakra worlds (environment themes, not accents)
Colours follow the **official Sahaja Yoga USA chakra guides**. Each world swaps the whole token set. `env` is a deep, low-saturation field for meditation comfort, `glow` is the chakra's own hue (used on the 3D form and light), `ink` is the text colour, and `soft` is secondary text.

| Chakra | Official colour | `env` | `glow` | `ink` | `soft` | ink/env |
|---|---|---|---|---|---|---|
| Mooladhara | coral red | `#3B1A16` | `#E8705A` | `#F6E7DC` | `#D9B9A8` | 12.9 |
| Swadhishthana | yellow | `#3A2E10` | `#F2C94C` | `#F7EEDB` | `#D8C79E` | 11.5 |
| Nabhi | green | `#12301F` | `#4FB377` | `#E8F2E6` | `#B5CDB7` | 12.5 |
| Void | green / ocean | `#0F2C2A` | `#5FB8A4` | `#E4F1EE` | `#A9C9C2` | 12.8 |
| Anahat (Heart) | purple-blue | `#211B3D` | `#7E72D1` | `#ECE9F7` | `#BDB6DE` | 13.6 |
| **Vishuddhi** | **light blue** | `#16324A` | `#8EC5E8` | `#EAF3F9` | `#AFCBDF` | 11.8 |
| Agnya | silver | `#25282E` | `#C9CED6` | `#F1F2F4` | `#B9BEC6` | 13.2 |
| Sahasrara | all colours / clear | `#F4F1EC` | iridescent pearl (shader) | `#2E2A33` | `#5E5866` | 12.5 |

All `soft`/`env` pairs measure ≥ 7.8:1. Sahasrara returns to light, so the Ascent ends in the ivory room.

### 2.6 Semantic (used sparingly; this product has almost no errors)
| Role | Value on ground | Value in worlds |
|---|---|---|
| Success / complete | `#5E7A52` | world `glow` |
| Warning (mid-session navigation) | `#9A6B2E` | `#E6B66A` |
| Error | `#9E3B2F` | `#F0A193` |
| Info | `ink-2` | world `soft` |

---

## 3. Typography

**Families:**
- **Display:** shortlist tested at hero scale in the Explore step: **Cormorant** (500–600), **Bodoni Moda**, **Instrument Serif**, **Gloock**. *Provisional default: Cormorant 600*, the closest warm, high-contrast match to the reference glyphs. Stack: `"Cormorant", "Cormorant Garamond", ui-serif, serif`.
- **UI sans:** **Geist** (Inter is banned by taste-design). Stack: `"Geist", ui-sans-serif, system-ui, sans-serif`.
- **Numerals:** the display serif with `font-feature-settings: "lnum" 1, "tnum" 1` for the timer and counter (lining, tabular, so numbers never jitter).
- **Devanagari (mantras, later):** Tiro Devanagari Sanskrit or Noto Serif Devanagari, chosen at Phase 3 review.
- All are free Google Fonts, self-hosted via `next/font`.

**Scale:** fluid, with display sizes set by viewport and UI sizes on a 1.25 ratio.

| Token | Size | Weight | Line height | Tracking | Usage |
|---|---|---|---|---|---|
| `display-hero` | `clamp(5.5rem, 21vw, 24rem)` | 600 | 0.82 | -0.02em | SAHAJA / YOGA (desktop SAHAJA ≈ 84% of viewport width) |
| `display-world` | `clamp(4rem, 13vw, 15rem)` | 500 | 0.86 | -0.015em | Chakra name in its world |
| `display-timer` | `clamp(5rem, 16vw, 18rem)` | 400 | 0.9 | -0.01em | Meditation timer (Altar layout) |
| `display-l` | `clamp(2.75rem, 6vw, 5.5rem)` | 500 | 1.0 | -0.01em | Section titles, Ascent quality word |
| `display-m` | `clamp(2rem, 3.6vw, 3.25rem)` | 500 | 1.1 | 0 | Drawer and page titles |
| `text-xl` | 1.5rem | 400 sans | 1.35 | 0 | Hero subline, lead |
| `text-l` | 1.25rem | 400 sans | 1.45 | 0 | CTA text-actions |
| `text-base` | 1rem | 400 sans | 1.6 | 0 | Body (65ch max) |
| `text-s` | 0.875rem | 450 sans | 1.5 | 0.01em | Meta, captions |
| `label` | 0.8125rem | 500 sans | 1 | 0.08em uppercase | Nav pills, small labels (**the only uppercase**) |

---

## 4. Components

| Component | Level | Purpose | Variants / states |
|---|---|---|---|
| `Wordmark` | primitive | Line-art lotus mark + "SAHAJA YOGA" | default, compact (mobile) |
| `PortraitMark` | primitive | Circular photo of Shri Mataji, top centre | photo · `pending` placeholder (labelled "Photograph pending approval"); **never animated** |
| `NavPill` | primitive | MEDITATE · CHAKRAS · MY PRACTICE | default, hover (ink fill, ground text), focus (gold ring 2px, offset 3px), current |
| `TextAction` | primitive | Typographic CTA ("Begin Meditation") | primary (`ink-1`), secondary (`ink-2` + "→"), hover (hairline underline draws L→R) |
| `HoldCue` | primitive | "Hold to bloom" + Space hint | idle, holding (the cue fades out), released (fades back in) |
| `Lotus3D` | component | The hero object | bud, blooming (0–1), bloomed, Sahasrara (1000-petal form), static fallback |
| `ChakraForm3D` | component | Mandala per official geometry | 8 instances; idle, focused, meditating (still) |
| `ChannelLines` | primitive | Ida (cool, left) / Pingala (warm, right) / Sushumna hairlines | rest, active (light travelling) |
| `HandMap` | component | Finger where each chakra is felt (official chart) | per chakra, both hands |
| `LapMarkers` | primitive | 10 lap indicators, styled by layout choice | 0–10 lit, round-complete state (no "lap 0") |
| `CounterSurface` | component | Full-screen tap zone + Space/Enter | idle, tap feedback, guarded (accidental), paused |
| `Timer` | component | Stopwatch / countdown / hidden | running, paused, finished-gently |
| `SessionBar` | component | Undo · Pause · Finish | hidden (stillness), revealed on touch/key |
| `Drawer` | component | Source panel, info, settings | closed, open (right on desktop, sheet on mobile) |
| `MiniPlayer` | component | Raga play/pause + credits (Bandcamp embed interim) | enable-prompt, playing, paused, unavailable |
| `PhaseStepper` | pattern | Preparation steps (Kundalini raising, Bandhan …) | guided step, done, skipped |

**Missing states to design before build:** PortraitMark loading; Lotus3D WebGL-unavailable; MiniPlayer offline; CounterSurface restore-after-reload ("Resume / End session").

---

## 5. Layout

- **Grid:** 12 columns with a 24px gutter, side margins of `clamp(20px, 4vw, 64px)`, and content max-width 1440px. Full-bleed scenes ignore the max-width.
- **Base unit:** 8px. **Spacing:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 192.
- **Hero zones** (desktop, measured from the reference):
  - Header at 10% of viewport height.
  - Title cap-top at 23% and baseline at 59% (a two-line stack spans 21–74%).
  - Lotus centred, spanning 32–67.5% width and 31–75% height.
  - Subline at 64%.
  - CTAs at 83%.
- **Heights:** `min-height: 100dvh` for full scenes. `h-screen` / `100vh` is never used.
- **Radii:** pill `999px` · drawer `28px` · small `12px` · portrait `50%`.
- **Density:** Comfortable everywhere. Meditation screens are ultra-sparse.

## 6. Depth

The scene is flat type plus real 3D light. There are no card shadows.

| Token | Value | Use |
|---|---|---|
| `shadow-none` | none | Everything by default |
| `shadow-drawer` | `0 24px 60px -20px rgba(62,53,49,0.28)` | Drawer and sheet only (shadow tinted to ink) |
| `veil` | `ground-1` at 72% + `backdrop-filter: blur(14px)` | Drawer backdrop on the ivory ground only |

**Z-order:** Canvas (3D) 0 → display type 1 (the lotus **renders in front of** the type, using one canvas with a DOM text plane behind it) → UI 10 → drawer 20 → dialog 30 → toast 40.

## 7. Do's and Don'ts

### Do
- Keep **one object, one word, one action** in focus per scene.
- Let colour *own* a chakra world completely (env + glow + ink), as Buttermax lets yellow own a screen.
- Make the lotus overlap the type: **the lotus sits in front of the letters, as one composed image** (an approved exception to taste-design's no-overlap rule).
- Use real numerals in tabular lining figures, large, serif, and calm.
- Ground every teaching, colour, geometry and mantra in a cited Sahaja Yoga source (`research/`), with a reviewed flag.
- Treat holding as invitation, never as a gate. Nav and "Begin Meditation" always work without holding.
- Give the CTAs full contrast. Show hierarchy by weight and order, not by fading text (fixes the reference).

### Don't
- No emojis, no Inter, no pure black, no neon or outer glows, no gradient text, no bloom-spam, no rainbow particle fields.
- No 3-equal-card rows, no dashboards of fake stats, no invented numbers, no "BY THE NUMBERS".
- No scroll arrows or bouncing chevrons. The `HoldCue` replaces the reference's down-arrow.
- No perpetual micro-loops while meditating (an exception to taste-design: stillness outranks "alive UI"). Exploring screens may breathe slowly; meditating screens may not.
- No motion on Shri Mataji's portrait, and never use the portrait as texture or particles, crop it oddly, filter it, or AI-alter it.
- No claims of detecting chakras or Kundalini, diagnosing illness or scoring spiritual progress. No streak guilt, no leaderboards.
- No AI copy clichés: elevate, seamless, unlock, unleash, transform your life, journey (as filler), next-gen.
- No custom cursors (taste-design and the meditation-calm brief agree).
- No autoplay audio.

## 8. Responsive

| Element | Phone (<768px) | Tablet (768–1023px) | Desktop (≥1024px) |
|---|---|---|---|
| Hero title | SAHAJA / YOGA stacked at ~92% of viewport width per line; lotus between and in front, scaled to 78% of viewport width | Stacked | Stacked (or the variant chosen in Explore) |
| Header | Wordmark (compact) · portrait centre · menu button → full-screen ivory menu | Pills shrink | 3 pills |
| CTAs | Stacked, full-width text-actions, 56px rows | Inline | Inline |
| Ascent | Vertical, one chakra per screen; the hand map stacks under the quality word | Same | Form centre, word left, hand map right |
| Meditation | Whole screen is the tap surface; timer above the form | Same | Same plus keyboard hints |
| Drawer | Bottom sheet | Right drawer 420px | Right drawer 480px |

Landscape phone: the timer moves beside the form. Touch targets are ≥ 44px and the counter surface is ≥ ⅔ of the screen. No horizontal scroll. Body text is never under 16px.

## 9. Agent Prompt Guide

**Agents must:**
- Use tokens from §2–§6 and §10 only. Never use raw hex in components.
- Defend every decision against "warm, monumental, sacred stillness".
- Re-run the screenshot critique at 1440, 768 and 390px after any visual change.

**Invariants:**
- The brand is always **SAHAJA YOGA** in full in the hero, the wordmark and the metadata.
- The **large ivory 3D lotus is the hero's centre and the Ascent's destination.** It is never replaced by the portrait, a chakra or abstract light.
- Only the **small top-centre header symbol** becomes Shri Mataji's photograph (or the labelled placeholder).
- **The counter is 10 laps per round. Tap 11 is round 2, lap 1.** An exact multiple of 10 shows "Round N complete", never "lap 0".
- Vishuddhi is blue, with 16 petals and a downward triangle with ring and inner circle, and offers Raga Jaijaivanti.
- Chakra colours and geometry come from official Sahaja Yoga sources only.

**Open questions:**
- The final display serif (Explore step).
- The meditation layout: Altar, Mala or Horizon.
- The photograph asset (the user is sending it).
- Approval of the Maha Mantra wording.

## 10. Motion

- **Durations:** `instant 120ms` · `quick 240ms` · `base 480ms` · `slow 900ms` · `ceremonial 1600ms` · `hold-bloom 4000ms`
- **Easing:**
  - `out-expo cubic-bezier(0.16,1,0.3,1)` for entrances.
  - `ceremony cubic-bezier(0.65,0,0.35,1)` for scene changes.
  - `breath` is sine in-out over 6s for the idle bud and the stillness light.
  - UI springs use stiffness 100, damping 20.
- **Signature transitions:**
  1. **Arrival:** the ground fades in, the type rises 3% with letterspacing tightening over `ceremonial`, then the bud resolves from soft focus.
  2. **Hold to bloom:**
     - Petal tiers open on the hold's progress (inner → outer).
     - Release reverses at 1.5× speed.
     - The cursor's stillness adds smoothing.
     - On completion, the core brightens, a cool-breeze particle drift rises once (no loop), and the lotus lifts.
  3. **Ascent:**
     - Driven by scroll scrub: a light climbs the Sushumna.
     - The environment tokens crossfade per chakra over `slow`.
     - Each form makes one quarter-turn, then rests.
  4. **Return:** the light enters the lotus and extra petal rings unfold (the Sahasrara). The world goes back to ivory.
  5. **Into meditation:** exploration UI recedes over `base`, the timer and markers enter with `out-expo`, and then motion goes to near-zero.
- **Pointer:** depth tilt ≤ 3° on the lotus only. No pointer effects on type, UI or the portrait.
- **Performance:**
  - Animate only `transform` and `opacity`.
  - Cap the 3D canvas DPR at 2 (1.5 on mobile), pause it on hidden tabs, and dispose of geometry, materials and textures on scene exit.
  - One persistent canvas.
- **Reduced motion:**
  - The bloom is instant on tap.
  - The Ascent becomes a static vertical list of the chakras with colour blocks.
  - No scroll-jacking, no parallax, cross-fades only.

## 11. Voice & Tone

**Voice:** quiet, warm, exact. It speaks like a calm practitioner, not a brand.

| Use | Avoid |
|---|---|
| Self-Realisation | enlightenment hack, awakening (as hype) |
| meditation, stillness, thoughtless awareness | mindfulness (different practice), productivity |
| vibrations, cool breeze | energy healing, manifest |
| chakra, channel (Ida, Pingala, Sushumna) | aura cleanse, frequency |
| round, lap | streak, score, level |
| Shri Mataji | "the founder" (used alone), guru (as a label) |

**Microcopy:**
- UI text is sentence case. Nav pills are the only uppercase.
- Buttons and text-actions are short imperative verbs: *Begin Meditation, Explore Chakras, Hold to bloom, Finish*.
- Errors are plain, with a gentle recovery: *"Audio couldn't start. Continue in silence?"*
- Never praise or judge a session; just record it.

## 12. Signature Scenes (approved concept)

1. **Bloom (hero):** the approved composition, with a closed bud. Hold (pointer, touch or Space) opens the petals tier by tier. Releasing early closes it softly. Completion brings a cool breeze through the letters and the lotus lifts. Returning visitors arrive with it already bloomed.
2. **Ascent (scroll):**
   - A light rises from the sacrum triangle with its coiled spiral, through Mooladhara, Swadhishthana, Nabhi + Void, Anahat, Vishuddhi and Agnya.
   - Each chapter has its official colour world, a quarter-turning form, one quality word, the finger it is felt on, and "Enter →".
   - Ida and Pingala run as hairlines alongside.
3. **Return:** the light enters the lotus, which unfolds into the thousand-petalled Sahasrara. The world goes back to ivory, with *Begin Meditation* · *Continue my practice*.
4. **Meditation states:** Preparation (guided), Active (immersive), Stillness (quiet). They share one anchor object; the layout is chosen in Explore.
