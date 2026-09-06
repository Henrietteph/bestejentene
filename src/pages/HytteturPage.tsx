type HytteturPageProps = {
  onBack: () => void
  onOpenSummary: () => void
}

export default function Hyttetur({ onBack, onOpenSummary }: HytteturPageProps) {
  return (
    <main>
      <h1>Hyttetur 2025</h1>
      <button type="button" onClick={onBack}>
        Tilbake
      </button>
      <button type="button" onClick={onOpenSummary}>
        Se poengoppsummering
      </button>
    </main>
  )
}