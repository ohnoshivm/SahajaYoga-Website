/**
 * Soft singing-bowl tones, synthesised with Web Audio so they sound the instant a lap is
 * marked (no file to fetch or decode).
 *
 * Serene rather than bright:
 * - tuned to the raga's Sa, so the bell sits inside the music instead of on top of it;
 * - a felt-mallet attack (tens of milliseconds, never a click);
 * - only consonant overtones (Sa, Pa, upper Sa), low in level;
 * - a slow 1 Hz shimmer from two strings a hair apart, the "wah" of a real bowl;
 * - a long, dark room tail from a generated reverb.
 */
let ctx: AudioContext | null = null
let bus: GainNode | null = null

/** The raga's Sa in Hz. The mantra screen sets it per chakra. */
let sa = 139.7

export function tuneBells(hz: number) {
  if (hz > 50 && hz < 500) sa = hz
}

/** A dark, decaying room: stereo noise with an exponential tail. */
function room(c: AudioContext, seconds: number, decay: number) {
  const len = Math.floor(c.sampleRate * seconds)
  const buf = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    let last = 0
    for (let i = 0; i < len; i++) {
      // One-pole low-pass on the noise keeps the tail warm, not hissy.
      last = last * 0.82 + (Math.random() * 2 - 1) * 0.18
      d[i] = last * Math.pow(1 - i / len, decay)
    }
  }
  return buf
}

function audio() {
  if (!ctx) {
    ctx = new AudioContext({ latencyHint: 'interactive' })
    const master = ctx.createGain()
    master.gain.value = 0.85
    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 2600
    tone.Q.value = 0.4
    const verb = ctx.createConvolver()
    verb.buffer = room(ctx, 4.5, 3)
    const wet = ctx.createGain()
    wet.gain.value = 0.38
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -20
    comp.ratio.value = 2.5

    bus = ctx.createGain()
    bus.connect(tone)
    tone.connect(master)
    tone.connect(verb).connect(wet).connect(master)
    master.connect(comp).connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return { ctx, bus: bus! }
}

/** [ratio to the bell's pitch, level, seconds to fade] */
type Partial = [ratio: number, level: number, fade: number]

function strike(freq: number, partials: Partial[], level: number, attack: number) {
  const { ctx, bus } = audio()
  const t = ctx.currentTime + 0.01
  const out = ctx.createGain()
  out.gain.value = level
  out.connect(bus)
  for (const [ratio, gain, fade] of partials) {
    // Two strings ~1 Hz apart beat slowly against each other: the bowl's breathing shimmer.
    for (const offset of [-0.5, 0.5]) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = freq * ratio + offset
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(gain / 2, t + attack)
      // setTargetAtTime gives the natural, ever-slowing fade of a resonating body.
      g.gain.setTargetAtTime(0, t + attack, fade / 4.5)
      o.connect(g).connect(out)
      o.start(t)
      o.stop(t + attack + fade + 0.5)
    }
  }
}

/** Each lap: a small bowl, two octaves above Sa, barely there. */
export function lapBell() {
  strike(sa * 4, [
    [1, 1, 2.6],
    [1.5, 0.08, 1.4],
    [2, 0.1, 1.2],
  ], 0.12, 0.018)
}

/** Each round: a deep bowl one octave above Sa, with Pa and upper Sa beneath it. */
export function roundBell() {
  strike(sa * 2, [
    [1, 1, 7],
    [1.5, 0.14, 4.5],
    [2, 0.2, 5],
    [3, 0.04, 2.4],
  ], 0.22, 0.04)
}

/** Call from the first user gesture so the first bell isn't delayed. */
export function primeBells() {
  audio()
}
