import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db, initDb } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize DB table(s) at startup
initDb();

app.get("/health", (req, res) => {
  res.json({ ok: true, date: new Date().toISOString() });
});

/**
 * GET /internships
 * Returns all internships (newest first).
 */
app.get("/internships", (req, res) => {
  db.all(
    "SELECT id, company, role, status, created_at FROM internships ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/**
 * POST /internships
 * Body: { company, role, status? }
 * Creates a new internship record.
 */
app.post("/internships", (req, res) => {
  const { company, role, status } = req.body;

  if (!company || !role) {
    return res.status(400).json({ error: "company and role are required" });
  }

  const createdAt = new Date().toISOString();
  const finalStatus = status || "applied";

  db.run(
    "INSERT INTO internships (company, role, status, created_at) VALUES (?, ?, ?, ?)",
    [company, role, finalStatus, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // "this.lastID" is provided by sqlite3 for INSERT statements
      res.status(201).json({
        id: this.lastID,
        company,
        role,
        status: finalStatus,
        created_at: createdAt,
      });
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});