import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { CHAKRAS, MOOLADHARA } from './chakra/chakras'
import { MeditationScreen } from './screen/MeditationScreen'
import { usePath } from './router'
import './styles.css'

function App() {
  const path = usePath()
  const chakra = CHAKRAS[path.replace(/^\/+|\/+$/g, '')] ?? MOOLADHARA

  useEffect(() => {
    document.title = `${chakra.name} · SAHAJA YOGA`
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', chakra.theme.field)
    document.body.style.background = chakra.theme.field
  }, [chakra])

  // Keyed by chakra so each one gets a fresh session, raga and 3D scene.
  return <MeditationScreen key={chakra.slug} chakra={chakra} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
