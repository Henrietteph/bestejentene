import nodemailer from 'nodemailer'

type RegistrationEmailData = {
  name: string
  password: string
  email: string
}

const getRequiredEnvironmentVariable = (name: string) => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Mangler miljøvariabelen ${name}`)
  }

  return value
}

const registrationEmailTemplate = ({ name, password }: RegistrationEmailData) => `Hei ${name}!

Gratulerer!! Du er en del av bestejentene og har mykje gøy å sjå fram til<3

Navn: ${name}
Passord: ${password}

Link til nettsida: https://bestejentene.vercel.app


Kos og klem fra Bestejentene`

export const sendRegistrationEmail = async (participant: RegistrationEmailData) => {
  const gmailUser = getRequiredEnvironmentVariable('GMAIL_USER')
  const gmailAppPassword = getRequiredEnvironmentVariable('GMAIL_APP_PASSWORD')

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  })

  await transporter.sendMail({
    from: gmailUser,
    to: participant.email,
    subject: 'Du har blitt registrert hos Bestejentene',
    text: registrationEmailTemplate(participant),
  })
}
