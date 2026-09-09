import { getGoogleSheetId, getGoogleSheetsClient } from '../config/googleSheets.js';

type SheetCellValue = string | number | boolean
type Participant = { name: string; score: number; password: string; email: string }
type ParticipantInput = Omit<Participant, 'password' | 'email'> & { password?: string; email?: string }

export const readSheetData = async (range: string) => {
  const sheets = getGoogleSheetsClient()
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getGoogleSheetId(),
    range,
  })

  return response.data.values ?? []
}

export const appendRowData = async (range: string, values: SheetCellValue[][]) => {
  const sheets = getGoogleSheetsClient()

  await sheets.spreadsheets.values.append({
    spreadsheetId: getGoogleSheetId(),
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  })
}

const getParticipantRows = async () => {
  const rows = await readSheetData(process.env.GOOGLE_SUMMARY_RANGE ?? 'A:Z')
  return rows.slice(1).map((row, index) => ({
    rowNumber: index + 2,
    name: String(row[0] ?? '').trim(),
    score: Number(row[1] ?? 0),
    password: String(row[2] ?? ''),
    email: String(row[3] ?? '').trim(),
  }))
}

export const getParticipants = async (): Promise<Participant[]> => {
  const rows = await getParticipantRows()
  return rows
    .filter((row) => row.name.length > 0)
    .map(({ name, score, password, email }) => ({
      name,
      score: Number.isFinite(score) ? score : 0,
      password,
      email,
    }))
}

export const createParticipant = async (participant: ParticipantInput) => {
  await appendRowData(process.env.GOOGLE_SUMMARY_RANGE ?? 'A:Z', [[
    participant.name,
    participant.score,
    participant.password ?? '',
    participant.email ?? '',
  ]])
}

export const updateParticipant = async (participant: ParticipantInput) => {
  const rows = await getParticipantRows()
  const row = rows.find((item) => item.name.toLocaleLowerCase() === participant.name.trim().toLocaleLowerCase())

  if (!row) return false

  const sheets = getGoogleSheetsClient()
  await sheets.spreadsheets.values.update({
    spreadsheetId: getGoogleSheetId(),
    range: `A${row.rowNumber}:D${row.rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[
      participant.name.trim(),
      participant.score,
      participant.password ?? row.password,
      participant.email ?? row.email,
    ]] },
  })
  return true
}

export const deleteParticipant = async (participantName: string) => {
  const rows = await getParticipantRows()
  const row = rows.find((item) => item.name.toLocaleLowerCase() === participantName.trim().toLocaleLowerCase())

  if (!row) return false

  const sheets = getGoogleSheetsClient()
  await sheets.spreadsheets.values.clear({
    spreadsheetId: getGoogleSheetId(),
    range: `A${row.rowNumber}:D${row.rowNumber}`,
    requestBody: {},
  })
  return true
}

export const getParticipantSummary = async (participantName: string) => {
  const range = process.env.GOOGLE_SUMMARY_RANGE ?? 'A:Z'
  const rows = await readSheetData(range)
  const [headers, ...dataRows] = rows
  const normalizedParticipantName = participantName.trim().toLocaleLowerCase()
  const participantRow = dataRows.find((row) => String(row[0] ?? '').trim().toLocaleLowerCase() === normalizedParticipantName)

  if (!headers || !participantRow) {
    return null
  }

  return headers.reduce<Record<string, string | number>>((summary, header, index) => {
    const columnName = String(header).trim()
    if (columnName) {
      summary[columnName] = participantRow[index] ?? ''
    }
    return summary
  }, {})
}
