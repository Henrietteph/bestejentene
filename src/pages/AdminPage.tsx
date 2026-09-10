import { useEffect, useState } from 'react'
import ferskenUtenBakgrunn from '../assets/FerskenUtenBakgrunn.png'

type AdminParticipant = {
  name: string
  score: number
  password: string
  email: string
}

type AdminPageProps = {
  onBack: () => void
}

const apiUrl = (import.meta.env.VITE_API_URL ?? 'https://bestejentene.onrender.com').replace(/\/+$/, '')

export default function AdminPage({ onBack }: AdminPageProps) {
  const [participants, setParticipants] = useState<AdminParticipant[]>([])
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetch(`${apiUrl}/api/participants`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
        return response.json() as Promise<AdminParticipant[]>
      })
      .then((loadedParticipants) => setParticipants(loadedParticipants))
      .catch(() => setErrorMessage('Kunne ikke hente deltakerne akkurat nå.'))
      .finally(() => setIsLoading(false))
  }, [])

  const addParticipant = async () => {
    const participantName = name.trim()
    const participantEmail = email.trim()

    if (participantName === '' || password === '' || participantEmail === '') {
      setErrorMessage('Fyll ut navn, passord og e-post.')
      return
    }

    const participant = { name: participantName, score: 0, password, email: participantEmail }

    try {
      const response = await fetch(`${apiUrl}/api/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participant),
      })

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`)

      setParticipants((currentParticipants) => [...currentParticipants, participant])
      setName('')
      setPassword('')
      setEmail('')
      setErrorMessage('')
      window.location.reload()
    } catch {
      setErrorMessage('Kunne ikke legge til deltakeren.')
    }
  }

  const updateScore = async (participant: AdminParticipant, amount: number) => {
    const nextScore = Math.max(0, participant.score + amount)
    const updatedParticipant = { ...participant, score: nextScore }

    setParticipants((currentParticipants) => currentParticipants.map((item) => (
      item.name === participant.name ? updatedParticipant : item
    )))

    try {
      const response = await fetch(`${apiUrl}/api/participants/${encodeURIComponent(participant.name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedParticipant),
      })

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
    } catch {
      setParticipants((currentParticipants) => currentParticipants.map((item) => (
        item.name === participant.name ? participant : item
      )))
      setErrorMessage('Kunne ikke oppdatere poengene.')
    }
  }

  const deleteParticipant = async (participant: AdminParticipant) => {
    try {
      const response = await fetch(`${apiUrl}/api/participants/${encodeURIComponent(participant.name)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`)

      setParticipants((currentParticipants) => currentParticipants.filter((item) => item.name !== participant.name))
    } catch {
      setErrorMessage('Kunne ikke slette deltakeren.')
    }
  }

  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))

  return (
    <main className="app-shell admin-page">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Tilbake til eventvelger" onClick={(event) => { event.preventDefault(); onBack() }}>
          <span className="brand-mark"></span>
          <span>Bestejentene</span>
        </a>
        <span className="header-date">Admin</span>
      </header>

      <button type="button" className="back-button" onClick={onBack}>← Alle event</button>

      <section className="admin-hero" aria-labelledby="admin-title">
        <div>
          <p className="eyebrow">Administrasjon</p>
          <h1 id="admin-title">Deltakere <span>og poeng</span></h1>
          <p className="selection-intro">Legg til nye deltakere og hold oversikt over konkurransen fra ett sted.</p>
        </div>
        <img src={ferskenUtenBakgrunn} alt="" className="admin-image" />
      </section>

      <div className="admin-grid">
        <section className="admin-form-section" aria-labelledby="add-participant-title">
          <p className="eyebrow">Ny deltaker</p>
          <h2 id="add-participant-title">Legg til</h2>
          <form className="admin-form" onSubmit={(event) => { event.preventDefault(); void addParticipant() }}>
            <label htmlFor="admin-name">Navn</label>
            <input id="admin-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={40} required />
            <label htmlFor="admin-email">E-post</label>
            <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label htmlFor="admin-password">Passord</label>
            <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button type="submit" className="add-button">Legg til <span aria-hidden="true">↗</span></button>
          </form>
        </section>

        <section className="admin-list-section" aria-labelledby="participant-list-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Alle registrerte</p>
              <h2 id="participant-list-title">Deltakere</h2>
            </div>
            <span className="section-count">{participants.length} totalt</span>
          </div>
          {errorMessage && <p className="admin-message" role="alert">{errorMessage}</p>}
          {isLoading ? <p className="empty-state">Henter deltakere ...</p> : sortedParticipants.length === 0 ? (
            <p className="empty-state">Ingen deltakere registrert ennå.</p>
          ) : (
            <ol className="admin-participant-list">
              {sortedParticipants.map((participant, index) => (
                <li key={participant.name} className="admin-participant-row">
                  <span className="score-position">{String(index + 1).padStart(2, '0')}</span>
                  <div className="admin-participant-copy">
                    <strong>{participant.name}</strong>
                    <span>{participant.email}</span>
                  </div>
                  <span className="admin-score">{participant.score} poeng</span>
                  <div className="score-controls">
                    <button type="button" onClick={() => void updateScore(participant, -1)} className="score-button" aria-label={`Trekk fra poeng for ${participant.name}`}>-</button>
                    <button type="button" onClick={() => void updateScore(participant, 1)} className="score-button" aria-label={`Legg til poeng for ${participant.name}`}>+</button>
                    <button type="button" onClick={() => void deleteParticipant(participant)} className="score-button score-button-delete" aria-label={`Slett ${participant.name}`}>×</button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <footer className="site-footer">
        <span>Bestejentene / Admin</span>
      </footer>
    </main>
  )
}