import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MOOLADHARA } from './chakra/chakras'
import { MeditationScreen } from './screen/MeditationScreen'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MeditationScreen chakra={MOOLADHARA} />
  </StrictMode>,
)
