# Teardown: Noomo Labs · Buttermax · Büro (Burocratik)

Captured 16 Oct 2026. Method: downloaded each site's HTML and every JS/CSS/shader bundle (including Noomo's lazy Nuxt chunks, Buttermax's Hydra app, compiled shader pack, and UIL config), read the code, and drove each site in a real browser for screenshots. Screenshots are in `shots/`.

Each point is marked **[code]** (read directly from the shipped source), **[seen]** (observed in the browser), or **[inferred]** (my reading of how the pieces fit together).

---

## TL;DR: three different philosophies

| | Noomo Labs | Buttermax | Büro |
|---|---|---|---|
| Core idea | A **game-like 3D ritual**: gate, hold, explode, explore | The **whole site is one WebGL canvas**, with no DOM text at all | A **DOM-first editorial site** with personality layered on top |
| Stack | Nuxt 3 + Vue + Pinia, Three.js r164, GSAP 3.14 (ScrollTrigger, ScrollSmoother, Observer, Flip, CustomEase), cannon-es physics, lil-gui | Next.js shell + **Hydra** (Active Theory's in-house WebGL engine), GSAP, Lenis, Lottie rendered to GPU textures | Nuxt 2 + Vue, GSAP (ScrollTrigger, SplitText, Flip, CustomEase), Lenis, Rive, Web Audio |
| Signature move | Glass jellyfish + hundreds of physics glass shards; click-and-hold to "step into the future" | Mouse **fluid simulation** that warps every surface; dot-pattern **scene transitions**; motion-vector "3D" devices | A **chat-bot pill** that talks to you; audio-reactive waveform dividers; image spawner trail; screen shake |
| Color | Pale lavender→blue gradient, black type, glass | Butter yellow `#F9D648`-ish + near-black `#101010` | Black/white, huge Gräphik type, video color |
| Sound | Yes: ambient bed, collision SFX, "particle scattering" on success | Minimal | Yes: Bach, bass hit, spawn sound, waveform visualisation |

---

## 1. Noomo Labs: labs.noomoagency.com

### Stack [code]
- Nuxt 3 (`/_nuxt/` hashed chunks), Vue SFCs, **Pinia** store as the event bus (`$onAction` listeners for `startProgress`, `finishProgress`, `showScene`, `toggleSound`, `setJelColor`, and so on).
- **Three.js r164** (`window.__THREE__ = "164"`), GLTFLoader + DRACOLoader + KTX2, RGBELoader (HDR), FontLoader + TextGeometry.
- **GSAP 3.14.2** with ScrollTrigger, **ScrollSmoother**, Observer, Flip, CustomEase, `quickTo`.
- **cannon-es** physics (bodies, sphere shapes, gravity, `applyForce`, `beginContact`).
- **lil-gui** debug panels left in production (hidden), plus Stats.js. These show that every material value was tuned live.
- Fonts: **Druk Medium** (condensed display) + **IBM Plex Mono** (UI/labels). `cursor: none` on body, so there is a custom cursor.

### Experience flow [seen + code]
1. **Gate screen** (`shots/noomo-01-gate.jpg`): giant Druk "IMMERSE [START] ME IN →", with a circular START button in bracket corners `[ ]`. Underneath: a sound toggle ("TO MAKE THIS EXPERIENCE MORE IMMERSIVE WE USE SOUND EFFECTS"). The gate exists to unlock browser audio and set expectations.
2. **Preloader** with a percentage, driven by real asset stages: HDR at 12%, 3D font at 20%, materials at 25%, Scene14.glb, then 90%, 95%, and 100% (`setPreloaderPercentage(…)`). Exit uses a `clip-path: inset(...)` + `scale` reveal.
3. **Intro camera move**: the camera starts at `z = 300` (far away); `showScene` tweens it to the GLB's camera-empty position over **2s `power2.inOut`**, while a giant env-sphere scales 0.3 → 1.
4. **"ARE YOU READY TO STEP INTO THE FUTURE? — CLICK AND HOLD"** bar along the bottom (`shots/noomo-02-hold.jpg`).
5. **Hold mechanic** (the hero interaction):
   - Hovering the glass object makes a raycast hit, so the custom cursor shows "Click and hold" and an invisible physics sphere (r = 0.7) follows the hit point and *pushes* the shards.
   - **mousedown** calls `startProgress`: a 2s linear GSAP timeline fills the progress bar. Meanwhile each shard body's mass goes up to 5, the container sphere radius tweens 2.81 → 1 (`power2.out`), gravity flips to 0.2, and the attractor force inverts (`Vt = -20`). The shell pulls inward, as if charging.
   - **mouseup** before completion reverses the timeline (`n.reverse()`) and restores radius and forces. Because the action is reversible, the user is encouraged to commit.
   - **Completion** triggers `finishProgress`. `ParticleScattering.mp3` plays, the container and cursor bodies are removed, gravity is set to `(0, 8, -10)`, and force goes to −100. The shards **explode outward**, then everything eases back to zero gravity over 3s. Each shard then floats forever (`sine.inOut` yoyo, 15s, random 1–3 unit offsets).
6. **Scroll journey** (~10,500px of scroll, `ScrollSmoother` for inertia):
   - 3D text "NOOMO LABS" (Druk TextGeometry) slides left and out over the first 900px.
   - The **jellyfish** (Scene14.glb) has 7 baked animation clips, all **scrubbed by scroll** (`action.time = 25 * progress`), while one idle clip loops on its own. Scroll *velocity* speeds up the idle loop (`timeScale = 1 + |v|/800`).
   - Jellyfish colours lerp by scroll: user colour → `#baf6fc` (0–1000px) → `#0061ff` → `#fffc41` at the 2000/3000/4000px checkpoints.
   - Side copy blocks fade in at precise pixel triggers (`top+=500`, `3700`, `4100`, … `8500`), with a % scroll readout and a left rail of crosses with "AR / 3D / AI / XR" labels.
   - At 8000–9000px, a footer field of **physics spheres** (Sphere_footer_baked.glb with a baked texture) gets an attractor force that swings 15 → −15 (yoyo), so they rush in and out.
7. **Work orbs**: 4 glass case-study objects (`Work_1..4_Empty`). On hover, scale 10000 → 12000 and material `distortion` 0 → 15 (`0.5s power2.out`), with the cursor reading "View Case". Click routes to `/cases/…`.
8. **"Customize me" panel**: users pick jellyfish inner/outer colours from a 28-swatch palette, plus opacity and reflectivity sliders, and "pattern" options. Personalisation is the retention hook.
9. **Error/404 scene** is also 3D (`errorModel.glb`).

### Rendering and materials [code]
- **MeshTransmissionMaterial**, ported from pmndrs/drei: a custom `onBeforeCompile` injects simplex noise (`snoiseFractal`), chromatic aberration, anisotropic blur, temporal distortion, and Beer's-law attenuation. Three separate instances have their own render targets (1024 or 512 px, depending on device).
- **Manual transmission passes**: for each glass mesh, it swaps material, renders the scene to an FBO, then uses that FBO as the refraction buffer. It does a backside pass too (`backside: true`, `thickness 5`, `backsideThickness 1.5`). This is why the glass looks like real, thick refracting gel.
- Jellyfish glass: reflectivity 0.04, anisotropy 0.5, samples 4 on desktop / 2 on mobile.
- Shards glass: `chromaticAberration 0.02`, `anisotropicBlur 15`, `temporalDistortion 0.3`, `attenuationDistance 2`.
- **Shard generation trick**: `segRoman.glb`/`half4.glb` geometry is read triangle by triangle. Each face gets a physics body with an "attractor point" at the face centroid. That makes the shell self-assemble and lets it explode back into pieces.
- Environment: `photo_studio_01_1k.hdr` as IBL. A giant inverted sphere (r = 80) carries `sphere5.png` as its map, with a 100×-tiled black/white pattern as a **lightMap**, creating the subtle patterned studio backdrop.
- Renderer: `powerPreference: "high-performance"`, antialias. Pixel ratio is capped at **1.5** on retina and 0.5 on >2560px 1× screens, a deliberate perf budget. Tone mapping is on and shadows are off.
- **Mouse parallax**: the camera parent group rotates ±1/30 rad toward the cursor via `gsap.quickTo(…, {duration: .4, ease: "power1.out"})`.
- The GSAP ticker is locked to **60fps** and drives the physics step (`world.step(1/60)`) + render.

### Sound design [code]
- `BG5.mp3` ambient loop (fades 0.5s on toggle), `Sphere-collision.mp3` for glass hits, and `ParticleScattering.mp3` on hold-complete. The waves icon toggles sound and animates (`@keyframes soundLine`).

### Design system [code + seen]
- Type: Druk (all-caps, condensed, huge) paired with IBM Plex Mono (small caps labels in `[BRACKETS]`).
- Nav: `[WORK] [NOOMO AGENCY] [CONTACT]`, bracket-wrapped mono.
- UI chrome: corner-bracket frames, crosses, thin progress bars, `backdrop-filter: blur(12–16.75px)` glass panels, and `mix-blend-mode: difference` on the cursor.
- Keyframes: `infinityLineMove` (marquee), `soundLine`.

---

## 2. Buttermax: buttermax.net

### Stack [code]
- Next.js is only a shell. The real app is `/assets/js/app.<ts>.js` (1.1 MB), built on **Hydra**, Active Theory's proprietary WebGL framework. Evidence: `hydra-thread.js` web-worker pool (8 threads), `/assets/data/uil.json` (UIL = Hydra's live-tweak config, **2,879 keys**), `/assets/shaders/compiled.vs` (a 163 KB pack of 120+ shaders with `#require()` includes and `#test Device.mobile` branches), and classes like `FXScene`, `SceneLayout`, `GLUIStage`, `GLUIBatchText`, `Nuke`, `FluidScene`.
- **There is zero DOM content**: `document.body.innerText === ""`, `scrollHeight = viewport`. Everything you see is a single `<canvas>`: text, buttons, grid lines, video, and the cursor. Scroll is virtual (Lenis-style values fed into shaders).
- Text is **MSDF** (multi-channel signed distance field) font atlases (`Decagram-SmBd.json`), rendered by `GLUIBatchText` / `MSDFTextureShader` / `MaskedText`, so type stays razor-sharp at any scale.
- **Lottie → GPU**: `LottieTexture` / `LottieMesh` / `LottieShader` render Lottie animations to a canvas and upload them as textures, so vector animations live inside WebGL (logo, tagline).
- Content from a headless CMS (Payload-style JSON on Google Cloud Storage): 15 projects, each with `colors {primary, secondary, tertiary}` and `maps.device` (`headphones`, `laptop`, `dashboard`, `boombox`, `keycard`, `gameboy`, `controller`, `tablet`, `magnifying-glass`) plus `glass: true/false`.

### Visual language [seen]
- Butter-yellow field, near-black `#101010` (hard-coded as `16/255` in shaders), with a giant black grotesk "Butter" + hand-scribbled script "max" (`shots/buttermax-01-hero.jpg`).
- **Hero**: a hyper-detailed **3D retro device** (transparent Game Boy-style handheld with a live screen showing a case study) sits on top of the wordmark and cycles through devices.
- Vertical side text "The Gold Standard in Buttery Smooth Digital Production", plus a scroll-down arrow and a blob-ink animated logo.
- Reel section: a full-bleed dark 3D render (subwoofer, glowing orange rim) with a giant overlaid uppercase statement (`shots/buttermax-02-reel-text.jpg`).
- **Project grid**: thin 1px grid lines on yellow. On hover, a **project-coloured circle blob** grows, the **3D device** for that project rises in, and the project name appears in large type behind it (`shots/buttermax-03-grid-hover.jpg`). The cursor itself is a black blob that grows into a circle mask.
- Footer: black block, huge yellow "REACH OUT", and a circle mask that scrolls up like a sun setting (`shots/buttermax-04-footer.jpg`).

### Signature tech [code]
1. **Mouse fluid simulation** (`FluidScene`, `splatShader`, `advection`, `divergence`, `pressure`, `vorticity`, `curl`), a classic Navier-Stokes GPU fluid. UIL params: `simSize 128`, `dyeSize 512`, `pressure 8` iterations ×10, `velocity 0.985`, `density 0.95`, `radius 30`. The splat uses a **line segment between previous and current mouse point** with a `cubicOut` falloff, so fast strokes don't break into dots.
   - The fluid output is a global texture `tDraw` (R = pointer trail, G = fluid, B = pointer). **Almost every shader samples it**, so the mouse disturbs every surface:
     - Images/video: UV offset + RGB shift scaled by fluid, plus a "scanline" mod distortion inside the fluid.
     - Logo: inside the fluid, colour flips to an **animated rainbow** (HSV hue cycling) and then to white.
     - Marquee MSDF text: switches from `#101010` to **yellow `#FFD600`** where the fluid touches.
     - Shapes/borders: colour 1 → colour 2 under the fluid (`step(0.5, fluid*2)`). The effect is like **a spotlight that inverts the UI**.
2. **Scroll-velocity distortion** (`ButtermaxVFX.fs`, a full-screen post pass):
   - Scales the frame by velocity and bends UVs vertically near the cursor's x-position.
   - Adds a ripple ring around the mouse whose amplitude is scroll speed.
   - Outside the safe band (`|uv.y-0.5| > 0.51`), it applies an extra 1.15 zoom + scanline "smear" + rotated RGB split, so the top and bottom edges **tear** while you scroll fast.
   - Tone mapping options (Uncharted2 / Unreal), hue shift, saturation.
   - Composite values: `uRGBShiftAmount 0.05`, angle 1.02, `uFinalGamma 0.622`, bloom scale `[0.9, 2]`, bloom tint `#fff38a` (warm butter bloom), luminosity threshold 0.995 (only hot highlights bloom).
3. **Page/scene transitions** (`SceneTransition.fs` / `ScrollSceneTransition.fs`):
   - A **halftone dot grid** grows from the **mouse position** (`circleExp` radius 0 → 15 by transition). Dots are `mod`-repeated circles at three sizes with blur.
   - The old scene gets **CRT barrel distortion**, zooms 1 → 2.2 from an origin near the mouse, and rotates by `mouse.x * 0.3`. The new scene comes from 0.6 scale with inverse pincushion.
   - A **rainbow fringe** rides the dot edge (desktop only).
   - The result: every navigation dissolves through a dot pattern that starts where you clicked.
4. **Motion-vector flipbooks** (`MotionVectorShader`, `mv_*` layouts for boombox, controller, gameboy, glove, headphones, headset, keycard, laptop, polaroid, printer, tablet, and more):
   - The "3D devices" are mostly **pre-rendered sprite sheets** plus a **motion-vector texture**. The shader blends frame N → N+1 by warping each frame along its motion vectors. That gives buttery in-between frames from few sprites, so the result looks like real-time path-traced 3D at flipbook cost. [inferred: this is the classic Active Theory technique; the shader code confirms the sub-UV + displacement blend]
   - The frame index is driven by `uTransition` and then **`uMouse.x`**, so moving the mouse rotates the object.
   - Live case-study screens are composited onto the device (`tImage1/2`, `tReel`, `tGlass`), with a separate `GlassShaderPBR` for transparent devices (fresnel pow 10, frosted 0.3, tint `#1a1a1a`).
5. **Grid hover**: `GLUITrailMediaShader` reveals media through a circle (`uTrail` radius discard mask). `RevealingDotShader` / `CircleGridShader` / `DotShader` are the dot motifs.
6. **Velocity on everything**: background, detail media, and profile illustrations all take `uVelocity`, so content stretches and lags with scroll speed.

### Takeaways
- The "smoothness" is the product. The tagline literally is "buttery smooth", and the effects demonstrate it.
- One global interaction texture (`tDraw`) shared by all materials is the most reusable idea here: one cheap sim gives you site-wide reactive behaviour.

---

## 3. Büro (Burocratik): burocratik.com

### Stack [code]
- **Nuxt 2** (static generation, `__NUXT_JSONP__`), Vue 2 custom directives, **GSAP** (ScrollTrigger, SplitText, Flip, CustomEase, inertia), **Lenis** (`html.lenis.lenis-smooth`), **Rive** runtime (state machines), **Web Audio** (`AudioContext` + `AnalyserNode`), Umami + GA analytics.
- Font: **Commercial Type's Graphik** ("Commercial Gräphik Web", 400 + italic). There is one family and one weight; hierarchy is done by **size alone**.
- Media served from DigitalOcean Spaces as MP4 with separate `-mobile.mp4` variants; `#t=0.01` forces a first-frame poster.
- **Material 3 motion tokens** registered as GSAP eases: `m3.standard (0.2,0,0,1)`, `m3.standard.decelerate (0,0,0,1)`, `m3.standard.accelerate (0.3,0,1,1)`, `m3.emphasized.decelerate (0.05,0.7,0.1,1)`, `m3.emphasized.accelerate (0.3,0,0.8,0.15)`, `m3.legacy (0.4,0,0.2,1)`. Plus `power2/3/4`, `expo`, and one custom curve `M0,0 C0.01,0.222 0.048,0.521 0.222,0.746 0.418,1 0.895,1 1,1` (a very fast-start, long-tail settle).

### The architecture of personality: custom directives [code]
They built their own motion vocabulary as Vue directives, used declaratively in templates:
- `v-motion`, `v-motion:parallax`, `v-motion:line-divider`: scroll-linked enter animations.
- `v-intersection`: viewport state (`data-intersecting`).
- `v-pointer:eyes`, `v-pointer:grab`, `v-pointer:pointer`, `v-pointer:pointershift`: **cursor modes**. Examples: an eyes cursor over the reel video, a grab hand on sliders, a pointing hand on links, and a "shift" offset/magnet on accolade logos.
- `v-bot:event`: the **bot pill**, the site's best idea (below).
- `v-prevent-scroll`, `v-lifecycle`.

### Signature features [code + seen]
1. **The bot pill** (bottom-centre floating dark pill with icon + message + "Homepage" + "+" menu).
   - Messages change **contextually** on intersection, hover, or custom events, with emoji icons:
     - Manifesto section: "That's Bach, btw!" / "Not quite my tempo and note spacing!"
     - Hovering the 18-years Rive emoji: "Family-friendly website right here" (because the Rive file is literally a middle-finger emoji 🤘, `fuck_emoji.riv`)
     - Work section: "A glimpse of our latest work, fresh and minty"
     - Branding link: "Oh yes, Büro does branding too. Click."
     - "Yes, '99 is right." / "Proud" / "Join us!" / "I'm not crying, you're crying..."
   - **Tab-away guilt trip**: on `window.blur` it picks a random line ("Please come back...", "We see you clicking away!", "We're waiting...", "Take your time", "Sure, click away, idc"). On return after more than 10s: "Hey! Welcome back!" 🖖. The tab title also changes.
   - The message swap is a split-text slide transition between `.active` and `.aux` layers.
2. **Audio-reactive line dividers**: each manifesto row's 1px divider is a `<canvas class="wave" data-audio="wave">`. An `AnalyserNode` (fftSize 2048, smoothing 0.8) reads time-domain data at 60fps, and the line is redrawn **pixel by pixel with Bresenham** (`fillRect(x, y, 1, 1)`). The flat rule becomes a live oscilloscope of the Bach track. Typography and audio share one line.
3. **"18 fkn Years" moment**: on scroll into view, "fkn" slides up (`yPercent 105`, `0.9s power3`). Then a Rive emoji pictogram drops in (`scale 2 → 1`, `rotate -30 → 0`, **`bounce.out`**). **Click the emoji** and the whole `<main>` **shakes**: 28 micro-tweens of `xPercent ±0.2` (±0.5 on mobile) at 37.5ms each, with a bass drop (`18fkn-bass.mp3`). After 3 clicks the bot says "Yeaah! Shake that <body />" 🤘.
4. **Pointer image spawner**: moving the mouse over certain areas **spawns images** (cloned from `data-spawnable` sets) along the cursor path. Throttle: `minTimeDelta 500ms`, `minDistanceDelta 100px`, `spawnWhileIdle`. A looping `image-spawn.mp3` swells on move start and releases over 2.5s on stop. This is disabled on touch devices.
5. **Live counters**: "7.459 days" (days since founding, computed live), "No. awards 307" in gigantic numerals (`shots/buro-03-awards.jpg`).
6. **Hero**: black screen with a glossy black 3D sphere (pre-rendered video, `globe-about-v2-rip.mp4` / reel teaser) and pleated, fan-like folds (`shots/buro-01-hero.jpg`). The section transitions into a **red fan render** behind the intro statement (`shots/buro-02-intro.jpg`).
7. **Reel teaser** with an eyes cursor and a sticky video container; click opens the full reel. The title is split by words (`SplitText` with `m-c` mask containers + `m-t` translate fragments, the standard masked line-rise).
8. **Page transitions**: each page has a `[data-blur-mask]` overlay used for a **blur transition** between routes. `transition.setup` → `onEnter` resizes the scroller and refreshes ScrollTrigger.
9. **Accordions** animate height with duration **proportional to content height** (`clamp(0.0033 * h, 0.4, 0.7)s` open with `m3.standard`; `clamp(0.0016 * h, 0.3, 0.6)s` close with `power2`). Big panels take longer, small ones snap.
10. **Team list** "Every Büro, through the years." lists every employee ever, with † for the deceased, in a typographic column (`shots/buro-02-intro.jpg`).
11. **Numbered manifesto**: 7 statements; the active row darkens and the others fade to grey based on scroll position (`shots/buro-04-manifesto.jpg`).
12. **Work grid**: an asymmetric 2-col grid of big project tiles with hover video thumbs, label rows "Project / Service / Industry" (`shots/buro-05-work.jpg`).

### Design system [seen + code]
- 24-column grid (`g-col xxl-7 xxl-offset-12 md-9 sm-12 xs-24`), with sizes in **vw** (`1.2vw`, `3.2vw`) so the whole layout scales fluidly.
- One typeface and one weight; hierarchy comes from extreme size contrast (body ~16px vs numerals at ~30vw).
- Emoji used as inline glyphs inside headings (🤟 💫), mixing tone with type.
- Black/white base. Colour comes only from media.

---

## 4. Cross-site patterns worth stealing

1. **A gate that earns attention** (Noomo): "START / sound on" both unlocks audio and frames the site as an *experience*. The cost is friction, so use it only when there's a payoff.
2. **Reversible commitment interactions** (Noomo's hold-to-charge): build anticipation, show progress, allow backing out, and then pay off big (explosion + sound).
3. **One global interaction field** (Buttermax `tDraw`): simulate the cursor once and let every material read it. That one texture creates the "everything responds to me" feeling.
4. **Scroll velocity as a design input** (all three; most aggressive at Buttermax): distortion, RGB split, animation timeScale, and stretch, all from scroll speed.
5. **Transitions that start from the cursor** (Buttermax dot-dissolve from the mouse position; Büro blur mask).
6. **Personality as a system, not a stunt** (Büro): bot messages, tab-blur guilt trip, screen shake, Bach-driven dividers. They are declarative directives sprinkled across templates, which makes them cheap to add per section.
7. **Fake 3D, real smoothness** (Buttermax motion-vector flipbooks, Büro's pre-rendered sphere videos): pre-render the heavy beauty shots; do only the interactive layer live.
8. **Perf budgets in code**: DPR cap 1.5, FBO 1024→512 on smaller screens, samples 4→2 on mobile, fluid at 128 sim / 512 dye, separate mobile videos, spawner off on touch.
9. **Typography discipline**: Noomo uses Druk + mono brackets; Buttermax uses a grotesk + scribble script (MSDF); Büro uses a single Graphik weight at huge scale. Each site commits to one idea.
10. **Sound as feedback, not wallpaper**: collision, burst, bass hit on click, and a spawn hum that follows mouse movement.

## 5. If applying to the AdvrtizX site (solid red/white only)
- Büro-style **bot pill** in red/white, with lines in your voice; this is cheap and high-character.
- Buttermax-style **cursor fluid** but **2-tone**: under the fluid, white↔red invert (`step(0.5, fluid)`) instead of a rainbow. This respects the solid-colour rule (no gradients or glows).
- **Hold-to-enter** on the blueprint villa hero: hold to "build" the villa (lines draw in, then a snap + sound), with release reversing it.
- **Cursor-origin transitions**: a halftone dot dissolve in solid red.
- Skip: Noomo's gradient backdrop and glass (conflicts with the solid-bg rule), and Buttermax's bloom/rainbow.

## Gaps / unknowns
- Noomo's WebGL didn't fully render in my preview browser, so its 3D look is reconstructed from code, not seen. The gate, hold UI, and copy were seen.
- Buttermax's device flipbook asset format (sprite sheet resolution, frame count) wasn't inspected. The shader logic was.
- Büro's hero sphere is assumed to be pre-rendered video (from the asset list); I didn't confirm which file plays in the hero slot.
- Page-to-page transitions on all three were read from code, not recorded.
