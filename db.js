/* =========================================================================
   db.js — SQLite database for Beth's website
   Uses Node.js 24's BUILT-IN SQLite module (no third-party driver).
   Responsibilities:
     1. Open (or create) the database file  data/site.db
     2. Create the three tables on first run
     3. Seed the three research ideas ONLY if the table is empty
     4. Provide a small helper to read the public ideas for the API
   ========================================================================= */

const { DatabaseSync } = require("node:sqlite");
const path = require("node:path");
const fs = require("node:fs");

// The database lives in a local  data/  folder next to this file.
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "site.db");

// Make sure the data/ folder exists before opening the database file.
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Open the database (creates the file if it does not exist yet).
const db = new DatabaseSync(DB_PATH);

// A small helper for consistent ISO timestamps.
function nowIso() {
  return new Date().toISOString();
}

/* ---- Table creation -------------------------------------------------- */
// "IF NOT EXISTS" means this is safe to run on every startup.
function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS research_ideas (
      id          INTEGER PRIMARY KEY,
      idea_key    TEXT UNIQUE NOT NULL,
      title       TEXT NOT NULL,
      description TEXT NOT NULL,
      keywords    TEXT NOT NULL,
      status      TEXT NOT NULL,
      is_public   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS idea_interests (
      id         INTEGER PRIMARY KEY,
      idea_id    INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (idea_id) REFERENCES research_ideas(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_requests (
      id            INTEGER PRIMARY KEY,
      email         TEXT NOT NULL,
      consent_given INTEGER NOT NULL,
      status        TEXT NOT NULL DEFAULT 'new',
      created_at    TEXT NOT NULL
    );
  `);
}

/* ---- Seed data ------------------------------------------------------- */
// The three starter research ideas. These are inserted ONLY when the
// research_ideas table is completely empty, so later admin edits are never
// overwritten and ideas are never duplicated.
const SEED_IDEAS = [
  {
    idea_key: "preorder-design",
    title: "Preference-Informed Preorder Design",
    description:
      "How discounts, gifts, cashback, and refund policies shape consumers’ willingness to preorder and the timing of their purchase decisions.",
    keywords: "Advance Selling, Pricing, Promotion, Perceived Risk",
    status: "Developing",
  },
  {
    idea_key: "ai-trust",
    title: "AI Disclosure and Consumer Trust",
    description:
      "How knowing that marketing content was created by AI changes perceived authenticity, trust, and willingness to engage.",
    keywords: "AI Disclosure, Consumer Trust, Authenticity, Digital Content",
    status: "Exploring",
  },
  {
    idea_key: "digital-presentation",
    title: "Digital Product Presentation and Choice",
    description:
      "How product orientation, visual arrangement, and information presentation influence product evaluation and choice satisfaction online.",
    keywords: "Interface Design, Product Display, Online Choice, Choice Satisfaction",
    status: "Exploring",
  },
];

function seedIdeasIfEmpty() {
  // Count existing ideas. If there are any, do nothing at all.
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM research_ideas").get();
  if (count > 0) {
    return; // already populated — never duplicate, never overwrite edits
  }

  const insert = db.prepare(`
    INSERT INTO research_ideas
      (idea_key, title, description, keywords, status, is_public, created_at, updated_at)
    VALUES
      (?, ?, ?, ?, ?, 1, ?, ?)
  `);

  const ts = nowIso();
  for (const idea of SEED_IDEAS) {
    insert.run(idea.idea_key, idea.title, idea.description, idea.keywords, idea.status, ts, ts);
  }
}

/* ---- Public initialisation ------------------------------------------- */
// Called once when the server starts. Safe to run every time.
function init() {
  createTables();
  seedIdeasIfEmpty();
}

/* ---- Read helper for the public API ---------------------------------- */
// Returns only publicly-visible ideas, each with its interest_count
// calculated from the idea_interests table (not hard-coded).
function getPublicIdeas() {
  const ideas = db
    .prepare(
      `SELECT id, idea_key, title, description, keywords, status
         FROM research_ideas
        WHERE is_public = 1
        ORDER BY id ASC`
    )
    .all();

  const countInterests = db.prepare(
    "SELECT COUNT(*) AS count FROM idea_interests WHERE idea_id = ?"
  );

  return ideas.map((idea) => ({
    id: idea.id,
    idea_key: idea.idea_key,
    title: idea.title,
    description: idea.description,
    // keywords are stored as a comma-separated string; return an array.
    keywords: idea.keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0),
    status: idea.status,
    interest_count: countInterests.get(idea.id).count,
  }));
}

/* ---- Record one interest for a public idea --------------------------- */
// Verifies the idea exists AND is public, inserts exactly one row into
// idea_interests, then returns the fresh count from the database.
// Returns { found: false } if there is no matching public idea.
function recordInterest(ideaId) {
  const idea = db
    .prepare("SELECT id FROM research_ideas WHERE id = ? AND is_public = 1")
    .get(ideaId);

  if (!idea) {
    return { found: false };
  }

  db.prepare("INSERT INTO idea_interests (idea_id, created_at) VALUES (?, ?)").run(
    ideaId,
    nowIso()
  );

  const { count } = db
    .prepare("SELECT COUNT(*) AS count FROM idea_interests WHERE idea_id = ?")
    .get(ideaId);

  return { found: true, interest_count: count };
}

module.exports = { db, init, getPublicIdeas, recordInterest };
