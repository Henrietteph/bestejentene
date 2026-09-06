type LandingPageProps = {
  onSelectEvent: (eventId: string) => void
  onOpenSummary: () => void
}

export default function LandingPage({ onSelectEvent, onOpenSummary }: LandingPageProps) {
  return (
    <main className="app-shell event-selection-page">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Bestejentene">
          <span className="brand-mark"></span>
          <span>Bestejentene</span>
        </a>
        <span className="header-date">Velg et event</span>
      </header>

      <section className="event-selection" aria-labelledby="event-selection-title">
        <p className="eyebrow">Hva skjer nå?</p>
        <h1 id="event-selection-title">Velg event</h1>
        <p className="selection-intro">Gå inn på riktig side for å se agenda, deltakere og poeng.</p>

        <div className="event-options">
          <button type="button" className="event-option" onClick={() => onSelectEvent('sydenbabes')}>
            <span className="event-option-number">01</span>
            <span className="event-option-copy">
              <strong>Sydenbabes 2026</strong>
              <span>Jentene i Milan</span>
            </span>
            <span className="event-option-arrow" aria-hidden="true">↗</span>
          </button>
        </div>


        <div className="event-options">
          <button type="button" className="event-option" onClick={() => onSelectEvent('hyttetur')}>
            <span className="event-option-number">01</span>
            <span className="event-option-copy">
              <strong>Hyttetur 2025</strong>
              <span>Hyttetur på Holmøyane</span>
            </span>
            <span className="event-option-arrow" aria-hidden="true">↗</span>
          </button>
        </div>

        <button type="button" className="summary-link" onClick={onOpenSummary}>
          Se samlet poengoppsummering <span aria-hidden="true">↗</span>
        </button>
      </section>
    </main>
  )
}
