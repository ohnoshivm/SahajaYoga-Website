# SAHAJA YOGA: Audit, Architecture, Design Assessment & Phased Plan

*v1 · 16 Oct 2026 · for review before any UI code is written (master plan §16)*

---

## 1. Audit: what exists today

| Item | State | Finding |
|---|---|---|
| App code (routes, components, 3D lotus) | **None found** | I searched Downloads, Desktop, Documents, Comet Downloads and a Spotlight index for "Sahaja", "Premium Meditation" and "A space to return to yourself". No repository exists. `sahaja.app` (the URL in the screenshot) does not resolve. |
| Approved hero | **Concept render only** | `references/approved-current-hero.png` (2048×1143) is a still image, not a running page. Per master plan §0.3 the lotus must be **recreated faithfully as real 3D**. |
| This repo | Research only | `research/` (Sahaja Yoga knowledge base, `subtle-system.json`, Noomo/Buttermax/Büro teardown) plus the handoff files, now at the repo root (`CLAUDE.md`, master plan, `references/`). |
| Toolchain | Ready | Node 26, npm 11, git, GitHub CLI (logged in as ohnoshivm), and the built-in browser for screenshot review. **No Blender**, so the lotus and chakras will be built procedurally in Three.js, not modelled and imported. |

**Preserve list:** nothing is coded yet, so the job is **"recreate faithfully"**, not "avoid overwriting". What must survive the transition into code is the composition and atmosphere analysed below.

---

## 2. Design assessment of the approved hero

Measured from the reference, as a percentage of the 1440-wide viewport area:

| Element | Position / scale | Notes to preserve |
|---|---|---|
| Wordmark (top-left) | x 4%, y 10% | Line-art lotus + "SAHAJA" in a light serif, about 34px. It becomes **"SAHAJA YOGA"**. |
| Centre header symbol | x 50%, y 10%, about 100px | Line-art chakra mandala. **Replaced by a circular Shri Mataji photograph** (about 64–72px, hairline champagne ring, no motion). |
| Nav pills | right-aligned, y 10% | Three outline pills: 1.5px warm-charcoal stroke, uppercase sans, generous padding. |
| Title | spans x 8.5→92%, cap top y 23%, baseline y 59%; **cap height ≈ 36% of viewport height** | High-contrast display serif with an expressive curved A crossbar and a descending J. Warm charcoal, slightly translucent into the ground. |
| Lotus | centred, x 32→67.5%, y 31→75% | Pearlescent ivory petals in 4 tiers (inner bud, 2 cupped rings, flat outer sepals). Golden glow from the core, soft gold rim light on the inner faces. **It sits in front of the letters "H A"**, and its upper petals overlap the type. |
| Subline | x 9%, y 64% | "A space to return to yourself." Sans, about 22px, muted charcoal. |
| CTAs | centred, y 83% | Text-only pair: "Begin Meditation" (charcoal) and "Explore Chakras" (60% opacity). No buttons; type *is* the control. |
| Scroll cue | centred, y 93% | A single hairline arrow. |
| Ground | — | Radial-ish warm gradient from ivory (top-left, about #EEE6DA) to champagne sand (bottom-right, about #C8B19A), with a soft vignette and a very fine paper grain. |

**What makes it work:**
- One monumental object over monumental type.
- A strictly limited palette.
- Exactly three nav controls.
- Generous negative space.

This is Buttermax's composition, translated into a sacred, warm material world.

**Risks I'm carrying into the build:**
1. **"SAHAJA YOGA" is 11 characters against 6.** At the reference cap height it cannot fit on one line. I'll prototype three arrangements in the running page and choose from screenshots:
   - **A. Stacked:** SAHAJA on line 1 and YOGA on line 2, centred. The lotus sits on the junction and overlaps both lines.
   - **B. Monumental + echo:** SAHAJA at reference scale, with YOGA set in a smaller tracked caps beneath, aligned to the subline.
   - **C. Single line:** both words at about 60% of the scale, with the lotus scaled to match.

   **My recommendation is A.** It keeps the scale and makes the lotus the hinge of the name.
2. **Lotus realism.** The reference is a render-quality object. I'll build it procedurally:
   - Parametric cupped petals in 4 tiers, using `MeshPhysicalMaterial` (sheen, clearcoat, thin transmission).
   - Vertex-colour gold toward the petal bases, an emissive core with a warm point light, and a soft studio environment map.
   - Iterated side-by-side against the reference until it holds up.

   Fallback if a device lacks WebGL: a pre-rendered still of *our own* 3D lotus (not the concept image).
3. **Typeface.** The exact face is unknown (it may be AI-generated). I'll test 3–4 candidates side by side at hero scale: Cormorant Garamond, Gloock, Bodoni Moda, and a licensed option such as Canela or Ogg if you want to buy one. The UI sans will be Inter or similar.

**Reference-direction note:** your earlier brief said Buttermax should lead the design. The handoff now confirms **ivory/champagne as the approved art direction, with Buttermax as compositional inspiration only**. I'm following the handoff.

---

## 3. Architecture

### Stack (master plan §13 default; no existing stack to adapt)
| Layer | Choice | Why |
|---|---|---|
| App | **Next.js (App Router) + React + TypeScript** | Deep-linkable routes (`/chakras/vishuddhi` works on refresh), static export plus PWA, Vercel-ready. |
| Styling | **Tailwind CSS** + CSS custom-property design tokens | Tokens switch per chakra environment. Brand-critical screens are custom, with no UI kit look. |
| 3D | **three + @react-three/fiber + @react-three/drei** | One persistent `<Canvas>` across routes, so there are no WebGL context re-creations on navigation. |
| Motion | **Motion (framer-motion)** for UI state; **GSAP** only for scroll-scrubbed homepage scenes | Each library has one job. |
| Smooth scroll | Lenis (homepage only; off in meditation) | — |
| State | **Pure TypeScript reducers** (counter, session phase machine) + Zustand for UI/global | The reducers are framework-free and unit-testable. |
| Persistence | **Dexie (IndexedDB)** | Guest-first local data; export and delete. |
| Audio | Custom `AudioEngine` singleton (HTMLAudio + WebAudio gain for crossfades) | Survives route changes, is rights-aware, and needs an unlock gesture. |
| PWA | Serwist (service worker) | Offline meditation shell, history and timer. Caches only rights-cleared assets. |
| Tests | **Vitest** (counter, timer, phase machine) + **Playwright** (flows, screenshots, axe accessibility) | — |

### Folder structure
```
app/                      routes (see §4)
src/design-system/        tokens.ts, typography, motion presets, Pill, TextAction, Drawer, Toggle
src/scene/                PersistentCanvas, Lotus/, chakras/<Vishuddhi…>, environments, fallbacks, quality tiers
src/chakras/              registry.ts (typed, sourceRefs, reviewed flags) ← research/data/subtle-system.json
src/session/              counter.ts (10-lap reducer), timer.ts (monotonic + checkpoints), phaseMachine.ts, restore.ts
src/routines/             templates.ts, builder
src/audio/                AudioEngine.ts, tracks.ts (licenceStatus approved|pending|unavailable)
src/library/              content records with source/publisher/rights/reviewer
src/practice/             db.ts (Dexie), history/insights selectors
src/settings/             prefs, export/delete
tests/unit, tests/e2e
docs/                     this plan, asset register, content-review log
```

### Core logic contracts
- **Counter** (pure): `tap()`, `undo()`, `reset()`.
  - `completedRounds = floor(total/10)`.
  - `currentLap = total % 10`; at an exact multiple it displays a **"Round N complete"** state, never "lap 0".
  - Each tap records a monotonic timestamp and the lap duration.
  - Round size is configurable, but every default is 10.
- **Timer:** `performance.now()` while active, wall-clock checkpoints persisted every 5 seconds and on `visibilitychange`, pause intervals tracked, and restore on reload offers **Resume / End session**.
- **Phase machine:**
  - States: `planned → in-progress ⇄ paused → complete | abandoned`.
  - Phase kinds: `kundalini | bandhan | mahaMantras | chakra | mantraCount | silence | footsoak | closing`.
  - Completion writes are idempotent (one session ID, one write).
- **Persistent canvas:** the hero lotus, atlas and chakra worlds are scenes in one canvas. A scene manager crossfades the environment tokens and camera. It pauses on hidden tabs and has three quality tiers (full, reduced, static).

---

## 4. Routes and user flows
Routes are exactly as in master plan §2: `/`, `/meditate`, `/meditate/session`, `/meditate/complete`, `/chakras`, `/chakras/[slug]`, `/practice` (+ `/history`, `/routines`, `/insights`), `/library` (+ `/music`, `/mantras`, `/teachings`, `/practices`), and `/settings`.

**Flows:**
1. **Practitioner:**
   - `/` → Begin Meditation → `/meditate` (Resume my routine / Quick start / Choose chakra) → session → complete → saved.
   - Saved routines are reachable directly from `/meditate`.
2. **Chakra-first:** `/chakras` atlas → Vishuddhi world → *Meditate here* (the timer and counter rise in place, with no route jump) → complete.
3. **New seeker:** `/meditate` → "New to Sahaja Yoga" → learn → guided Self-Realisation (approved resource) → simple meditation → Kundalini raising and Bandhan → first routine.

---

## 5. Visual system decisions
- **Hero world:** ivory, champagne, sand, warm charcoal. Paper grain. No pure white or pure black anywhere in the hero.
- **Chakra environments:** each chakra swaps the token set (background, foreground, accent, light colour, contrast-checked text). The colours are **source-verified from the official Sahaja Yoga USA chakra guides**:
  - Mooladhara: coral red
  - Swadhishthana: yellow
  - Nabhi: green
  - Void: green / ocean
  - Heart: purple-blue
  - **Vishuddhi: light blue**
  - Agnya: silver
  - Sahasrara: all colours, crystalline

  Each environment is a deep, desaturated version for backgrounds, with the pure hue reserved for the form and accents. This avoids a "rainbow app".
- **Chakra forms:** these are built from the **official Sahaja Yoga mandala geometry** in the same guides, not generic yoga diagrams:
  - Mooladhara: 4 petals around a square with a triangle
  - Swadhishthana: 6 petals around a six-pointed star
  - Nabhi: 10 petals around a triangle
  - Heart: 12 petals around a six-pointed star
  - **Vishuddhi: 16 petals around a downward triangle with a cream ring and inner circle**
  - Agnya: 2 petals
  - Sahasrara: a 1000-petal lotus around a yantra

  Each form is sculpted 3D: real depth, a pearlescent material tinted to the chakra, and soft inner light.
- **Typography:** one display serif for monumental words and timer numerals (lining, tabular figures), plus one sans for UI. A fluid `clamp()` scale. Devanagari support is reserved for the mantras.
- **Motion:**
  - Entrances are choreographed: about 1.6s for the hero reveal, with an ease-out expo-style curve.
  - Pointer depth applies to the lotus only, at no more than 3°.
  - During meditation, motion drops to near-zero, and in deep stillness only an imperceptible breathing light remains.
  - The Shri Mataji portrait never moves.
- **Controls:**
  - Outline pills for nav, text-actions for CTAs, and hairline drawers for information.
  - Tap targets are at least 44px, and the counter surface is the **whole lower ⅔ of the screen**.

### Three layout explorations for the meditation screen (to prototype live and choose by screenshot)
**A. "Altar" (my recommendation)**
- The chakra or lotus sits as the central object. A **monumental serif timer** sits behind it, the way SAHAJA sits behind the lotus, so the hero DNA carries into the meditation screen.
- The lap count reads as a small "7 · of ten" in the counter zone.
- The ten lap markers are a **thin arc of ten seeds** beneath the object, which light as you tap.
- Rounds appear as small Roman-style numerals at top right.
- In stillness the timer drops to 8% opacity and the seeds remain.

**B. "Mala"**
- **Ten beads on an orbit ring** circle the form, deliberately offset from the petals so they never read as petals. Each tap moves a soft light to the next bead.
- When a round completes, a small knot-bead gains a numeral.
- The timer is small serif type at the top centre.
- It is the most tactile and intuitive to count eyes-closed, but the design risks feeling busier.

**C. "Horizon"**
- An editorial split. On the left, a huge numeral reads "7" over a hairline with "of 10" and "Round 3" beneath. The form sits right of centre.
- Elapsed time is shown as a **slow horizon line** crossing the bottom of the screen.
- In stillness everything fades except the horizon.
- It is the most "Büro editorial" option and best on desktop and landscape.

All three share:
- The full-surface tap zone.
- Space/Enter for keyboard counting.
- Undo, pause and finish in a quiet bottom bar that appears on touch or keypress.
- An optional haptic pulse and bell on round completion.

---

## 6. Asset register
| Asset | Status | Source / action needed |
|---|---|---|
| **Shri Mataji photograph (header)** | 🟡 **Received 16 Oct 2026**, puja portrait (`assets-pending/`, gitignored). **Pending:** (a) source and permission, (b) confirmation it is an unaltered original (it shows signs of AI upscaling/restoration). Planned use: face-only circular crop for the header. |
| ~~Shri Mataji photograph (original row)~~ | ❌ **Missing, permission required** | Official sites offer photos for personal meditation (shrimataji.org, us.sahajayoga.org 21-day page), but **that is not a licence for website use**. I need you to provide a photo with written permission (e.g. from the Shri Mataji Foundation or a national Sahaja Yoga trust). Until then: a clearly labelled placeholder ("Photograph pending approval") in the exact circular frame. |
| Hero 3D lotus | 🛠 To build | Procedural Three.js, recreated from the approved reference. |
| Chakra 3D forms ×7 (+Void) | 🛠 To build | Geometry from the official Sahaja Yoga USA chakra guides (petal counts and inner symbols verified). Vishuddhi first. |
| Chakra colours | ✅ Sourced | Official chakra guides (see `research/data/subtle-system.json`). |
| Chakra qualities and descriptions | ✅ Sourced (summarise, not copy) | us.sahajayoga.org and shrimataji.org. Short paraphrases with source links, plus a reviewer field. |
| Ragas | ⚠️ **Rights pending** | Confirmed album: **"Music and Meditation" by Sahaja Artists / USA Collective** on sahajsongs.bandcamp.com, with tracks Mooladhara–Shyam Kalyan, Swadhishthana–Yaman, Nabhi–Abhogi, Void–Malkauns, Anahat–Durga, **Vishuddhi–Jaijaivanti**, Agnya–Bageshri, Sahasrara–Bhairavi. **Interim:** Bandcamp's official embed player is allowed, but it bypasses our crossfading engine. **Production:** permission to host the files. |
| Maha Mantras text | ⚠️ Review needed | The source exists: `From_Mantra_to_Silence_2024_USA_rev5.pdf` (us.sahajayoga.org, 1.1 MB, confirmed live). I'll extract the exact wording, flag it for your review, and won't publish it unreviewed. |
| Bandhan and Kundalini-raising guidance | ✅ Sourced | Official USA handout (steps verified). Illustrations will be our own, redrawn, not copied. |
| Footsoak guidance | ✅ Sourced | Official USA handout. |
| Self-Realisation guided experience | ⚠️ Review needed | 9 positions verified (shrimataji.org). The affirmation wording needs collective approval, or we link the official video. |
| Shri Mataji talks and videos | ⚠️ Link/embed only | Official YouTube channels. No downloads. |
| Fonts | ⚠️ Decision | Free candidates are fine, or a paid licence if you choose one. |
| Affiliation statement | ⚠️ Decision | "Independent project, not an official Sahaja Yoga site" unless you have formal affiliation. |

---

## 7. Phased plan, dependencies and acceptance criteria
| Phase | Delivers | Depends on | Acceptance criteria (testable) |
|---|---|---|---|
| **0 · Setup** (½ day) | Next.js scaffold, tokens, persistent canvas, Vitest and Playwright, CI lint/type/test | — | `npm run build` and `npm test` are green. `/` renders. The screenshot harness captures 1440, 768 and 390px. |
| **1 · Approved hero** | SAHAJA YOGA hero: real 3D lotus, 3 title layouts tested, portrait frame and placeholder, nav, CTAs, reveal, pointer depth, reduced motion, mobile recomposition | 0; portrait asset (placeholder OK) | Full "SAHAJA YOGA" visible at all widths, with no clipping. The lotus is centred and overlaps the type with no bad petal crops. The header centre is a photo frame (or a labelled placeholder) and the left lotus mark stays. Nav and CTAs are keyboard-reachable with visible focus. The side-by-side screenshot critique vs the reference is signed off by you. |
| **2 · Vishuddhi world** | Chakra registry, environment system, 16-petal 3D Vishuddhi, blue world, source drawer, audio engine (Bandcamp embed or placeholder), in-place timer + **10-lap counter** | 1 (canvas, tokens); counter logic from 3a | Direct load of `/chakras/vishuddhi` works. A blue environment with a recognisable official-geometry 16-petal form. There is no autoplay; an "Enable chakra music / Continue silently" choice is shown. The counter passes the 0/9/10/11/20 and undo tests. A session saves once. Desktop and mobile screenshots are reviewed. |
| **3 · Meditation engine** | Phase machine, 2 routine templates, Kundalini raising, Bandhan tracker, Maha Mantras (after review), the 3 meditation layouts prototyped → 1 chosen, guided/immersive/silent states, restore, completion | 2; Maha Mantra text approval | A full session (Bandhan → mantras → Vishuddhi → 3 rounds → silence → save) completes with no placeholders. Pause accrues no active time. A reload mid-session offers Resume, with state intact. History totals equal the log totals. |
| **4 · Six more chakras + atlas** | Remaining forms and environments, atlas with three channels, switching, non-WebGL list fallback, new-seeker path, library sections | 2's architecture; content review | Each chakra loads directly with its distinct geometry and colour. Switching keeps the session and audio preferences. The atlas works by keyboard and touch. axe reports 0 serious issues. |
| **5 · Practice and offline** | `/practice` history calendar, routines builder, insights, PWA offline, export/delete | 3 | Offline after first load: the timer, counter and history work. Export produces JSON; delete wipes the IndexedDB. |
| **6 · Release QA** | Full visual pass, real devices, Lighthouse, rights log, Vercel preview | All | Every main screen is screenshot-reviewed at 3 widths. LCP < 2.5s on mid-tier mobile with the static lotus fallback. All assets in the register are approved or labelled. |

**Order of excellence** (from master plan §15): hero → Vishuddhi → meditation screen and 10-lap counter → full daily ritual. I'll build the counter reducer and its tests at the start of Phase 2, because both Vishuddhi and the engine depend on it.

---

## 8. Decisions (answered 16 Oct 2026)
- **Photo:** the user will send a permitted photo of Shri Mataji, with its permission source. It is to be recorded in the asset register.
- **Affiliation:** independent project. The footer states it is not an official Sahaja Yoga site.
- **Ragas:** the Bandcamp official embed (USA Collective, "Music and Meditation") for now. The crossfading engine is built for when hosting rights are granted.
- **Fonts:** free (Google Fonts). Candidates to be tested at hero scale.
- **Title layout:** prototype A, B and C live, recommending A.

### Original questions
1. **Shri Mataji photo:** can you supply a photo you have permission to use, or should I proceed with the labelled placeholder?
2. **Affiliation:** is this independent, or built with or for a Sahaja Yoga national trust? This affects wording, logo and the class finder.
3. **Title layout:** are you OK for me to prototype A, B and C live and recommend one from screenshots?
4. **Ragas:** should I use the Bandcamp embed for now, or do you have, or can you request, rights to host the files?
5. **Fonts:** free (Google Fonts) or budget for a licensed display serif?
