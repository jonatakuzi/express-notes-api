/**
 * server.js — HTTP server entry point
 *
 * Starts the Express app on the configured port.
 * Run with: node server.js
 *           PORT=4000 node server.js
 */

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n  express-notes-api running on http://localhost:${PORT}\n`);
});
