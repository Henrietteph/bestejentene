import { useCallback, useState } from 'react'
import './App.css'
import AdminPage from './pages/AdminPage'
import HytteturPage from './pages/HytteturPage'
import LandingPage from './pages/LandingPage'
import ScoreSummaryPage from './pages/ScoreSummaryPage'
import SydenbabesPage from './pages/SydenbabesPage'
import type { EventSummary, Participant } from './types'

type View = 'landing' | 'summary' | 'admin' | 'sydenbabes' | 'hyttetur'

export default function App() {
  const [view, setView] = useState<View>('landing')
  const [eventSummaries, setEventSummaries] = useState<EventSummary[]>([])

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

  if (view === 'landing') {
    return <LandingPage onSelectEvent={(eventId) => setView(eventId as View)} onOpenSummary={() => setView('summary')} onOpenAdmin={() => setView('admin')} />
  }

  if (view === 'summary') {
    return <ScoreSummaryPage summaries={eventSummaries} onBack={() => setView('landing')} />
  }

  if (view === 'admin') {
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
