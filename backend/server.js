import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { db, initDb } from "./db.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Auth helpers
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set. Set it in backend/.env");
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.sub, username: decoded.username };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * POST /auth/signup
 * Body: { username, password }
 */
app.post("/auth/signup", (req, res) => {
  const { username, password } = req.body;

  const u = (username || "").trim();
  const p = password || "";

  if (u.length < 3) return res.status(400).json({ error: "username must be at least 3 characters" });
  if (p.length < 6) return res.status(400).json({ error: "password must be at least 6 characters" });

  const password_hash = bcrypt.hashSync(p, 10);

  db.run(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    [u, password_hash],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(409).json({ error: "username already exists" });
        }
        return res.status(500).json({ error: err.message });
      }

      const token = signToken({ sub: this.lastID, username: u });
      res.status(201).json({ token, username: u });
    }
  );
});

/**
 * POST /auth/login
 * Body: { username, password }
 */
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  const u = (username || "").trim();
  const p = password || "";

  if (!u || !p) return res.status(400).json({ error: "username and password are required" });

  db.get(
    "SELECT id, username, password_hash FROM users WHERE username = ?",
    [u],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(401).json({ error: "invalid credentials" });

      const ok = bcrypt.compareSync(p, row.password_hash);
      if (!ok) return res.status(401).json({ error: "invalid credentials" });

      const token = signToken({ sub: row.id, username: row.username });
      res.json({ token, username: row.username });
    }
  );
});

/**
 * GET /internships (auth required)
 * Returns only internships belonging to the logged-in user.
 */
app.get("/internships", requireAuth, (req, res) => {
  db.all(
    "SELECT id, company, role, status, link, notes, created_at FROM internships WHERE user_id = ? ORDER BY id DESC",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/**
 * POST /internships (auth required)
 */
app.post("/internships", requireAuth, (req, res) => {
  const { company, role, status, link, notes } = req.body;

  if (!company || !role) {
    return res.status(400).json({ error: "company and role are required" });
  }

  const createdAt = new Date().toISOString();
  const finalStatus = status || "applied";
  const finalLink = link?.trim() || null;
  const finalNotes = notes?.trim() || null;

  db.run(
    "INSERT INTO internships (company, role, status, link, notes, created_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [company, role, finalStatus, finalLink, finalNotes, createdAt, req.user.id],
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
 * PUT /internships/:id (auth required)
 */
app.put("/internships/:id", requireAuth, (req, res) => {
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
    "UPDATE internships SET company = ?, role = ?, status = ?, link = ?, notes = ? WHERE id = ? AND user_id = ?",
    [company, role, status, finalLink, finalNotes, id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Not found" });

      res.json({ ok: true });
    }
  );
});

/**
 * DELETE /internships/:id (auth required)
 */
app.delete("/internships/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);

  db.run(
    "DELETE FROM internships WHERE id = ? AND user_id = ?",
    [id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Not found" });

      res.json({ ok: true });
    }
  );
});

initDb();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});