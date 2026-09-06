import type { EventSummary } from '../types'

type ScoreSummaryPageProps = {
  summaries: EventSummary[]
  onBack: () => void
}

export default function ScoreSummaryPage({ summaries, onBack }: ScoreSummaryPageProps) {
  return (
    <main className="app-shell summary-page">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Tilbake til eventvelger" onClick={(event) => { event.preventDefault(); onBack() }}>
          <span className="brand-mark"></span>
          <span>Bestejentene</span>
        </a>
        <span className="header-date">Alle event</span>
      </header>

      <button type="button" className="back-button" onClick={onBack}>
        ← Alle event
      </button>

      <section className="summary-hero" aria-labelledby="summary-title">
        <p className="eyebrow">Historikken vår</p>
        <h1 id="summary-title">Poeng totalt</h1>
        <p className="selection-intro">En samlet oversikt over resultatene fra eventene dere har hatt.</p>
      </section>

      {summaries.length > 0 ? (
        <div className="summary-events">
          {summaries.map((summary) => {
            const sortedParticipants = [...summary.participants].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))

            return (
              <section className="summary-event" key={summary.id}>
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{summary.date}</p>
                    <h2>{summary.name}</h2>
                  </div>
                  <span className="section-count">{summary.participants.length} deltakere</span>
                </div>
                {sortedParticipants.length > 0 ? (
                  <ol className="summary-list">
                    {sortedParticipants.map((participant, index) => (
                      <li className="summary-row" key={participant.name}>
                        <span className="score-position">{String(index + 1).padStart(2, '0')}</span>
                        <strong>{participant.name}</strong>
                        <span>{participant.score} poeng</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="empty-state">Ingen poeng registrert ennå.</p>
                )}
              </section>
            )
          })}
        </div>
      ) : (
        <p className="empty-state summary-empty">Ingen eventer har registrerte poeng ennå.</p>
      )}
    </main>
  )
}
