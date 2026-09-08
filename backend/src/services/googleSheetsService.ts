import { getGoogleSheetId, getGoogleSheetsClient } from '../config/googleSheets.js'

type SheetCellValue = string | number | boolean

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
