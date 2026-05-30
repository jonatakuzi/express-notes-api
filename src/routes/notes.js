/**
 * notes.js — CRUD routes for notes
 *
 * Routes:
 *   GET    /api/notes          - list all notes (supports ?tag=, ?pinned=, ?q= filters)
 *   POST   /api/notes          - create a note
 *   GET    /api/notes/:id      - get a single note
 *   PUT    /api/notes/:id      - update a note (full replace of provided fields)
 *   DELETE /api/notes/:id      - delete a note
 *   PATCH  /api/notes/:id/pin  - toggle pin status
 *   GET    /api/notes/tags     - list all unique tags in use
 */

const express = require("express");
const db = require("../db");
const { validateNote, validateId } = require("../middleware/validate");

const router = express.Router();

/* ── Helpers ──────────────────────────────────────── */

/**
 * Normalize tags from request body to a comma-separated string.
 * Accepts: array ["work","urgent"] or string "work, urgent"
 */
function normalizeTags(tags) {
  if (!tags) return "";
  if (Array.isArray(tags)) return tags.map((t) => t.trim()).filter(Boolean).join(",");
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .join(",");
}

/**
 * Convert a DB row's tags string back to an array for the JSON response.
 */
function formatNote(row) {
  if (!row) return null;
  return {
    ...row,
    tags: row.tags ? row.tags.split(",") : [],
    pinned: row.pinned === 1,
  };
}

/* ── GET /api/notes/tags — must come BEFORE /:id ─── */
router.get("/tags", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT tags FROM notes WHERE tags != ''").all();
  const tagSet = new Set();
  rows.forEach((r) => r.tags.split(",").forEach((t) => tagSet.add(t.trim())));
  res.json({ tags: [...tagSet].sort() });
});

/* ── GET /api/notes ─────────────────────────────── */
router.get("/", (req, res) => {
  const { tag, pinned, q } = req.query;

  let sql = "SELECT * FROM notes WHERE 1=1";
  const params = [];

  if (tag) {
    sql += " AND (',' || tags || ',' LIKE ?)";
    params.push(`%,${tag.trim()},%`);
  }

  if (pinned !== undefined) {
    sql += " AND pinned = ?";
    params.push(pinned === "true" ? 1 : 0);
  }

  if (q) {
    sql += " AND (title LIKE ? OR body LIKE ?)";
    const term = `%${q}%`;
    params.push(term, term);
  }

  sql += " ORDER BY pinned DESC, updated_at DESC";

  const rows = db.prepare(sql).all(...params);
  res.json({ count: rows.length, notes: rows.map(formatNote) });
});

/* ── POST /api/notes ────────────────────────────── */
router.post("/", validateNote, (req, res) => {
  const { title, body = "", tags, pinned = false } = req.body;

  const stmt = db.prepare(`
    INSERT INTO notes (title, body, tags, pinned)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(title.trim(), body, normalizeTags(tags), pinned ? 1 : 0);

  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(formatNote(note));
});

/* ── GET /api/notes/:id ─────────────────────────── */
router.get("/:id", validateId, (req, res) => {
  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.noteId);
  if (!note) return res.status(404).json({ error: `Note ${req.noteId} not found` });
  res.json(formatNote(note));
});

/* ── PUT /api/notes/:id ─────────────────────────── */
router.put("/:id", validateId, validateNote, (req, res) => {
  const existing = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.noteId);
  if (!existing) return res.status(404).json({ error: `Note ${req.noteId} not found` });

  const {
    title = existing.title,
    body = existing.body,
    tags = existing.tags,
    pinned = existing.pinned === 1,
  } = req.body;

  db.prepare(`
    UPDATE notes
    SET title = ?, body = ?, tags = ?, pinned = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(title.trim(), body, normalizeTags(tags), pinned ? 1 : 0, req.noteId);

  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.noteId);
  res.json(formatNote(note));
});

/* ── DELETE /api/notes/:id ──────────────────────── */
router.delete("/:id", validateId, (req, res) => {
  const existing = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.noteId);
  if (!existing) return res.status(404).json({ error: `Note ${req.noteId} not found` });

  db.prepare("DELETE FROM notes WHERE id = ?").run(req.noteId);
  res.json({ message: `Note ${req.noteId} deleted`, deleted: formatNote(existing) });
});

/* ── PATCH /api/notes/:id/pin ───────────────────── */
router.patch("/:id/pin", validateId, (req, res) => {
  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.noteId);
  if (!note) return res.status(404).json({ error: `Note ${req.noteId} not found` });

  const newPinned = note.pinned === 1 ? 0 : 1;
  db.prepare("UPDATE notes SET pinned = ?, updated_at = datetime('now') WHERE id = ?").run(
    newPinned,
    req.noteId
  );

  const updated = db.prepare("SELECT * FROM notes WHERE id = ?").get(req.noteId);
  res.json(formatNote(updated));
});

module.exports = router;
