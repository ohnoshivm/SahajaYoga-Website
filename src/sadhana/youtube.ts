import type { Talk } from './types'

/**
 * Shri Mataji talks, embedded from YouTube and preloaded.
 *
 * The IFrame API has no "download" or buffer-size control: the only lever is starting
 * playback, which browsers allow while muted. So the player starts muted when the sitting
 * begins, pauses at the start time, and keeps buffering hidden until the talk step.
 */

/** "90", "90s", "1m30s", "1:30", "1h2m3s" → seconds. */
export function parseTime(input: string): number {
  const t = input.trim().toLowerCase()
  if (!t) return 0
  if (/^\d+(\.\d+)?s?$/.test(t)) return Math.floor(parseFloat(t))
  if (/^\d+(:\d{1,2}){1,2}$/.test(t)) return t.split(':').reduce((sum, n) => sum * 60 + Number(n), 0)
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  if (!m || !m[0]) return 0
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)
}

export function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`
}

const ID = /^[\w-]{11}$/

/** Accepts watch, youtu.be, shorts, live and embed links (or a bare id), with an optional t= start. */
export function parseYouTube(input: string): { id: string; start: number } | null {
  const text = input.trim()
  if (ID.test(text)) return { id: text, start: 0 }
  let url: URL
  try {
    url = new URL(/^https?:\/\//.test(text) ? text : `https://${text}`)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www|m|music)\./, '')
  let id: string | null = null
  if (host === 'youtu.be') id = url.pathname.split('/')[1] ?? null
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/)?.[1] ?? null
  }
  if (!id || !ID.test(id)) return null
  return { id, start: parseTime(url.searchParams.get('t') ?? url.searchParams.get('start') ?? '') }
}

export const thumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`

/** The talk's title, when YouTube's oEmbed answers this origin; otherwise null. */
export async function fetchTitle(id: string): Promise<string | null> {
  try {
    const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`)
    if (!r.ok) return null
    const j = (await r.json()) as { title?: string }
    return j.title ?? null
  } catch {
    return null
  }
}

// ── IFrame API ────────────────────────────────────────

type YTPlayer = {
  playVideo(): void
  pauseVideo(): void
  mute(): void
  unMute(): void
  setVolume(v: number): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  getCurrentTime(): number
  getDuration(): number
  getVideoData?(): { title?: string }
  destroy(): void
}

type YTNamespace = {
  Player: new (host: HTMLElement, options: Record<string, unknown>) => YTPlayer
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let api: Promise<YTNamespace> | null = null

function loadYouTube(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (api) return api
  api = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      if (window.YT) resolve(window.YT)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.async = true
    s.onerror = () => {
      api = null
      reject(new Error('YouTube unavailable'))
    }
    document.head.appendChild(s)
  })
  return api
}

export type TalkStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error'

/** One player per sitting, mounted at the start and kept until the talk step. */
export class TalkController {
  status: TalkStatus = 'idle'
  title: string
  private player: YTPlayer | null = null
  private primed = false
  private wanted = false
  private listeners = new Set<() => void>()

  constructor(readonly talk: Talk) {
    this.title = talk.title ?? ''
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => void this.listeners.delete(fn)
  }

  private set(status: TalkStatus) {
    this.status = status
    this.listeners.forEach((f) => f())
  }

  async mount(host: HTMLElement) {
    if (this.player || this.status === 'loading') return
    this.set('loading')
    try {
      const YT = await loadYouTube()
      const { id, start, end } = this.talk
      this.player = new YT.Player(host, {
        videoId: id,
        width: '100%',
        height: '100%',
        playerVars: { start: Math.floor(start), ...(end ? { end: Math.floor(end) } : {}), playsinline: 1, rel: 0, controls: 1 },
        events: {
          // Start muted so the browser lets it buffer before anyone asks for sound.
          onReady: () => {
            this.player?.mute()
            this.player?.playVideo()
          },
          onStateChange: (e: { data: number }) => this.onState(e.data),
          onError: () => this.set('error'),
        },
      })
    } catch {
      this.set('error')
    }
  }

  private onState(s: number) {
    // -1 unstarted · 0 ended · 1 playing · 2 paused · 3 buffering · 5 cued
    const p = this.player
    if (!p) return
    if (s === 1 && !this.primed) {
      this.primed = true
      this.title ||= p.getVideoData?.().title ?? ''
      if (!this.wanted) {
        p.pauseVideo()
        p.seekTo(this.talk.start, true)
        this.set('ready')
        return
      }
    }
    if (s === 1) this.set('playing')
    else if (s === 2) this.set(this.wanted ? 'paused' : 'ready')
    else if (s === 0) this.set('ended')
  }

  /** Call from a tap, so phones allow the sound. */
  play() {
    this.wanted = true
    const p = this.player
    if (!p) return
    p.unMute()
    p.setVolume(100)
    p.playVideo()
  }

  pause() {
    this.player?.pauseVideo()
  }

  /** 0–1 through the chosen part of the talk, once it is playing. */
  progress(): number {
    const p = this.player
    if (!p || !this.wanted) return 0
    const start = this.talk.start
    const end = this.talk.end ?? p.getDuration()
    if (!end || end <= start) return 0
    return Math.min(1, Math.max(0, (p.getCurrentTime() - start) / (end - start)))
  }

  destroy() {
    this.player?.destroy()
    this.player = null
    this.listeners.clear()
  }
}
