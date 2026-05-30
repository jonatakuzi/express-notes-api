/**
 * db.js — SQLite database setup and initialization
 *
 * Uses better-sqlite3 for synchronous, easy-to-reason-about DB access.
 * The database file is created at ./notes.db in the project root.
 */

const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "notes.db");

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

/**
 * Create the notes table if it doesn't already exist.
 * Schema:
 *   id        - auto-increment primary key
 *   title     - required, max 255 chars
 *   body      - required, the note content
 *   tags      - comma-separated tag string (e.g. "work,urgent")
 *   pinned    - 0 or 1, default 0
 *   created_at - ISO timestamp, auto-set on insert
 *   updated_at - ISO timestamp, updated on every edit
 */
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    body       TEXT    NOT NULL DEFAULT '',
    tags       TEXT    NOT NULL DEFAULT '',
    pinned     INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
