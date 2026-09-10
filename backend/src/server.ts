import cors from "cors";
import express from "express";
import { sendRegistrationEmail } from "./services/emailService.js";
import {
  createParticipant,
  deleteParticipant,
  getParticipantSummary,
  getParticipants,
  updateParticipant,
} from "./services/googleSheetsService.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend fungerer!" });
});

app.get("/api/summary/:participantName", async (req, res) => {
  try {
    const summary = await getParticipantSummary(req.params.participantName)

    if (!summary) {
      res.status(404).json({ error: "Fant ikke deltakeren i oppsummeringen" })
      return
    }

    res.json({ participant: req.params.participantName, scores: summary })
  } catch (error) {
    const googleError = error as { message?: string; response?: { status?: number; data?: { error?: { message?: string } } } }
    console.error("Kunne ikke hente data fra Google Sheets:", {
      message: googleError.message,
      status: googleError.response?.status,
      details: googleError.response?.data?.error?.message,
    })
    res.status(500).json({ error: "Kunne ikke hente data fra Google Sheets" })
  }
});

app.get("/api/participants", async (_req, res) => {
  try {
    res.json(await getParticipants())
  } catch (error) {
    console.error("Kunne ikke hente deltakere fra Google Sheets:", error)
    res.status(500).json({ error: "Kunne ikke hente deltakere fra Google Sheets" })
  }
});

app.post("/api/participants", async (req, res) => {
  const { name, score, password, email } = req.body as {
    name?: unknown
    score?: unknown
    password?: unknown
    email?: unknown
  }
  if (
    typeof name !== "string" ||
    typeof score !== "number" ||
    typeof password !== "string" ||
    typeof email !== "string"
  ) {
    res.status(400).json({ error: "name, score, password og email må være gyldige verdier" })
    return
  }

  try {
    const normalizedName = name.trim()
    const normalizedEmail = email.trim()
    await createParticipant({ name: normalizedName, score, password, email: normalizedEmail })
    const participants = await getParticipants()
    const registeredParticipant = participants.find((participant) => (
      participant.name === normalizedName && participant.email === normalizedEmail
    ))

    if (!registeredParticipant) {
      res.status(500).json({ error: "Deltakeren ble lagret, men kunne ikke hentes for e-post" })
      return
    }

    await sendRegistrationEmail(registeredParticipant)
    res.status(201).json({ name: normalizedName, score })
  } catch (error) {
    const mailError = error as { code?: string; response?: string; message?: string }
    console.error("Kunne ikke opprette deltaker eller sende e-post:", {
      code: mailError.code,
      response: mailError.response,
      message: mailError.message,
    })
    res.status(500).json({ error: "Deltakeren ble lagret, men e-posten kunne ikke sendes" })
  }
});

app.put("/api/participants/:participantName", async (req, res) => {
  const { name, score, password, email } = req.body as {
    name?: unknown
    score?: unknown
    password?: unknown
    email?: unknown
  }
  if (
    typeof name !== "string" ||
    typeof score !== "number" ||
    (password !== undefined && typeof password !== "string") ||
    (email !== undefined && typeof email !== "string")
  ) {
    res.status(400).json({ error: "name og score må være gyldige verdier, og password/email må være tekst" })
    return
  }

  try {
    const updated = await updateParticipant({ name, score, password, email })
    if (!updated) {
      res.status(404).json({ error: "Fant ikke deltakeren" })
      return
    }
    res.json({ name: name.trim(), score })
  } catch (error) {
    console.error("Kunne ikke oppdatere deltaker:", error)
    res.status(500).json({ error: "Kunne ikke oppdatere deltaker" })
  }
});

app.delete("/api/participants/:participantName", async (req, res) => {
  try {
    const deleted = await deleteParticipant(req.params.participantName)
    if (!deleted) {
      res.status(404).json({ error: "Fant ikke deltakeren" })
      return
    }
    res.status(204).send()
  } catch (error) {
    console.error("Kunne ikke slette deltaker:", error)
    res.status(500).json({ error: "Kunne ikke slette deltaker" })
  }
});

app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});
