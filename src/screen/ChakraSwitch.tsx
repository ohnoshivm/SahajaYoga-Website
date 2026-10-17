import { useEffect, useRef, useState } from 'react'
import { CHAKRA_LIST, type Chakra } from '../chakra/chakras'
import { navigate } from '../router'

/** Compact chooser beside the wordmark: jump between the chakras that are built. */
export function ChakraSwitch({ current }: { current: Chakra }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

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

  return (
    <div className="cswitch" ref={wrap}>
      <button
        className="cswitch-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Chakra: ${current.name}. Choose another`}
      >
        <span className="cswitch-num">{String(current.number).padStart(2, '0')}</span>
        <span className="cswitch-name">{current.name}</span>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.2 8 10l4-3.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <div className="cswitch-menu" role="listbox" aria-label="Chakras">
          {CHAKRA_LIST.map((c) => (
            <a
              key={c.slug}
              href={`/${c.slug}`}
              role="option"
              aria-selected={c.slug === current.slug}
              className={`cswitch-opt ${c.slug === current.slug ? 'is-active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                setOpen(false)
                navigate(`/${c.slug}`)
              }}
            >
              <span className="cswitch-dot" style={{ background: c.theme.field }} aria-hidden="true" />
              <span className="cswitch-opt-num">{String(c.number).padStart(2, '0')}</span>
              <span className="cswitch-opt-name">{c.name}</span>
              <span className="cswitch-opt-q">{c.quality}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
