# SAHAJA YOGA — Master Website & Meditation Web App Plan
## Definitive Claude Code creative, UX, product, and implementation handoff

**Project status:** Approved direction and implementation plan.  
**Product:** SAHAJA YOGA — an immersive, beautifully designed Sahaja Yoga meditation companion.  
**Audience:** Primarily regular Sahaja Yoga practitioners, with a distinct guided path for new seekers.  
**Build environment:** Claude Code. Claude owns art direction, interface execution, 3D production, motion design, implementation, testing, and iterative refinement.  
**Platform:** Responsive, installable, accessible, offline-capable web app; excellent desktop, tablet, and mobile experiences.  
**Institutional status:** Independent concept unless formal affiliation and permissions are established. Never imply institutional endorsement without authorisation.

---

# 0. READ THIS FIRST — DECISIONS ALREADY APPROVED

These decisions override earlier briefs, experiments, generic design defaults, and your own assumptions.

1. **Use the full visible brand name “SAHAJA YOGA,” not only “SAHAJA.”** It must appear in the hero identity, logo wordmark and relevant metadata. Small shorthand may be used only where context is unmistakable.
2. **The hero in `references/approved-current-hero.png` is APPROVED. Refine it; do not replace it with a new concept.** Preserve its warm ivory/champagne atmosphere, monumental refined serif typography, sophisticated spatial composition, oversized central floating ivory 3D lotus, and minimal navigation.
3. **KEEP THE LARGE CENTRAL 3D LOTUS.** Do not replace it with Shri Mataji’s portrait, a chakra, a silhouette, another flower, or abstract light. If an existing 3D lotus component/model is present in the repository, reuse it. If only the reference screenshot exists, recreate the established design faithfully as an actual 3D element, not a static screenshot.
4. **REPLACE ONLY THE SMALL SYMBOL AT THE TOP CENTRE OF THE HEADER** (shown in `references/replace-header-center-symbol.png`) with a tasteful **authentic photographic portrait of Shri Mataji Nirmala Devi**. Preserve Her identity and photo integrity. Obtain a permitted source or request the approved photo; never invent/alter Her facial details or silently use an unlicensed asset. **Do not confuse this small header emblem with the large central lotus.** The small line-art lotus at top left of the site wordmark may remain.
5. **The Buttermax reference** (`references/buttermax-composition-reference.png`) demonstrates *art direction and compositional confidence*: monumental type, foreground object overlapping letters, a restrained number of controls, and choreographed spatial movement. It is **not** a colour, object, gaming, or brand reference. Do not copy it.
6. **The meditation screen must be as carefully designed as the hero.** It is **not** a blank page with a plain timer and button. Create refined, intentional meditation-focused compositions with beautiful typography, purposeful 3D, excellent counter/timer integration, and calming transitions. Minimal means edited and sophisticated, not empty and unfinished.
7. **One tap = one mantra repetition / lap; exactly 10 laps complete one round.** Tap 11 starts lap 1 of round 2. This is the product’s DEFAULT; never revert to the old 12-lap brief. Round size can be configurable later, but every default screen, test, demo and microcopy must say 10.
8. **The seven chakras must be distinct immersive environments** with accurate Sahaja Yoga-specific sacred forms, environmental colour shifts, source-verified qualities and texts, context-aware meditation tools, and optional chakra-specific ragas. Example specifically approved: **Vishuddhi = blue environment + accurate 3D Vishuddhi chakra + Raga Jayjayvanti/Jaijaivanti**.
9. **The product must actually work.** Functional meditation routine, Bandhan guidance, Maha Mantras, session timer, repeat/round counter, history, local persistence, music and usable navigation are essential; aesthetics are not an excuse for placeholder controls.
10. **Do not claim this website can detect blocked chakras, measure Kundalini, diagnose illness, rank spiritual attainment, or predict spiritual outcomes.** All practice and interpretation must be clearly grounded in Sahaja Yoga source material.

## Reference priority

- **Design source of truth:** `references/approved-current-hero.png`.
- **Precise header replacement:** `references/replace-header-center-symbol.png`.
- **Compositional inspiration only:** `references/buttermax-composition-reference.png`.
- **Textual source of truth:** This file. If the older meditation brief conflicts, this file wins.
- **Image asset dependency:** A permitted genuine high-resolution photo of Shri Mataji is required for production. If absent, create a clearly labeled temporary placeholder within the correct frame; do not manufacture a photographic likeness and call it authentic.

---

# 1. PRODUCT VISION AND OPERATING PRINCIPLES

**One-sentence vision:** An exquisite, immersive Sahaja Yoga meditation space that removes the repetitive mechanics of daily practice and allows the user to concentrate on meditation.

**User goals:**
- Enter a meditation session in seconds without configuring five unrelated tools.
- Follow a saved sequence of preparation, Bandhan, optional Maha Mantras, chakra work, mantra counting, and stillness.
- Meditate on one or more specific chakras in an appropriate immersive environment.
- Count mantra repetitions without looking at the screen; automatically group them into rounds of ten.
- Listen to chakra-specific ragas when desired; switch chakras without audio glitches.
- See what was practised and for how long; resume or repeat a routine.
- Discover verified Sahaja Yoga lessons and Shri Mataji recordings without fabricated doctrine.

**Product philosophy:** Visually extraordinary while exploring. Deeply usable and composed while meditating. Do not design visual noise, productivity pressure, gamified spiritual streak competitions, fake AI enlightenment, generic rainbows or a cookie-cutter SaaS dashboard.

**Two primary entry paths:**
1. **Regular practitioner:** Resume routine / Quick meditate / Choose chakra; no compulsory tutorials.
2. **New seeker:** Introductory, optional Self-Realisation and meditation guidance grounded in recognised Sahaja Yoga resources. No AI-generated claims of being an official teacher.

---

# 2. INFORMATION ARCHITECTURE AND GLOBAL NAVIGATION

Keep the visible primary navigation minimal: **MEDITATE · CHAKRAS · MY PRACTICE**, plus a discreet route to **LIBRARY** where appropriate. Avoid a crowded header. A persistent audio control and account/settings control appear only when relevant.

## Route plan

| Route | Job to be done | Key components |
|---|---|---|
| `/` | Immersive arrival and doorway into the product | Approved hero, scroll transition, atlas preview, routine invitation |
| `/meditate` | Choose a way to meditate | Resume, Quick Start, custom routines, New Seeker |
| `/meditate/session` | Run active meditation | Phase engine, premium meditation screen, timer, counter, audio |
| `/meditate/complete` | End and save | Session summary, reflection, Save/Repeat |
| `/chakras` | Explore the Sahaja Yoga subtle system | Immersive atlas + fully accessible list alternative |
| `/chakras/[slug]` | Enter chakra world and meditate | Distinct 3D form, themed environment, raga, mantra/guidance, session controls |
| `/practice` | Private practice overview | Today, recent sessions, counts, minutes, shortcuts |
| `/practice/history` | Review sessions | Calendar, history, detailed session summaries |
| `/practice/routines` | Create personal routines | Phase editor, reorder, save, duplicate, default |
| `/practice/insights` | Reflect on activity | Chakra focus, time, rounds, no spiritual diagnosis |
| `/library` | Curated source-backed materials | Browse/search content by topic |
| `/library/music` | Raga and audio collections | Raga player, track credits, chakra filters |
| `/library/mantras` | Mantra references | Verified text, pronunciation where permitted, sources |
| `/library/teachings` | Talks and beginner lessons | Attribution, playable embeds/links where allowed |
| `/library/practices` | Bandhan, Kundalini raising, footsoak and other source-informed guides | Instructional experiences |
| `/settings` | Personal preferences and data | Audio, motion, display, language, export/delete |

**URL design:** Deep-linked chakra pages must preserve their identity on refresh; direct visits should work. Do not require a user to navigate through the homepage to access a saved routine.

---

# 3. THE HOMEPAGE — A CINEMATIC FIVE-SCENE EXPERIENCE

This homepage should be unforgettable but disciplined. It is not a series of generic cards with scroll animations.

## Scene 01 — Approved hero: "SAHAJA YOGA"

**Layout:** Edge-to-edge warm ivory/champagne environment; small top-left line-art lotus and SAHAJA YOGA wordmark; small authentic Shri Mataji photographic portrait at the header’s top centre; three carefully spaced pill navigation items on the right; gigantic editorial **SAHAJA YOGA** title across the midground; **existing ivory 3D lotus** floating in front of the letters; restrained subline "A space to return to yourself."; actions "Begin Meditation" and "Explore Chakras"; single refined down-arrow or scroll cue.

**Specific visual rules:**
- Keep the large lotus exactly conceptually where it belongs: as the hero’s central focal point. Do not crop its petals poorly or drown it in decorative halos.
- Long headline should not squeeze into illegibility. Explore visually strong two-line or adaptive large-type arrangements while retaining monumental scale and foreground overlap.
- Typography and 3D lotus must read as one composed image; neither appears pasted onto the other.
- The Shri Mataji portrait is a small navigation/header anchor; do not relocate it to the large central visual.
- Keep CTA hierarchy clear; align elements optically, not only on mathematical grid boundaries.
- No additional large graphic if it weakens the single-hero-object composition.

**Interaction:** Slow, art-directed initial reveal; subtle pointer depth on LOTUS only; portrait remains visually steady and respectful; refined hover/focus on controls; controlled scroll transition. Reduced-motion mode avoids motion-dependent usability.

**Mobile:** Recompose rather than scale the desktop screenshot. Keep full brand legible, portrait visible, lotus not awkwardly cropped, and one-tap access to primary actions. Simplify nav into accessible menu if necessary.

## Scene 02 — From lotus to subtle system

On scroll, hero lettering recedes and the central lotus/foreground composition flows into the next experience. Transition gradually introduces Sahaja Yoga’s subtle-system architecture and seven chakra points. Build this in a single orchestrated scroll scene *if performance allows*; provide a simpler fallback. Do not distort Shri Mataji’s portrait or use Her photo as an animated particle effect.

## Scene 03 — Seven-chakra preview

Show an immersive, explorable but accurate subtle-system visualization. Hover/focus reveals concise names; selecting opens the dedicated chakra world. The full atlas lives at `/chakras`. The homepage preview should not include dense explanations.

## Scene 04 — Meditation invitation

A beautifully designed preview of the actual session interface, not fake app screenshots. A precise "Begin Meditation" / "Continue My Practice" call to action, optional saved-routine summary and one focused indication of how counting works. For first-time visitors, show introductory path unobtrusively.

## Scene 05 — Stillness and deeper learning

A restrained closing composition with an invitation to meditate, return to the chakra atlas or learn from sourced teachings. Keep the footer small: About, Sources, Privacy, Accessibility, Feedback, clear independent/non-official status as appropriate.

---

# 4. CHAKRA ATLAS — THE WEBSITE’S SIGNATURE INTERACTIVE SYSTEM

## Structure

Represent the seven principal Sahaja Yoga chakras and three channels (Ida, Pingala, Sushumna), with accurate names and positional relationships supported by reviewed Sahaja Yoga materials. Optional advanced overlays may include Void, Hamsa and left/centre/right aspects. Do NOT build a generic rainbow-wheel illustration and call it Sahaja Yoga.

**Atlas interactions:**
- Hover, focus or tap chakra → contextual highlight and name; no exclusive hover-only information.
- Select chakra → camera moves towards that specific form; background/environment shifts; side information enters; relevant audio becomes available.
- Leave chakra → return seamlessly to the atlas or adjacent chakra.
- Select left/centre/right aspect only where source-approved data exists.
- Accessible semantic chakra list and reduced-motion visual fallback.

**Shared implementation:** ChakraWorld scene manager, chakra metadata registry, reusable environment component, camera transitions, content overlay system, persistent audio controller, pause/power-save handling.

## Chakra registry — initial content, subject to editorial review

| Chakra | UI identity | Initial purpose |
|---|---|---|
| Mooladhara | Accurate Mooladhara-specific 3D chakra | Source-verified qualities, mantra and focus |
| Swadhishthana | Accurate Swadhishthana-specific 3D chakra | Guide + focus + optional audio |
| Nabhi | Accurate Nabhi-specific 3D chakra | Guide + focus + optional audio |
| Anahata / Heart | Accurate heart-chakra form | Appropriate aspects, guide, audio |
| Vishuddhi | **BLUE environment**, accurate **sixteen-petalled 3D Vishuddhi** | **Raga Jayjayvanti**, guide, timer and 10-lap counter |
| Agnya | Accurate Agnya-specific 3D chakra | Guide + focus + optional audio |
| Sahasrara | Accurate Sahasrara-specific 3D form | Guide + stillness + optional audio |

**Colour rule:** The user explicitly requests each chakra’s background to transform into that chakra’s characteristic colour, but final colour-to-chakra assignments should be aligned with Sahaja Yoga-specific teaching references, *not automatically imported from generic yoga diagrams*. Vishuddhi blue is approved. Other palette values are design tokens to determine during source review and art direction, not invented doctrinal facts.

**Music candidates:** A Sahaja-focused recording collection can be used for research into associations; one candidate set previously identified is Mooladhara–Shyam Kalyan, Swadhishthana–Yaman, Nabhi–Abhogi, Heart–Durga, Vishuddhi–Jaijaivanti, Agnya–Bageshri, Sahasrara–Bhairavi. These are **candidate track associations**, not single authoritative canonical mappings. Verify against approved sources and secure playback rights before shipping; support multiple tracks/versions per chakra.

## Master pattern for each chakra world

1. **Arrival:** Environmental shift; 3D chakra occupies the centre. Giant-but-refined chakra name and one carefully edited descriptor; very little text.
2. **Explore:** Optional controlled rotation / labelled petals or aspects; no wild model spinning. Small concise overlay for reviewed symbolism and qualities.
3. **Listen:** Chakra raga available through an integrated player; smooth transitions between tracks when authorised.
4. **Meditate:** 3D form remains the anchor while the elegant session interface appears. Integrated timer, 10-lap mantra counter, affirmations/mantras when relevant.
5. **Understand:** Source-backed information drawer or optional reading panel. Cannot interrupt running meditation/audio unexpectedly.
6. **Exit/Next:** Save session, return to atlas or enter another chakra; preserve audio preference and meditation state as appropriate.

## Reference implementation: Vishuddhi first

The first **complete and polished chakra environment** should be Vishuddhi. Use blue background, a well-crafted sixteen-petalled 3D Vishuddhi form, soft light, calm motion and the option to play Raga Jayjayvanti. Implement all page states, timer, counter, source panel, audio controls, responsive layouts, performance fallback and saved sessions. Do **not** build seven mediocre scenes before one excellent one.

---

# 5. MEDITATION STUDIO — BEAUTIFUL BY DESIGN, REAL BY FUNCTION

This is arguably more important than the homepage. A blank canvas with a timer is not acceptable; neither is a dashboard cluttering the sacred experience.

## Three states of the same well-designed space

**A. Preparation (guided):** One practice instruction at a time; well-crafted progression indicator; gentle guidance; accurate Bandhan/Kundalini illustrations; easy skip, back, repeat, switch to silence.

**B. Active meditation (immersive):** One central visual anchor — the selected chakra, existing lotus motif or chosen quiet composition. Large, exquisitely typeset timer and 10-segment repetition indicator integrated into the screen’s geometry. Counter action area is large enough to tap with eyes closed; actions are discoverable but restrained.

**C. Deep stillness (quiet):** The composition remains deliberate and premium; texts and decorative movement withdraw. Show only the essentials configured by the user. Controls become visible on tap/keyboard. This is **not a black or white empty screen with a default stopwatch**. Silence, visual stillness and design excellence coexist.

**Settings:** Guided / Immersive / Silent toggle; stopwatch or countdown; sound/vibration; full-screen when available; brightness/dim mode; chakra focus; optional audio; hide/show on-screen count; accessible static fallback.

**Never:** Make users repeatedly open modals to count, tiny tap buttons, surprise reset, mandatory account login, bright flashing animation, sudden loud audio, inaccessible 3D-only controls.

---

# 6. DAILY RITUAL / MEDITATION SEQUENCE ENGINE

## Expected session flow

Choose or resume a saved routine → preparation (optional Kundalini raising) → Bandhan → optional Maha Mantras → selected chakra(s) → mantra repetition and/or meditation → silence → optional closing practice → save/history.

**Practitioner-preferred custom sequence:** Bandhan → Maha Mantras → chakra meditation → 10-lap rounds → silence → save. This order is supported because the user requested it, not because it is universally prescribed by Sahaja Yoga.

**Source-informed alternative:** Kundalini raising → Bandhan → chakra meditation/stillness → optional closing Maha Mantras → close. Never label either as the only valid order. Teachings should be reviewed prior to publication.

**Routine builder must support:**
- Add/remove/reorder repeatable phases.
- Choose chakra(s), mantra(s), optional side/aspect, phase duration/untimed, repetition target, music selection and audio permissions.
- Templates: Morning Meditation, Evening Meditation, Chakra Focus, Silent Meditation, Quick Session, Custom.
- Resume / duplicate / edit / set default / reset with confirmation.
- Track session status (planned, in progress, paused, complete, abandoned) accurately.

**Individual practice modules:**
- **Kundalini raising:** Reviewed instructional guidance, visual indicator, optional completion input; not simulated energy detection.
- **Bandhan:** Clear visual guide and manual step/round tracker, source checked; separate from 10-lap mantra rounds.
- **Maha Mantras:** Source-verified authentic text/transliteration/pronunciation; respectful layout; optional recordings, clear phase progression.
- **Chakra practice:** Source-backed qualities/affirmations and mantra references; focus and timer.
- **Footsoak companion:** Optional instructional sequence and timer based on published Sahaja Yoga guidelines, with basic practical safety notes.
- **Silent meditation:** Nearly hidden controls, visible session status on demand.
- **Closing:** Optional reflection and effortless Save/Repeat.

---

# 7. MANTRA COUNTER — TEN LAPS PER ROUND (NON-NEGOTIABLE)

**Default semantics:**
- Every user tap increments `totalTaps` by one and records a lap duration.
- **10 taps = 1 complete round.** Immediately prepare the next round. **Tap 11 = round 2, lap 1.**
- `completedRounds = floor(totalTaps / 10)`.
- `currentLap = totalTaps % 10`.
- Display a clear distinction between completed rounds and the currently active round; at exact multiples of 10, indicate the round-complete boundary clearly instead of displaying an ambiguous “lap zero” with no explanation.
- Example: 0 taps → 0 rounds; 9 → 0 rounds, lap 9; 10 → 1 completed round; 11 → 1 completed round, lap 1; 20 → 2 completed rounds.
- Undo from 10 → 9 taps and 0 completed rounds; undo from 11 → 10 taps and 1 completed round.

**Timer requirements:**
- Lap intervals measured from counter start to first tap and between successive taps.
- Elapsed time stays accurate across background tab throttling and reloads using persisted timestamps/checkpoints; distinguish active meditation time from paused duration.
- Stopwatch, optional countdown and no-visible-timer mode. If countdown completes, notify gently without erasing user state.

**Interaction requirements:**
- Giant accessible touch/click area, intentional tap confirmation, keyboard Space/Enter, undo, pause/resume, reset confirmation, easy finish.
- Optional haptics, discreet bell and visually subtle completion state; mute by default unless chosen.
- 10 discrete progression markers should be visually integrated without misrepresenting actual chakra petals.
- Accurate persistence, session recovery, journaling association, optional custom round size (default stays 10).
- Lock/guard accidental interaction when needed; ensure double taps are handled consistently. Avoid crude debounce that drops deliberate rapid chanting taps.

**Session analytics:** total taps, total completed rounds, incomplete-round taps, total elapsed/active duration, average lap interval when meaningful, selected chakra/mantra, log date/time and session ID. Never suggest these quantify spiritual progress.

---

# 8. RAGA / MUSIC STUDIO

**Goal:** Chakra-specific sound integrated into the environment, not a generic embedded music widget.

- Chakra pages offer associated ragas, visible track name/performer/attribution, play/pause, volume, mute, repeat, previous/next if available.
- A single persistent audio engine survives route changes and supports deliberate crossfade on chakra switch if the recording/licence/format allows.
- Vishuddhi example: entering via a click may begin Jayjayvanti only **after the user has enabled chakra audio**. Respect browser user-gesture/autoplay policies. On first interaction offer a tiny elegant choice “Enable chakra music” / “Continue silently”; persist preference. Do not autoplay unexpectedly at full volume.
- Sound levels should be calm and controllable; do not automatically layer a tanpura under copyrighted recordings without purpose.
- Each sound asset needs status `approved | pending | unavailable`, rights/source metadata and suitable fallback. Never download or serve copyrighted recordings without permission.
- Keep the mini-player minimal in immersive meditation mode; full library at `/library/music`.

---

# 9. PERSONAL PRACTICE, HISTORY AND ROUTINES

## Today / Practice

Present the next best action first (“Begin Morning Meditation,” “Resume,” or “Choose a Chakra”). Below, show only useful metrics: completed sessions, total meditation time, total mantra rounds, recent chakra focuses, morning/evening entries.

## History

A beautifully art-directed calendar and session archive. Each session has date, start time, active duration, routine, chakra(s), taps, rounds, optional notes, interrupted/completed status and audio choice if useful. Do not imply spiritual quality based on statistics.

## Insights

Weekly/monthly summaries: frequency, time, routines and chakra selections; optional reflections. Avoid competitive gamification, leaderboards, guilt-inducing streak banners or fabricated chakra health assessments.

## Data rights

Guest-first local persistence. Export and delete all personal practice data. Optional sync/login later with explicit opt-in, no data sharing by default.

---

# 10. SACRED LIBRARY AND NEW SEEKER JOURNEY

**Library structure:** Teachings, mantras, practices, music, introduction to the seven chakras and three nadis, verified Shri Mataji talks, glossary and source list.

**Requirements:**
- Content objects carry source URL, publisher, rights status, reviewer, last-reviewed date and availability.
- Preserve exact reviewed mantra wording and transliteration. Do not ask an LLM to freely invent mantras, Sanskrit pronunciations, or claims attributed to Shri Mataji.
- Use trusted embeds/links for videos and audio where publication rights permit. Do not scrape videos or photos.
- Clear distinction between documented teachings, design descriptions and personal notes.
- Search/filter by chakra, topic, media type and learning level.

**New seeker path:** Learn what Sahaja Yoga is → optional guided Self-Realisation experience using approved resource → simple meditation instruction → introduction to Kundalini raising and Bandhan → explore chakras → save a first routine. Allow skipping immediately to meditation and do not imply the software confers Self-Realisation.

**Future AI helper (P2 only):** Source-citing retrieval Q&A from approved texts, clear indication of what is quoted vs summarised, no simulated spiritual authority, no personal energetic diagnoses.

---

# 11. VISUAL DESIGN SYSTEM — TASTE AND CONSISTENCY

Claude is responsible for producing the visuals and iterating on the running application. The plan specifies principles, not artificial image outputs.

**Identity:** Sacred editorial minimalism, world-class spatial art direction, calm material realism, outstanding typography and careful interaction design.

**Hero tokens:** Warm ivory, champagne, pale sand, matte creamy highlights, warm dark-charcoal type; editorial serif headline; crisp readable UI sans; non-harsh border strokes. The approved screenshot determines the actual final shades and composition more than arbitrary colour hex values.

**Chakra tokens:** Separate source-reviewed colour environments with tokenised foreground, background, accent, lighting and contrast for each chakra. Vishuddhi must be blue. Preserve adequate readable contrast. Colours and music are meaningful, not decoration.

**Typography:** Use a disciplined display serif + functional sans system. Provide responsive fluid scale, proper optical spacing, tabular numeric counter styles and complete Indian-script font handling if multilingual content is added.

**Component design:** Very few intentional components with precise spacing and physical scale. Navigation pills, understated contextual drawers, compact media rail, excellent progress and timing elements, readable mantras, purpose-built forms. Avoid a shower of cards or giant bordered panels.

**Motion principles:** Choreographed on entrance and deliberate state changes; almost imperceptible while meditating. Only animate what serves meaning. Avoid eye-catching cursor gimmicks, infinite spins, bloom spam, rainbow particle fields, high-frequency pulses, aggressive transforms of sacred symbols and motion on the Shri Mataji portrait.

**Responsive art direction:** Desktop, tablet and phone get distinct composition decisions. No clipping of headline or lotus, no undersized portrait and no tap targets that are difficult to use eyes closed. Landscape and reduced-motion/low-GPU use are supported.

**Design gates:** All main states (hero, atlas, Vishuddhi, prep, active meditation, deep stillness, counter, history, library) must be reviewed through real screenshots at several viewport widths. Do a proper design critique: typography, visual hierarchy, spacing, colour, focus, legibility, realism, motion and accessible interaction. Iterate, do not declare first version final.

---

# 12. INTERACTION AND TRANSITION ORCHESTRATION

1. **Homepage → atlas:** Scroll-linked transition with an alternative accessible navigation route.
2. **Atlas → chakra:** View/environment colour shifts; camera approaches a validated 3D form; text and available audio controls enter subtly.
3. **Chakra → active meditation:** Exploration affordances recede, timer and counter enter without jumping/reloading, central form remains gently composed.
4. **Chakra switching:** Save current state; transition theme and model without resetting unrelated meditation counters or music preferences. Confirm if a switch would change active mantra log semantics.
5. **Meditation → deep stillness:** Motion slows/stops, informational text withdraws, controls hide gently but are accessible via touch/keyboard.
6. **Session → completion:** Save exactly once; quiet visual completion, concise recap, optional journal, Repeat / Return.
7. **Route refresh/restart:** Preserve the user’s data; offer Resume or End Session when mid-session.

**Fail gracefully:** Interrupted audio, unsupported WebGL, low memory, no network, missing media rights asset and permission-denied browser features must have polished alternatives. No dead-end or blank state.

---

# 13. ENGINEERING ARCHITECTURE

**Default stack** (adapt if the existing repo already provides suitable equivalents):
- Next.js (App Router), React, TypeScript for app and route structure.
- Tailwind CSS + accessible foundational UI elements; use custom design work for brand-critical screens.
- Three.js + React Three Fiber + Drei for immersive chakra and lotus scenes.
- Motion and optionally GSAP for coordinated timeline-based transitions (avoid mixing libraries without reason).
- Local data: IndexedDB with Dexie; session state using a well-tested reducer/state machine or compact store (e.g., Zustand).
- Audio: one shared singleton-style audio manager with play state, unlocked permissions, source attribution and route persistence.
- Offline/PWA: installation, service worker strategy, offline meditation shell and session history; cache only assets with rights.
- Future opt-in multi-device storage: Supabase or equivalent, not required for MVP.
- Testing: Vitest for pure logic, Playwright for flows and screenshots, accessibility automation plus manual keyboard/screen-reader review.

**Architectural modules:**
- `design-system/` (tokens, type, motion, controls)
- `scene/` (lotus hero, chakra scene, environment themes, fallback)
- `chakras/` (source-backed registry and approved content)
- `session/` (phase machine, timer engine, 10-lap counter, restore, completion)
- `routines/` (templates and builder)
- `audio/` (persistent, rights-aware audio controller)
- `library/` (content records and source links)
- `practice/` (history/insights/persistence)
- `settings/` (audio, accessibility, privacy, export)

**Data objects (minimum):**
- `Chakra { id, name, slug, theme, modelAsset, petalCount?, sourceRefs[], reviewed, audioIds[], approvedTexts[] }`
- `AudioTrack { id, chakraIds[], raga, artist, title, sourceUrl, licenceStatus, streamingUrl?, attribution }`
- `Routine { id, name, phases[], isDefault, createdAt, updatedAt }`
- `Phase { id, kind, chakraId?, aspect?, durationMs?, mantraId?, targetRounds?, options }`
- `MeditationSession { id, routineId?, status, startedAt, endedAt?, activeDurationMs, timezone, chakraIds[], reflection?, phaseEvents[] }`
- `MantraCounterLog { id, sessionId, mantraId?, chakraId?, roundSize:10, tapTimestamps[], lapDurationsMs[], startedAt, stoppedAt? }`
- `UserPreferences { audioEnabled, reducedMotion, preferredVisualMode, routineId?, language, notifications? }`

**Timing:** Use monotonic time when active to avoid drift; persist wall-clock checkpoints for restoration. Account for pause/resume, background throttling and interruptions. Define cross-midnight/day boundaries in user-local time. Protect persisted session data against duplicate completion writes.

**Security/privacy:** No mandatory login, no intrusive analytics, user-owned private practice data, exported backup, explicit opt-in notifications, permission-gated third-party media. Sanitize user-entered reflections and content sources.

---

# 14. DESIGN/ENGINEERING ACCEPTANCE TESTS

## Hero — pixel/visual quality
- Full **SAHAJA YOGA** visible; no residual SAHAJA-only branding in header/title.
- Central large 3D ivory lotus preserved from accepted screenshot.
- Small top-centre icon replaced by **permitted authentic Shri Mataji photograph**, or correctly labelled missing-asset placeholder pending photo approval.
- The **small left logo** may remain its lotus mark; central portrait never replaces central hero lotus.
- All primary controls work and are accessible; mobile not clipped or overcrowded.

## Meditation and counter correctness
- Total taps 0/9/10/11/20 have correct round counts and lap status.
- 10th tap closes first round; 11th tap belongs to second.
- Undo across boundary works, including after restored session.
- Pause does not accrue active time; refresh restores state reliably.
- Session completes once, history totals agree with log, no accidental loss of data.
- Large counting target works with keyboard and mobile touch; optional sound and vibration can be turned off.

## Chakra experience
- Vishuddhi opens into a blue environment with recognisable, correctly reviewed sixteen-petalled 3D form.
- Raga Jayjayvanti control appears with rights/attribution; no surprise loud autoplay. If licensed track absent, a polished muted unavailable/approved-stream placeholder is used.
- Chakra switching does not unexpectedly destroy session or reset global audio settings.
- Source review gates any mantra/affirmation/aspect-specific claims.
- Atlas is keyboard- and touch-operable and has a non-WebGL fallback.

## Whole-product QA
- All listed primary routes load directly on refresh and navigation works.
- Desktop, tablet, mobile, reduced-motion and low-performance fallback work.
- Offline core meditation timer/counter and local history work after initial installation.
- Audio errors and permissions are handled cleanly.
- Source/permissions for all photographs, texts, tracks and talks are documented.
- No medical/spiritual-diagnostic claims, fabricated religious quotations or unauthorised affiliation.

---

# 15. BUILD ROADMAP AND SHIP GATES

## Phase 0 — Audit and protect current work
1. Open existing repo and inspect routes, design system, 3D lotus asset, working features, packages and performance.
2. Compare current hero with approved screenshot; document what is already correct.
3. Keep a safe checkpoint/branch before changes. Do not overwrite polished components without reason.
4. Make a dependency/asset register, especially genuine Shri Mataji photo and chakra art/audio rights.

## Phase 1 — Design foundation and approved hero
1. Establish coherent typography, design tokens, navigation, responsive behaviour and page shell.
2. Preserve existing lotus hero; change full name to SAHAJA YOGA; replace only small top-centre symbol with licensed portrait.
3. Build responsive visual states and refine with actual screenshots.
4. Confirm hero is excellent before mass-producing secondary sections.

**Ship gate:** Hero matches approved direction on desktop and mobile, all header and hero actions work, portrait handling is ethically and legally correct.

## Phase 2 — First complete chakra world (Vishuddhi)
1. Create shared atlas/chakra environment architecture.
2. Build accurate 3D Vishuddhi with blue environment, transitions and source panel.
3. Implement first persistent audio integration for Jayjayvanti if licensed/embeddable, otherwise correct placeholder.
4. Integrate elegantly designed timer/10-lap counter interface.
5. Screenshot review and motion/performance refinement.

**Ship gate:** One chakra world is truly polished; not a static concept image.

## Phase 3 — Working daily meditation engine
1. Build phase/routine state machine and two supported sequence templates.
2. Implement Kundalini raising, Bandhan and source-approved Maha Mantra modules.
3. Build three premium meditation interface states (guided, immersive, silent).
4. Add proper ten-lap counter/timer, pause, undo, reset, autosave and restoration.
5. Add completion/save and core tests.

**Ship gate:** Practitioners can finish a realistic session end-to-end without bugs or placeholders.

## Phase 4 — Seven chakras and content
1. Extend atlas and per-chakra worlds using validated art/data.
2. Add source-reviewed guidance and licensed audio choices.
3. Build smooth switching, non-WebGL fallback and accessibility.
4. Add new seeker learning path and useful library sections.

## Phase 5 — Personal system and offline polish
1. Practice overview, history/calendar, saved routines, insights and notes.
2. PWA, offline, export/delete, error recovery, optional reminders.
3. Tune advanced responsiveness, keyboard use, reduced motion, low-GPU and resource loading.

## Phase 6 — Release QA
1. Visual design review on every main screen; do not accept generic UI regressions.
2. Test successful full session, interruption/resume, audio fallback, 10-lap boundaries, navigation and offline performance.
3. Obtain content approval and audio/photo licences; label independent project appropriately.
4. Deploy preview, test in real browsers/devices, fix issues, then launch.

**Priority rule:** Make a few canonical experiences exceptional before spreading effort across dozens of mediocre routes. Start with **Approved Hero → Vishuddhi World → Meditation Screen + 10-Lap Counter → Complete Daily Ritual**.

---

# 16. WHAT CLAUDE MUST DELIVER

Before writing large amounts of new UI code, produce:
1. Short audit of existing code and what must be preserved.
2. Route map, component/state architecture and proposed user flows.
3. Visual-system decisions and *three distinct layout explorations for the meditation screen* (art direction, not generated static hero images).
4. Asset register: available, missing, licensed/approved, pending review.
5. Sprint plan with dependencies and measurable acceptance criteria.

Then **execute**, not just plan:
- Build working components, run locally, capture actual screenshots, inspect, critique and improve.
- Keep features usable and tests passing after each phase.
- Show what changed, how to run it and what still needs an approved asset or human content review.
- Don't falsely report inaccessible/unfinished content as complete.
- Do not introduce unrelated design frameworks, large dependency stacks, or AI-generated religious source material.

---

# 17. REFERENCE SOURCES FOR CONTENT VALIDATION

Use these as starting points for verified content. They are research references, **not blanket licences to reproduce** media or copyrighted text:

- https://us.sahajayoga.org/ — Sahaja Yoga USA
- https://us.sahajayoga.org/chakras/ — Chakra background
- https://us.sahajayoga.org/nadis/ — Three channels
- https://us.sahajayoga.org/meditation-videos/ — Meditation practice guidance
- https://shrimataji.org/how-to-meditate/ — Meditation teaching resources
- https://us.sahajayoga.org/wp-content/uploads/2024/12/From_Mantra_to_Silence_2024_USA_rev5.pdf — Mantra sequence and usage references
- https://seattle.sahajayoga.org/handouts/ — Sahaja Yoga teaching handouts
- https://www.discoversahajayoga.org/meditation-at-home — Practical guidance
- https://sahajsongs.bandcamp.com/album/music-and-meditation — One possible reference for chakra-related raga recordings (rights must be checked)

---

# 18. FINAL NORTH STAR

**SAHAJA YOGA is a fully functioning, beautifully art-directed digital meditation space.**

The entrance is bold and exceptional: giant SAHAJA YOGA typography, the **existing immaculate ivory lotus**, a **small genuine Shri Mataji photo at the top centre**, and restrained editorial navigation.

The chakra system transforms into seven distinct, carefully made 3D environments with source-verified content and appropriate optional ragas. Vishuddhi is blue with sixteen petals and Jayjayvanti.

The actual meditation interface is as polished as the hero: a deliberate central composition, elegant timer, completely reliable **10-lap mantra counter**, a customisable Sahaja Yoga ritual flow, optional silence and uninterrupted saved history.

**Every beautiful detail must make the meditation easier, not harder.**
