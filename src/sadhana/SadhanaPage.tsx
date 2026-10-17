import { useEffect, useMemo, useRef, useState } from 'react'
import { primeBells } from '../audio/bell'
import { KEY } from '../screen/useSession'
import { stepInfo, FIELDS } from './library'
import { Run } from './Run'
import { Setup } from './Setup'
import { loadFeeling, loadTalk, useSitting } from './store'
import { lapsKey } from './steps/LapsStep'
import { Summary } from './Summary'
import type { Feeling, Step, Talk } from './types'
import { TalkController } from './youtube'
import './sadhana.css'

/** /sadhana: build a sitting, then move through it step by step. */
export function SadhanaPage() {
  const [state, dispatch] = useSitting()
  const [feeling, setFeeling] = useState<Feeling>(loadFeeling)
  const [talk, setTalk] = useState<Talk | null>(loadTalk)

  const running = state.steps.length > 0 && !state.ended
  const hasTalkStep = running && state.steps.some((s) => s.kind === 'talk')

  // One player per sitting, created when the sitting starts so it buffers during the earlier steps.
  const controller = useMemo(
    () => (hasTalkStep && talk ? new TalkController(talk) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasTalkStep, talk?.id, talk?.start, talk?.end],
  )
  useEffect(() => () => controller?.destroy(), [controller])

  const theme = running ? stepInfo(state.steps[state.index]).theme : FIELDS.white
  useEffect(() => {
    document.title = 'Sadhana · SAHAJA YOGA'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.field)
    document.body.style.background = theme.field
  }, [theme])

  const begin = (steps: Step[], f: Feeling, t: Talk | null) => {
    primeBells()
    // Each sitting's laps start from zero.
    for (const s of steps) if (s.kind === 'laps') {
      try {
        localStorage.removeItem(KEY(lapsKey(s.chakra)))
      } catch {
        /* storage unavailable */
      }
    }
    setFeeling(f)
    setTalk(t)
    dispatch({ type: 'begin', steps, now: performance.now() })
  }

  const onTalkStep = running && state.steps[state.index]?.kind === 'talk'

  return (
    <>
      {state.ended ? (
        <Summary state={state} onAgain={() => dispatch({ type: 'reset' })} />
      ) : running ? (
        <Run state={state} dispatch={dispatch} feeling={feeling} talk={controller} />
      ) : (
        <Setup onBegin={begin} />
      )}
      {controller && <TalkFrame controller={controller} visible={onTalkStep} />}
    </>
  )
}

/** Mounted for the whole sitting so the talk buffers early; shown only on the talk step. */
function TalkFrame({ controller, visible }: { controller: TalkController; visible: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // The API replaces this node with its iframe; give it a child so React keeps its own.
    const el = document.createElement('div')
    host.current?.appendChild(el)
    void controller.mount(el)
  }, [controller])
  return <div className={`talk-frame ${visible ? 'is-on' : ''}`} ref={host} aria-hidden={!visible} />
}
