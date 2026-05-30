# express-notes-api

A RESTful notes API built with **Node.js**, **Express**, and **SQLite** (`better-sqlite3`). Supports full CRUD, tag filtering, full-text search, and pin toggling — all backed by a lightweight local database with no external services required.

## Features

- **CRUD** — Create, read, update, and delete notes
- **Tags** — Attach multiple tags to notes; filter by tag
- **Search** — Query notes by title or body content (`?q=keyword`)
- **Pin** — Toggle pin status; pinned notes always appear first
- **Filter** — Combine `?tag=`, `?pinned=`, and `?q=` in any order
- **Zero config** — SQLite database auto-created on first run
- **Validation** — Input validated with descriptive error messages
- **Logging** — Every request logged with method, path, and timestamp

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js v18+ |
| Framework | Express 4 |
| Database | SQLite via `better-sqlite3` |

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/jonatakuzi/express-notes-api.git
cd express-notes-api

# 2. Install dependencies
npm install

# 3. Start the server
npm start
# Running on http://localhost:3000
```

## API Reference

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Health check & route map |
| `GET` | `/api/notes` | List all notes |
| `POST` | `/api/notes` | Create a note |
| `GET` | `/api/notes/tags` | List all unique tags |
| `GET` | `/api/notes/:id` | Get a note by ID |
| `PUT` | `/api/notes/:id` | Update a note |
| `DELETE` | `/api/notes/:id` | Delete a note |
| `PATCH` | `/api/notes/:id/pin` | Toggle pin status |

### Query Parameters for `GET /api/notes`

| Param | Type | Description |
|-------|------|-------------|
| `tag` | string | Filter by tag |
| `pinned` | `true\|false` | Filter by pin status |
| `q` | string | Search title and body |

## Example Requests

```bash
# Create a note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "body": "Milk, eggs, bread", "tags": ["personal"]}'

# List notes tagged "work"
curl "http://localhost:3000/api/notes?tag=work"

# Search notes
curl "http://localhost:3000/api/notes?q=meeting"

# Pin a note
curl -X PATCH http://localhost:3000/api/notes/1/pin
```

## Project Structure

```
express-notes-api/
├── src/
│   ├── db.js                 # SQLite setup and schema
│   ├── routes/
│   │   └── notes.js          # CRUD + filter routes
│   └── middleware/
│       └── validate.js       # Input validation
├── app.js                    # Express app config
├── server.js                 # Entry point
├── package.json
└── .gitignore
```

## License

MIT
