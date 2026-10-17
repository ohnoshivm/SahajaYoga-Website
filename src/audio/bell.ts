/**
 * Soothing bells synthesised with Web Audio, so they sound the instant a lap is marked
 * (no file to fetch or decode). Partials follow real bell and singing-bowl ratios,
 * each slightly detuned for a slow shimmer, with long exponential decays.
 */
let ctx: AudioContext | null = null
let out: GainNode | null = null

function audio() {
  if (!ctx) {
    ctx = new AudioContext({ latencyHint: 'interactive' })
    out = ctx.createGain()
    out.gain.value = 0.9
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 3
    out.connect(comp).connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return { ctx, out: out! }
}

type Partial = [ratio: number, gain: number, decay: number]

function strike(freq: number, partials: Partial[], level: number) {
  const { ctx, out } = audio()
  const t = ctx.currentTime + 0.005
  const bus = ctx.createGain()
  bus.gain.value = level
  bus.connect(out)
  for (const [ratio, gain, decay] of partials) {
    for (const detune of [-1.2, 1.2]) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = freq * ratio
      o.detune.value = detune
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(gain / 2, t + 0.004)
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
      o.connect(g).connect(bus)
      o.start(t)
      o.stop(t + decay + 0.05)
    }
  }
}

/** A small, clear bell for each lap. */
export function lapBell() {
  strike(988, [
    [1, 0.5, 2.2],
    [2.0, 0.18, 1.4],
    [2.76, 0.12, 1.0],
    [5.4, 0.05, 0.5],
  ], 0.32)
}

/** A deeper singing-bowl tone when a round closes. */
export function roundBell() {
  strike(392, [
    [1, 0.55, 5.5],
    [2.71, 0.25, 3.6],
    [5.15, 0.12, 2.2],
    [8.5, 0.05, 1.2],
  ], 0.42)
  // A second, softer touch of the lap bell over it.
  setTimeout(lapBell, 90)
}

/** Call from the first user gesture so the first bell isn't delayed. */
export function primeBells() {
  audio()
}
