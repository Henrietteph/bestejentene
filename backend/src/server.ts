import express from "express";

const app = express();

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend fungerer!" });
});

app.listen(3000, () => {
  console.log("Server kjører på http://localhost:3000");
});
