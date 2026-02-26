import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db, initDb } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize DB table(s) at startup (and run migrations)
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
    "SELECT id, company, role, status, link, notes, created_at FROM internships ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/**
 * POST /internships
 * Body: { company, role, status?, link?, notes? }
 * Creates a new internship record.
 */
app.post("/internships", (req, res) => {
  const { company, role, status, link, notes } = req.body;

  if (!company || !role) {
    return res.status(400).json({ error: "company and role are required" });
  }

  const createdAt = new Date().toISOString();
  const finalStatus = status || "applied";
  const finalLink = link?.trim() || null;
  const finalNotes = notes?.trim() || null;

  db.run(
    "INSERT INTO internships (company, role, status, link, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [company, role, finalStatus, finalLink, finalNotes, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        id: this.lastID,
        company,
        role,
        status: finalStatus,
        link: finalLink,
        notes: finalNotes,
        created_at: createdAt,
      });
    }
  );
});

/**
 * PUT /internships/:id
 * Body: { company, role, status, link?, notes? }
 * Updates an internship (full edit).
 */
app.put("/internships/:id", (req, res) => {
  const id = Number(req.params.id);
  const { company, role, status, link, notes } = req.body;

  const allowed = ["applied", "interviewing", "offer", "rejected"];
  if (!company || !role || !allowed.includes(status)) {
    return res.status(400).json({
      error: "company, role, and a valid status are required",
    });
  }

  const finalLink = link?.trim() || null;
  const finalNotes = notes?.trim() || null;

  db.run(
    "UPDATE internships SET company = ?, role = ?, status = ?, link = ?, notes = ? WHERE id = ?",
    [company, role, status, finalLink, finalNotes, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Not found" });

      res.json({ ok: true });
    }
  );
});

/**
 * DELETE /internships/:id
 * Deletes an internship by id.
 */
app.delete("/internships/:id", (req, res) => {
  const id = Number(req.params.id);

  db.run("DELETE FROM internships WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Not found" });

    res.json({ ok: true });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});