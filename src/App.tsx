import { useEffect, useState } from 'react'
import './App.css'

import FerskenUtenBakgrunn from './assets/FerskenUtenBakgrunn.png'

type Participant = {
  id: string
  name: string
  score: number
}

const createParticipantId = () => crypto.randomUUID()

const loadScores = (): Participant[] => {
  const savedScores = localStorage.getItem('hyttetur-scores')

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
        id: 'id' in item && typeof item.id === 'string' ? item.id : createParticipantId(),
        name: item.name.trim(),
        score: Math.max(0, Math.floor(item.score)),
      }]
    }).filter((participant) => participant.name.length > 0)
  } catch {
    return []
  }
}

export default function HytteturApp() {

const [message, setMessage] = useState("");

useEffect(() => {
  fetch("http://localhost:3000/api/hello")
    .then((response) => {
      console.log("Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      console.log("Data fra backend:", data);
      setMessage(data.message);
    })
    .catch((error) => {
      console.error("Feil ved kontakt med backend:", error);
      setMessage("Kunne ikke kontakte backend");
    });
}, []);

  const [scores, setScores] = useState<Participant[]>(loadScores)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    localStorage.setItem('hyttetur-scores', JSON.stringify(scores))
  }, [scores])

  const agendaFriday = [
    { time: "10:00", event: "Frokost" },
    { time: "11:00", event: "Stafett" },
    { time: "13:00", event: "Lunsj i solveggen" },
  ];

  const agendaSaturday = [
    { time: "15:00", event: "Quiz" },
    { time: "18:00", event: "Middag og premieutdeling" },
  ];

  const updateScore = (id: string, amount: number) => {
    setScores((currentScores) => currentScores.map((participant) => (
      participant.id === id
        ? { ...participant, score: Math.max(0, participant.score + amount) }
        : participant
    )))
  }

  const addParticipant = () => {
    const name = newName.trim()
    if (name === '') return

    setScores((currentScores) => [
      ...currentScores,
      { id: createParticipantId(), name, score: 0 },
    ])
    setNewName('')
  }

  const sortedScores = [...scores].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Hyttetur 2025">
          <span className="brand-mark"></span>
          <span>Bestejentene</span>
        </a>
        <span className="header-date">1. - 5. oktober 2026</span>
      </header>

      <section className="hero-section" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">Jentene i Milan</p>
          <h1 id="page-title">Sydenbabes <span> </span><span>2026</span></h1>
          <p>backend sier: {message}</p>
        </div>
        <img
          src={FerskenUtenBakgrunn}
          alt="Illustrasjon av verdens fineste pus"
          className="fersken-image"
        />
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
                <li key={person.id} className={`score-row ${index === 0 ? 'is-leading' : ''}`}>
                  <span className="score-position">{String(index + 1).padStart(2, '0')}</span>
                  <div className="score-person">
                    <strong>{person.name}</strong>
                    <span>{person.score} {person.score === 1 ? 'poeng' : 'poeng'}</span>
                  </div>
                  <div className="score-controls">
                <button
                    type="button"
                    onClick={() => updateScore(person.id, -1)}
                    className="score-button score-button-minus"
                    aria-label={`Trekk fra poeng for ${person.name}`}
                >
                    -
                </button>
                <button
                    type="button"
                    onClick={() => updateScore(person.id, 1)}
                    className="score-button score-button-plus"
                    aria-label={`Legg til poeng for ${person.name}`}
                >
                    +
                </button>
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
            <div className="agenda-day">
              <div className="day-header">
                <span className="day-number">01</span>
                <h3>Fredag</h3>
              </div>
              <ul className="agenda-list">
                {agendaFriday.map((item) => (
                  <li key={item.time} className="agenda-item">
                    <time>{item.time}</time>
                    <span>{item.event}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="agenda-day agenda-day-saturday">
              <div className="day-header">
                <span className="day-number">02</span>
                <h3>Lørdag</h3>
              </div>
              <ul className="agenda-list">
                {agendaSaturday.map((item) => (
                  <li key={item.time} className="agenda-item">
                    <time>{item.time}</time>
                    <span>{item.event}</span>
                  </li>
                ))}
              </ul>
            </div>
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
            <input
              id="participant-name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Skriv et navn"
              className="name-input"
              maxLength={40}
            />
            <button type="submit" className="add-button">
              Legg til <span aria-hidden="true">↗</span>
            </button>
          </form>
        </section>
      </div>

      <footer className="site-footer">
        <span>Bestejentene / Sydentur 2026</span>
        <span>Frokost · stafett · quiz · premie</span>
      </footer>
    </main>
  );
}
