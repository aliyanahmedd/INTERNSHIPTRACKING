import sqlite3 from "sqlite3";
sqlite3.verbose();

const DB_FILE = process.env.DB_FILE || "data.db";

/**
 * We open (or create) the SQLite database file.
 * SQLite stores data in a single file on disk.
 */
export const db = new sqlite3.Database(DB_FILE);

/**
 * Create table if it doesn't exist.
 * This runs once when the server starts.
 */
export function initDb() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS internships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'applied',
        created_at TEXT NOT NULL
      )
    `);
  });
}