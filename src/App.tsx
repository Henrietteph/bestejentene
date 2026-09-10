import { useCallback, useState } from 'react'
import './App.css'
import AdminPage from './pages/AdminPage'
import HytteturPage from './pages/HytteturPage'
import LandingPage from './pages/LandingPage'
import ScoreSummaryPage from './pages/ScoreSummaryPage'
import SydenbabesPage from './pages/SydenbabesPage'
import type { EventSummary, Participant } from './types'

type View = 'landing' | 'summary' | 'admin' | 'sydenbabes' | 'hyttetur'
const adminPassword = 'Henniebest'

export default function App() {
  const [view, setView] = useState<View>('landing')
  const [eventSummaries, setEventSummaries] = useState<EventSummary[]>([])
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [adminLoginError, setAdminLoginError] = useState('')

  const updateSydenbabesSummary = useCallback((participants: Participant[]) => {
    setEventSummaries((currentSummaries) => {
      const summary: EventSummary = {
        id: 'sydenbabes-2026',
        name: 'Sydenbabes 2026',
        date: '1. - 5. oktober 2026',
        participants,
      }

      const existingSummary = currentSummaries.some((item) => item.id === summary.id)
      return existingSummary
        ? currentSummaries.map((item) => item.id === summary.id ? summary : item)
        : [...currentSummaries, summary]
    })
  }, [])

  const updateHytteturSummary = useCallback((participants: Participant[]) => {
    setEventSummaries((currentSummaries) => {
      const summary: EventSummary = {
        id: 'hyttetur-2025',
        name: 'Hyttetur 2025',
        date: '10. - 13. mai 2025',
        participants,
      }

      const existingSummary = currentSummaries.some((item) => item.id === summary.id)
      return existingSummary
        ? currentSummaries.map((item) => item.id === summary.id ? summary : item)
        : [...currentSummaries, summary]
    })
  }, [])

  const authenticateAdmin = () => {
    if (adminPasswordInput === adminPassword) {
      setIsAdminAuthenticated(true)
      setAdminPasswordInput('')
      setAdminLoginError('')
      return
    }

    setAdminLoginError('Feil passord.')
  }

  if (view === 'landing') {
    return <LandingPage onSelectEvent={(eventId) => setView(eventId as View)} onOpenSummary={() => setView('summary')} onOpenAdmin={() => setView('admin')} />
  }

  if (view === 'summary') {
    return <ScoreSummaryPage summaries={eventSummaries} onBack={() => setView('landing')} />
  }

  if (view === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <main className="app-shell admin-login-page">
          <header className="site-header">
            <a className="brand" href="/" aria-label="Tilbake til eventvelger" onClick={(event) => { event.preventDefault(); setView('landing') }}>
              <span className="brand-mark"></span>
              <span>Bestejentene</span>
            </a>
            <span className="header-date">Admin</span>
          </header>

          <button type="button" className="back-button" onClick={() => setView('landing')}>← Alle event</button>

          <section className="admin-login" aria-labelledby="admin-login-title">
            <p className="eyebrow">Administrasjon</p>
            <h1 id="admin-login-title">Skriv inn passord</h1>
            <form onSubmit={(event) => { event.preventDefault(); authenticateAdmin() }}>
              <label htmlFor="admin-login-password">Passord</label>
              <input
                id="admin-login-password"
                type="password"
                value={adminPasswordInput}
                onChange={(event) => setAdminPasswordInput(event.target.value)}
                autoFocus
                required
              />
              {adminLoginError && <p className="admin-message" role="alert">{adminLoginError}</p>}
              <button type="submit" className="add-button">Logg inn <span aria-hidden="true">↗</span></button>
            </form>
          </section>
        </main>
      )
    }

    return <AdminPage onBack={() => setView('landing')} />
  }

  if (view === 'hyttetur') {
    return (
      <HytteturPage
        onBack={() => setView('landing')}
        onOpenSummary={() => setView('summary')}
        onScoresChange={updateHytteturSummary}
      />
    )
  }

  return (
    <SydenbabesPage
      onBack={() => setView('landing')}
      onOpenSummary={() => setView('summary')}
      onScoresChange={updateSydenbabesSummary}
    />
  )
}
