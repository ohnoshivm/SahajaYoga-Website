/**
 * Raga playback. Plays the licensed recording at `file` if it exists.
 * Until one is added, it falls back to a synthesised tanpura drone
 * (Pa · Sa · Sa · low Sa) tuned to the raga's Sa, clearly labelled as a placeholder.
 */
export type RagaSource = 'recording' | 'drone'

export class RagaPlayer {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private audio: HTMLAudioElement | null = null
  private timer: number | null = null
  source: RagaSource | null = null

  constructor(private file: string, private sa: number) {}

  async detect(): Promise<RagaSource> {
    try {
      const r = await fetch(this.file, { method: 'HEAD' })
      const type = r.headers.get('content-type') ?? ''
      this.source = r.ok && type.startsWith('audio') ? 'recording' : 'drone'
    } catch {
      this.source = 'drone'
    }
    return this.source
  }

  async play() {
    if (!this.source) await this.detect()
    if (this.source === 'recording') {
      this.audio ??= Object.assign(new Audio(this.file), { loop: true, volume: 0 })
      await this.audio.play()
      this.fadeElement(0.8)
      return
    }
    this.ctx ??= new AudioContext()
    await this.ctx.resume()
    if (!this.master) {
      this.master = this.ctx.createGain()
      this.master.gain.value = 0
      this.master.connect(this.ctx.destination)
    }
    this.master.gain.cancelScheduledValues(this.ctx.currentTime)
    this.master.gain.setTargetAtTime(0.32, this.ctx.currentTime, 0.8)
    this.cycle()
  }

  pause() {
    if (this.audio) {
      this.fadeElement(0, () => this.audio?.pause())
    }
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4)
    }
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  dispose() {
    this.pause()
    setTimeout(() => this.ctx?.close(), 1500)
  }

  private fadeElement(to: number, done?: () => void) {
    const a = this.audio
    if (!a) return
    const from = a.volume
    const start = performance.now()
    const step = () => {
      const k = Math.min(1, (performance.now() - start) / 1200)
      a.volume = from + (to - from) * k
      if (k < 1) requestAnimationFrame(step)
      else done?.()
    }
    requestAnimationFrame(step)
  }

  /** One tanpura cycle: Pa, Sa', Sa', Sa (low), about 5 seconds. */
  private cycle() {
    if (!this.ctx || !this.master) return
    const sa = this.sa
    const notes = [sa * 1.5, sa * 2, sa * 2, sa]
    const t0 = this.ctx.currentTime + 0.05
    notes.forEach((f, i) => this.pluck(f, t0 + i * 1.25))
    this.timer = window.setTimeout(() => this.cycle(), 5000)
  }

  private pluck(freq: number, at: number) {
    const ctx = this.ctx!
    const out = ctx.createGain()
    out.gain.setValueAtTime(0, at)
    out.gain.linearRampToValueAtTime(0.22, at + 0.04)
    out.gain.exponentialRampToValueAtTime(0.0008, at + 6.5)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2600, at)
    filter.frequency.exponentialRampToValueAtTime(900, at + 4)
    out.connect(filter).connect(this.master!)
    // The tanpura's buzzing "jawari": rich, slowly beating harmonics.
    const partials = [1, 2, 3, 4, 5, 6, 8]
    partials.forEach((h, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = i === 0 ? 'triangle' : 'sine'
      o.frequency.value = freq * h * (1 + (i % 2 ? 0.0018 : -0.0012))
      g.gain.value = 0.5 / (h * 0.9)
      o.connect(g).connect(out)
      o.start(at)
      o.stop(at + 6.6)
    })
  }
}
