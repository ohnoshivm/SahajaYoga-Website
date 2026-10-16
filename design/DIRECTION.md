# SAHAJA YOGA · Direction v1.1 (Evolution of the approved design)

**Design read:** immersive meditation companion · regular Sahaja Yoga practitioners first, new seekers second · warm, monumental, sacred stillness · editorial minimalism with one luminous 3D object per screen.

**Theme statement:** *luminous, unhurried sanctuary.*

**Dials:**
- **Variance 3:** centred, axial.
- **Motion:** 6 while exploring, 1 while meditating.
- **Density 2:** gallery-airy.

**Refresh depth:** Evolution. The composition, palette, type and objects stay exactly as approved. The interaction and transition grammar is raised to Buttermax and Noomo Labs level.

**Binding limits (master plan §11):**
- Pointer depth on the lotus only.
- No cursor gimmicks, infinite spins, bloom spam, rainbow particles or high-frequency pulses.
- No motion on the portrait.
- Almost nothing moves while meditating.

## Keep · Evolve · Retire

| Trait | Verdict | Why |
|---|---|---|
| Ivory room, monumental Cormorant, lotus in front of type | **Keep** | Approved composition; it is the brand. |
| Seven chakra worlds (deep field, the hue on the form) | **Keep** | Meaningful colour and AA/AAA contrast. |
| Pearl and gold chakra family | **Keep** | One coherent object language across all seven. |
| Mala seeds (10 per round) | **Evolve** | Each tap springs the seed (scale 1.3 → 1, spring). A round closes with one slow gold wave across all ten. |
| Static page changes | **Evolve** | Entering a world opens its colour as a circle from the exact point you clicked (Buttermax cursor-origin transition, slowed to 900 ms). The form travels from your click to the centre. Leaving reverses it. |
| Chakra forms | **Evolve** | Live 3D in every world. Iridescence shifts as the form tilts toward the pointer, so the petals visibly catch light. Max tilt is ±4°, the triangle always points down, and nothing spins. |
| The Ascent | **Evolve** | One pinned scene, scrubbed at 0.8. Colour floods from below (clip-path). A Kundalini line rises up the spine rail as light. Forms rise with depth (scale 0.86 → 1). Names wipe through a horizontal mask. |
| Hover on lists | **Evolve** | The row slides and its object rises (Buttermax project grid). The leading status dot is dropped. |
| Hold-to-bloom | **Evolve** | Contextual ring cursor ("Hold", with a progress arc) on the lotus only. On completion, the breeze rises and the view glides into the Ascent. |
| Route changes | **Evolve** | A soft blur-mask cross-fade (Büro, 450 ms). No preloader. |
| Eyebrow labels above headings ("Chakra 5", "Raga" over the raga name) | **Retire** | A generated-UI tell. The heading carries itself, e.g. "Raga Jaijaivanti" as one line. |
| Status dots in front of hovered rows | **Retire** | A decoration-noise tell. Ink, weight and shift carry the state. |
| Scroll arrow on the hero | **Keep** | Part of the approved reference; it is also a real link to the Ascent. |

## Motion tokens

| Token | Value | Use |
|---|---|---|
| `--ease-out` | cubic-bezier(.16,1,.3,1) | Entrances, reveals |
| `--ease-calm` | cubic-bezier(.45,0,.2,1) | Colour and tone shifts |
| Reveal | 1.1–1.3 s, stagger 0.06 | Monumental type |
| World open | 900 ms | Cursor-origin colour circle |
| Seed tap | 240 ms spring | Counter |
| Round wave | 1.6 s | 10th tap |
| Breath | 10 s cycle | The only ambient rhythm, used while exploring and never during a session |

## Implementation rules (ui-ux-pro-max)
- Cap device pixel ratio at 2.
- Pin only the Ascent.
- Refresh ScrollTrigger after fonts and images load.
- Respect reduced motion: render final states and use still renders.
- Touch targets are at least 44 px.
- Focus stays visible and is never hidden under the header.
- Contrast is AA everywhere.
