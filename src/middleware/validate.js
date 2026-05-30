/**
 * validate.js — Request validation middleware
 *
 * Lightweight validation helpers used by note routes.
 * Returns 400 Bad Request with a descriptive error message
 * if required fields are missing or invalid.
 */

/**
 * Validates the body of a POST /notes or PUT /notes/:id request.
 * Requires: title (non-empty string)
 * Optional: body (string), tags (array of strings or comma string), pinned (boolean)
 */
function validateNote(req, res, next) {
  const { title, tags, pinned } = req.body;

  if (title === undefined || title === null) {
    return res.status(400).json({ error: "title is required" });
  }

  if (typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({ error: "title must be a non-empty string" });
  }

  if (title.length > 255) {
    return res.status(400).json({ error: "title must be 255 characters or fewer" });
  }

  // tags can be an array ["work","urgent"] or a comma string "work,urgent"
  if (tags !== undefined) {
    if (Array.isArray(tags)) {
      const invalid = tags.some((t) => typeof t !== "string");
      if (invalid) {
        return res.status(400).json({ error: "each tag must be a string" });
      }
    } else if (typeof tags !== "string") {
      return res.status(400).json({ error: "tags must be a string or array of strings" });
    }
  }

  if (pinned !== undefined && typeof pinned !== "boolean") {
    return res.status(400).json({ error: "pinned must be a boolean" });
  }

  next();
}

/**
 * Validates that :id is a positive integer.
 */
function validateId(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }
  req.noteId = id;
  next();
}

module.exports = { validateNote, validateId };
