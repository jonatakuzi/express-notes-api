/**
 * app.js — Express application setup
 *
 * Configures middleware, mounts routes, and defines
 * error handling. Exported for use by server.js and testing.
 */

const express = require("express");
const notesRouter = require("./src/routes/notes");

const app = express();

/* ── Middleware ──────────────────────────────────── */

// Parse incoming JSON request bodies
app.use(express.json());

// Simple request logger
app.use((req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
  next();
});

/* ── Routes ──────────────────────────────────────── */

// Health check
app.get("/", (req, res) => {
  res.json({
    name: "express-notes-api",
    version: "1.0.0",
    status: "ok",
    endpoints: {
      "GET    /api/notes":           "list all notes (supports ?tag=, ?pinned=, ?q=)",
      "POST   /api/notes":           "create a note",
      "GET    /api/notes/tags":      "list all unique tags",
      "GET    /api/notes/:id":       "get a note by id",
      "PUT    /api/notes/:id":       "update a note",
      "DELETE /api/notes/:id":       "delete a note",
      "PATCH  /api/notes/:id/pin":   "toggle pin status",
    },
  });
});

app.use("/api/notes", notesRouter);

/* ── 404 handler ─────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

/* ── Global error handler ────────────────────────── */
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

module.exports = app;
