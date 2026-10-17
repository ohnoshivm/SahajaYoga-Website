import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { CHAKRAS, MOOLADHARA } from './chakra/chakras'
import { MeditationScreen } from './screen/MeditationScreen'
import { usePath } from './router'
import { SadhanaPage } from './sadhana/SadhanaPage'
import { HomePage } from './home/HomePage'
import './styles.css'

function App() {
  const slug = usePath().replace(/^\/+|\/+$/g, '')
  if (slug === '') return <HomePage />
  return slug === 'sadhana' ? <SadhanaPage /> : <ChakraApp slug={slug} />
}

function ChakraApp({ slug }: { slug: string }) {
  const chakra = CHAKRAS[slug] ?? MOOLADHARA

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
