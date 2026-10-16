/**
 * Raga playback, in order of preference:
 * 1. `recording`: the full piece bundled in /public/audio.
 * 2. `stream`: the same passage streamed from its archive (start/end seconds within a longer tape side).
 * 3. `drone`: a synthesised tanpura (Pa · Sa · Sa · low Sa) tuned to the raga's Sa, if neither can play.
 */
export type RagaSource = 'recording' | 'stream' | 'drone'

export type RagaTrack = {
  file: string
  stream?: { url: string; start: number; end: number }
  sa: number
}

export class RagaPlayer {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private audio: HTMLAudioElement | null = null
  private timer: number | null = null
  private segment = { start: 0, end: Infinity }
  source: RagaSource | null = null

  constructor(private track: RagaTrack) {}

  async detect(): Promise<RagaSource> {
    try {
      const r = await fetch(this.track.file, { method: 'HEAD' })
      const type = r.headers.get('content-type') ?? ''
      if (r.ok && type.startsWith('audio')) return (this.source = 'recording')
    } catch {
      /* offline or missing */
    }
    return (this.source = this.track.stream ? 'stream' : 'drone')
  }

  async play() {
    if (!this.source) await this.detect()
    if (this.source !== 'drone') {
      try {
        await this.playElement()
        return
      } catch {
        // Recording or stream unavailable: fall back to the drone.
        this.audio = null
        this.source = 'drone'
      }
    }
    await this.playDrone()
  }

  pause() {
    if (this.audio) this.fadeElement(0, () => this.audio?.pause())
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4)
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  dispose() {
    this.pause()
    setTimeout(() => this.ctx?.close(), 1500)
  }

  /** Seconds into the piece, and its length, for display. */
  position(): { at: number; length: number } | null {
    const a = this.audio
    if (!a || !Number.isFinite(a.duration)) return null
    const end = Math.min(this.segment.end, a.duration)
    return { at: Math.max(0, a.currentTime - this.segment.start), length: end - this.segment.start }
  }

  private async playElement() {
    if (!this.audio) {
      const useStream = this.source === 'stream' && this.track.stream
      const src = useStream ? this.track.stream!.url : this.track.file
      this.segment = useStream ? { start: this.track.stream!.start, end: this.track.stream!.end } : { start: 0, end: Infinity }
      const a = new Audio()
      a.preload = 'auto'
      a.volume = 0
      a.src = src
      // Loop the piece itself, not the whole tape side.
      a.addEventListener('timeupdate', () => {
        if (a.currentTime >= this.segment.end - 0.25) a.currentTime = this.segment.start
      })
      a.addEventListener('ended', () => {
        a.currentTime = this.segment.start
        void a.play()
      })
      await new Promise<void>((resolve, reject) => {
        const ok = () => { cleanup(); resolve() }
        const fail = () => { cleanup(); reject(new Error('audio failed')) }
        const cleanup = () => { a.removeEventListener('loadedmetadata', ok); a.removeEventListener('error', fail) }
        a.addEventListener('loadedmetadata', ok)
        a.addEventListener('error', fail)
        a.load()
      })
      if (this.segment.start > 0) a.currentTime = this.segment.start
      this.audio = a
    }
    await this.audio.play()
    this.fadeElement(0.85)
  }

  private async playDrone() {
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

  private fadeElement(to: number, done?: () => void) {
    const a = this.audio
    if (!a) return
    const from = a.volume
    const start = performance.now()
    const step = () => {
      const k = Math.min(1, (performance.now() - start) / 1400)
      a.volume = from + (to - from) * k
      if (k < 1) requestAnimationFrame(step)
      else done?.()
    }
    requestAnimationFrame(step)
  }

  /** One tanpura cycle: Pa, Sa', Sa', Sa (low), about 5 seconds. */
  private cycle() {
    if (!this.ctx || !this.master) return
    const sa = this.track.sa
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
