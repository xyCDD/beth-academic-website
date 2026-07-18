/* =========================================================================
   server.js — Local Express web server for Beth's website
   What it does in this stage:
     1. Loads settings from the local .env file (PORT, NODE_ENV)
     2. Sets up the database (creates tables + seeds ideas on first run)
     3. Serves the public/ folder (the visitor-facing website)
     4. Provides one public API route: GET /api/ideas
     5. Starts on http://localhost:3000
   Not in this stage: admin routes, saving interests, saving emails.
   ========================================================================= */

// Load environment variables from .env into process.env
require("dotenv").config();

const path = require("node:path");
const express = require("express");

// Our database module (built-in node:sqlite). init() is safe to run every start.
const { init, getPublicIdeas, recordInterest } = require("./db");
init();

const app = express();

// Use the PORT from .env, or fall back to 3000 if it is not set.
const PORT = process.env.PORT || 3000;

// --- Serve the public website -----------------------------------------
// This exposes ONLY the public/ folder to visitors.
// The admin/ folder is intentionally NOT served here.
app.use(express.static(path.join(__dirname, "public")));

// --- Public API: list of publicly-visible research ideas --------------
// Returns JSON. interest_count is calculated from the database.
app.get("/api/ideas", (req, res) => {
  try {
    res.json(getPublicIdeas());
  } catch (err) {
    console.error("Failed to load research ideas:", err);
    res.status(500).json({ error: "Could not load research ideas." });
  }
});

// --- Public API: record one "I'm interested" for an idea --------------
// One-way action: this only ADDS an interest. There is no route to remove,
// toggle, or decrement an interest. It stores no visitor text or personal data.
app.post("/api/ideas/:id/interest", (req, res) => {
  // The id in the URL must be digits only (a positive whole number).
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ error: "Invalid idea id." });
  }
  const ideaId = Number(req.params.id);
  if (!Number.isInteger(ideaId) || ideaId <= 0) {
    return res.status(400).json({ error: "Invalid idea id." });
  }

  try {
    const result = recordInterest(ideaId);
    if (!result.found) {
      // No such idea, or the idea is not public.
      return res.status(404).json({ error: "Research idea not found." });
    }
    return res.json({
      success: true,
      idea_id: ideaId,
      interest_count: result.interest_count,
    });
  } catch (err) {
    console.error("Failed to record interest:", err);
    return res.status(500).json({ error: "Could not record interest." });
  }
});

// --- Start the server -------------------------------------------------
app.listen(PORT, () => {
  console.log("");
  console.log("  Beth's academic website is running.");
  console.log("  Open this address in your browser:");
  console.log("    http://localhost:" + PORT);
  console.log("");
  console.log("  Press Ctrl+C to stop the server.");
  console.log("");
});
