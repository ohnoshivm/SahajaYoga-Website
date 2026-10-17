import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RagaInfo, Recording } from '../chakra/chakras'
import { RagaPlayer, type RagaSource } from '../audio/raga'
import { YouTubeRagaPlayer } from '../audio/youtube'
import { formatTime } from '../engine/session'

type Player = {
  source: RagaSource | 'youtube' | null
  detect(): Promise<unknown>
  play(): Promise<void>
  pause(): void
  dispose(): void
  position(): { at: number; length: number } | null
}

const PREF = (slug: string) => `sy.raga.${slug}`

export function useRecordingChoice(slug: string, raga: RagaInfo) {
  const [id, setId] = useState(() => {
    try {
      const saved = localStorage.getItem(PREF(slug))
      if (saved && raga.recordings.some((r) => r.id === saved)) return saved
    } catch {
      /* storage unavailable */
    }
    return raga.recordings[0].id
  })
  const choose = useCallback(
    (next: string) => {
      setId(next)
      try {
        localStorage.setItem(PREF(slug), next)
      } catch {
        /* storage unavailable */
      }
    },
    [slug],
  )
  const recording = raga.recordings.find((r) => r.id === id) ?? raga.recordings[0]
  return [recording, choose] as const
}

type Props = { raga: RagaInfo; recording: Recording; onChoose: (id: string) => void }

export function RagaControl({ raga, recording, onChoose }: Props) {
  const ytHost = useRef<HTMLDivElement>(null)
  const players = useRef(new Map<string, Player>())
  const [playing, setPlaying] = useState(false)
  const [source, setSource] = useState<Player['source']>(null)
  const [pos, setPos] = useState<{ at: number; length: number } | null>(null)
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  const playerFor = useCallback(
    (r: Recording): Player => {
      let p = players.current.get(r.id)
      if (!p) {
        p =
          r.kind === 'youtube'
            ? new YouTubeRagaPlayer(r.videoId, () => ytHost.current)
            : new RagaPlayer({ file: r.file, stream: r.stream, sa: raga.sa })
        players.current.set(r.id, p)
      }
      return p
    },
    [raga.sa],
  )

  const player = useMemo(() => playerFor(recording), [playerFor, recording])

  useEffect(() => {
    player.detect().then(() => setSource(player.source))
  }, [player])

  useEffect(() => {
    const all = players.current
    return () => all.forEach((p) => p.dispose())
  }, [])

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setPos(player.position()), 1000)
    return () => clearInterval(id)
  }, [playing, player])

  // Close the chooser on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('pointerdown', onDown)
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('pointerdown', onDown)
      removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = useCallback(async () => {
    if (playing) {
      player.pause()
      setPlaying(false)
    } else {
      setPlaying(true)
      try {
        await player.play()
      } catch {
        setPlaying(false)
      }
      setSource(player.source)
    }
  }, [playing, player])

  const choose = async (r: Recording) => {
    setOpen(false)
    if (r.id === recording.id) return
    const wasPlaying = playing
    player.pause()
    setPos(null)
    onChoose(r.id)
    if (wasPlaying) {
      const next = playerFor(r)
      try {
        await next.play()
        setSource(next.source)
      } catch {
        setPlaying(false)
      }
    }
  }

  const line =
    source === 'drone'
      ? 'Tanpura drone'
      : playing && pos
        ? `${formatTime(pos.at * 1000)} / ${formatTime(pos.length * 1000)}`
        : recording.artist

  const showVideo = recording.kind === 'youtube' && (playing || source === 'youtube')

  return (
    <div className="raga-wrap" ref={wrap}>
      <div className={`raga ${playing ? 'is-on' : ''}`}>
        <button className="raga-play" onClick={toggle} aria-pressed={playing} aria-label={`${playing ? 'Pause' : 'Play'} ${raga.name}, ${recording.label}`}>
          <span className="raga-icon" aria-hidden="true">
            {playing ? (
              <span className="eq"><i /><i /><i /></span>
            ) : (
              <svg viewBox="0 0 16 16"><path d="M5.2 3.3v9.4a.6.6 0 0 0 .92.5l7.3-4.7a.6.6 0 0 0 0-1L6.12 2.8a.6.6 0 0 0-.92.5Z" /></svg>
            )}
          </span>
          <span className="raga-text">
            <span className="raga-name"><span className="raga-word">Raga </span>{raga.name.replace(/^Raga /, '')}</span>
            <small>{line}</small>
          </span>
        </button>
        <button
          className="raga-pick"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={`Choose recording, now ${recording.label}`}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.2 8 10l4-3.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {open && (
        <div className="raga-menu" role="listbox" aria-label={`${raga.name} recordings`}>
          <p className="raga-menu-k">{raga.name}</p>
          {raga.recordings.map((r) => (
            <button
              key={r.id}
              role="option"
              aria-selected={r.id === recording.id}
              className={`raga-opt ${r.id === recording.id ? 'is-active' : ''}`}
              onClick={() => choose(r)}
            >
              <span className="raga-opt-main">
                <span className="raga-opt-label">{r.label}</span>
                <span className="raga-opt-artist">{r.artist}</span>
              </span>
              <span className="raga-opt-len">{r.length}</span>
            </button>
          ))}
        </div>
      )}

      <div className={`raga-video ${showVideo ? 'is-on' : ''}`} aria-hidden={!showVideo}>
        <div ref={ytHost} className="raga-video-host" />
      </div>
    </div>
  )
}
