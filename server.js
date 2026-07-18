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
const { init, getPublicIdeas, recordInterest, addContactRequest } = require("./db");
init();

const app = express();

// Use the PORT from .env, or fall back to 3000 if it is not set.
const PORT = process.env.PORT || 3000;

// Read JSON request bodies (used by the contact form). Small size limit.
app.use(express.json({ limit: "10kb" }));

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

// --- Public API: save a Stay in Touch contact request -----------------
// Accepts JSON { email, consent }. Validates independently of the browser,
// stores a consented, normalised email privately, and never echoes it back.
// There is NO public route to read contact requests.
app.post("/api/contact", (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Please enter your email address." });
  }

  // Email must be a string.
  if (typeof body.email !== "string") {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  // Trim and normalise to lowercase before any checks or storage.
  const email = body.email.trim().toLowerCase();

  if (email.length === 0) {
    return res.status(400).json({ error: "Please enter your email address." });
  }
  if (email.length > 254) {
    return res.status(400).json({ error: "That email address is too long." });
  }
  // Reasonable basic email-format check: something@something.something
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  // Consent must be exactly true.
  if (body.consent !== true) {
    return res.status(400).json({ error: "Please tick the consent box to continue." });
  }

  try {
    addContactRequest(email);
    // Minimal success response — the email is never echoed back.
    return res.status(201).json({
      success: true,
      message: "Thanks — your email has been saved.",
    });
  } catch (err) {
    console.error("Failed to save contact request:", err);
    return res.status(500).json({ error: "Could not save your email. Please try again." });
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
