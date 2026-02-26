import sqlite3 from "sqlite3";
sqlite3.verbose();

const DB_FILE = process.env.DB_FILE || "data.db";

/**
 * Open (or create) the SQLite database file.
 * SQLite stores data in a single file on disk.
 */
export const db = new sqlite3.Database(DB_FILE);

/**
 * initDb creates the base table (if new) and runs small migrations
 * (ALTER TABLE) for older databases.
 */
export function initDb() {
  db.serialize(() => {
    // Base table (fresh database)
    db.run(`
      CREATE TABLE IF NOT EXISTS internships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'applied',
        link TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // Migrations for existing databases created before link/notes existed:
    // If the column already exists, SQLite will throw an error; we ignore that error.
    db.run(`ALTER TABLE internships ADD COLUMN link TEXT`, (err) => {
      if (err) {
        // Most common error here is "duplicate column name", which is fine.
      }
    });

    db.run(`ALTER TABLE internships ADD COLUMN notes TEXT`, (err) => {
      if (err) {
        // Ignore duplicate column name errors.
      }
    });
  });
}