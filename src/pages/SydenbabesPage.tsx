import { useEffect, useState } from 'react'
import flybabes from '../assets/flybabes.png'
import type { Participant } from '../types'

type SydenbabesPageProps = {
  onBack: () => void
  onOpenSummary: () => void
  onScoresChange: (scores: Participant[]) => void
}

const eventId = 'sydenbabes-2026'
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const loadScores = (): Participant[] => {
  const savedScores = localStorage.getItem(`${eventId}-scores`) ?? localStorage.getItem('hyttetur-scores')
  if (!savedScores) return []

  try {
    const parsedScores: unknown = JSON.parse(savedScores)
    if (!Array.isArray(parsedScores)) return []

    return parsedScores.flatMap((item): Participant[] => {
      if (
        typeof item !== 'object' ||
        item === null ||
        typeof item.name !== 'string' ||
        typeof item.score !== 'number' ||
        !Number.isFinite(item.score)
      ) {
        return []
      }

      return [{
        name: item.name.trim(),
        score: Math.max(0, Math.floor(item.score)),
      }]
    }).filter((participant) => participant.name.length > 0)
  } catch {
    return []
  }
}

export default function SydenbabesPage({ onBack, onOpenSummary, onScoresChange }: SydenbabesPageProps) {
  const [message, setMessage] = useState('')
  const [scores, setScores] = useState<Participant[]>(loadScores)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    fetch(`${apiUrl}/api/hello`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
        return response.json()
      })
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Kunne ikke kontakte backend'))
  }, [])

  useEffect(() => {
    fetch(`${apiUrl}/api/participants`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
        return response.json() as Promise<Participant[]>
      })
      .then((participants) => {
        setScores(participants)
        localStorage.setItem(`${eventId}-scores`, JSON.stringify(participants))
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    localStorage.setItem(`${eventId}-scores`, JSON.stringify(scores))
    onScoresChange(scores)
  }, [scores, onScoresChange])

  const agendaFriday = [
    { time: '10:00', event: 'Frokost' },
    { time: '11:00', event: 'Stafett' },
    { time: '13:00', event: 'Lunsj i solveggen' },
  ]

  const agendaSaturday = [
    { time: '15:00', event: 'Quiz' },
    { time: '18:00', event: 'Middag og premieutdeling' },
  ]

  const updateScore = (name: string, amount: number) => {
    const participant = scores.find((item) => item.name === name)
    if (!participant) return

    const nextScore = Math.max(0, participant.score + amount)
    setScores((currentScores) => currentScores.map((item) => (
      item.name === name ? { ...item, score: nextScore } : item
    )))
    void fetch(`${apiUrl}/api/participants/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score: nextScore }),
    })
  }

  const addParticipant = () => {
    const name = newName.trim()
    if (name === '') return

    setScores((currentScores) => [...currentScores, { name, score: 0 }])
    setNewName('')
    void fetch(`${apiUrl}/api/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score: 0 }),
    })
  }

  const deleteParticipant = (name: string) => {
    setScores((currentScores) => currentScores.filter((participant) => participant.name !== name))
    void fetch(`${apiUrl}/api/participants/${encodeURIComponent(name)}`, { method: 'DELETE' })
  }

  const sortedScores = [...scores].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Tilbake til eventvelger" onClick={(event) => { event.preventDefault(); onBack() }}>
          <span className="brand-mark"></span>
          <span>Bestejentene</span>
        </a>
        <span className="header-date">1. - 5. oktober 2026</span>
      </header>

      <div className="page-actions">
        <button type="button" className="back-button" onClick={onBack}>← Alle event</button>
        <button type="button" className="summary-link" onClick={onOpenSummary}>Poengoppsummering ↗</button>
      </div>

      <section className="hero-section" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">Jentene i Milan</p>
          <h1 id="page-title">Sydenbabes <span> </span><span>2026</span></h1>
          <p>backend sier: {message}</p>
        </div>
        <img src={flybabes} alt="Illustrasjon av verdens fineste bestejenter" className="fersken-image" />
      </section>

      <div className="content-grid">
        <section className="score-section" aria-labelledby="score-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Konkurransen er i gang</p>
              <h2 id="score-title">Scoreboard</h2>
            </div>
            <span className="section-count">{scores.length} {scores.length === 1 ? 'deltaker' : 'deltakere'}</span>
          </div>
          {sortedScores.length > 0 ? (
            <ol className="score-list">
              {sortedScores.map((person, index) => (
                <li key={person.name} className={`score-row ${index === 0 ? 'is-leading' : ''}`}>
                  <span className="score-position">{String(index + 1).padStart(2, '0')}</span>
                  <div className="score-person">
                    <strong>{person.name}</strong>
                    <span>{person.score} poeng</span>
                  </div>
                  <div className="score-controls">
                    <button type="button" onClick={() => updateScore(person.name, -1)} className="score-button score-button-minus" aria-label={`Trekk fra poeng for ${person.name}`}>-</button>
                    <button type="button" onClick={() => updateScore(person.name, 1)} className="score-button score-button-plus" aria-label={`Legg til poeng for ${person.name}`}>+</button>
                    <button type="button" onClick={() => deleteParticipant(person.name)} className="score-button score-button-delete" aria-label={`Slett ${person.name}`} title={`Slett ${person.name}`}>×</button>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty-state">Ingen deltakere ennå. Hvem tar førsteplassen?</p>
          )}
        </section>

        <section className="agenda-section" aria-labelledby="agenda-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Dette skjer</p>
              <h2 id="agenda-title">Agenda</h2>
            </div>
            <span className="section-count">Helgeplan</span>
          </div>
          <div className="agenda-grid">
            <AgendaDay dayNumber="01" title="Fredag" items={agendaFriday} />
            <AgendaDay dayNumber="02" title="Lørdag" items={agendaSaturday} saturday />
          </div>
        </section>

        <section className="add-section" aria-labelledby="add-title">
          <div>
            <p className="eyebrow">Klar for start</p>
            <h2 id="add-title">Legg til deltaker</h2>
            <p className="add-description">Skriv inn et navn for å bli med på kampen.</p>
          </div>
          <form className="add-form" onSubmit={(event) => { event.preventDefault(); addParticipant() }}>
            <label className="sr-only" htmlFor="participant-name">Navn</label>
            <input id="participant-name" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Skriv et navn" className="name-input" maxLength={40} />
            <button type="submit" className="add-button">Legg til <span aria-hidden="true">↗</span></button>
          </form>
        </section>
      </div>

      <footer className="site-footer">
        <span>Bestejentene / Sydentur 2026</span>
        <span>Frokost · stafett · quiz · premie</span>
      </footer>
    </main>
  )
}

type AgendaDayProps = {
  dayNumber: string
  title: string
  items: { time: string; event: string }[]
  saturday?: boolean
}

function AgendaDay({ dayNumber, title, items, saturday = false }: AgendaDayProps) {
  return (
    <div className={`agenda-day ${saturday ? 'agenda-day-saturday' : ''}`}>
      <div className="day-header">
        <span className="day-number">{dayNumber}</span>
        <h3>{title}</h3>
      </div>
      <ul className="agenda-list">
        {items.map((item) => (
          <li key={item.time} className="agenda-item">
            <time>{item.time}</time>
            <span>{item.event}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
