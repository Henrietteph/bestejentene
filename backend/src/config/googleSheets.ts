import 'dotenv/config'
import { google } from 'googleapis'

const getRequiredEnvironmentVariable = (name: string) => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Mangler miljøvariabelen ${name}`)
  }

  return value
}

export const getGoogleSheetsClient = () => {
  const clientEmail = getRequiredEnvironmentVariable('GOOGLE_CLIENT_EMAIL')
  const privateKey = getRequiredEnvironmentVariable('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n')

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return google.sheets({ version: 'v4', auth })
}

export const getGoogleSheetId = () => getRequiredEnvironmentVariable('GOOGLE_SHEET_ID')
