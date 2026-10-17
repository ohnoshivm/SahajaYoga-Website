/**
 * Plays a YouTube recording through YouTube's official IFrame Player API.
 * YouTube's terms require the player to stay visible (at least 200×200), so the
 * screen renders the host element as a small card while this recording is active.
 */
type YTPlayer = {
  playVideo(): void
  pauseVideo(): void
  getCurrentTime(): number
  getDuration(): number
  setVolume(v: number): void
  destroy(): void
}
type YTNamespace = {
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer
}
declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiReady: Promise<YTNamespace> | null = null
function loadApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  apiReady ??= new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(window.YT!)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.onerror = () => reject(new Error('YouTube API failed to load'))
    document.head.appendChild(s)
  })
  return apiReady
}

export class YouTubeRagaPlayer {
  source = 'youtube' as const
  private player: YTPlayer | null = null
  private ready: Promise<void> | null = null

  constructor(private videoId: string, private host: () => HTMLElement | null) {}

  async detect() {
    return this.source
  }

  private mount(): Promise<void> {
    this.ready ??= loadApi().then(
      (YT) =>
        new Promise<void>((resolve, reject) => {
          const el = this.host()
          if (!el) return reject(new Error('no host'))
          const mountPoint = document.createElement('div')
          el.replaceChildren(mountPoint)
          this.player = new YT.Player(mountPoint, {
            videoId: this.videoId,
            width: '100%',
            height: '100%',
            playerVars: { playsinline: 1, rel: 0, modestbranding: 1, loop: 1, playlist: this.videoId },
            events: { onReady: () => resolve(), onError: () => reject(new Error('YouTube playback error')) },
          })
        }),
    )
    return this.ready
  }

  async play() {
    await this.mount()
    this.player?.setVolume(85)
    this.player?.playVideo()
  }

  pause() {
    this.player?.pauseVideo()
  }

  dispose() {
    this.player?.destroy()
    this.player = null
    this.ready = null
  }

  position() {
    const p = this.player
    if (!p) return null
    const length = p.getDuration()
    return length ? { at: p.getCurrentTime(), length } : null
  }
}
