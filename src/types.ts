export type Participant = {
  name: string
  score: number
}

export type EventSummary = {
  id: string
  name: string
  date: string
  participants: Participant[]
}
