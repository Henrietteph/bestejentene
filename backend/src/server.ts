import cors from "cors";
import express from "express";
import { getParticipantSummary } from "./services/googleSheetsService.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(cors({ origin: frontendUrl }));

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

app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});
