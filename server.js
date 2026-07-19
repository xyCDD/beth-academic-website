/* =========================================================================
   server.js — Local Express web server for Beth's website

   Public site  : serves public/ and the public APIs (ideas, interest, contact)
   Admin panel  : password login (cookie-session), protected admin APIs, and
                  admin pages served via explicit routes (NOT express.static).
   Not in this stage: VPS, domain, Nginx, HTTPS.
   ========================================================================= */

// Load environment variables from .env into process.env FIRST.
require("dotenv").config();

// --- Require critical settings before anything else -------------------
// If a required secret is missing, stop with a clear, beginner-friendly
// message. We never print the VALUES of these settings.
const REQUIRED_ENV = ["ADMIN_PASSWORD", "SESSION_SECRET"];
const missingEnv = REQUIRED_ENV.filter(function (key) {
  return !process.env[key] || String(process.env[key]).trim() === "";
});
if (missingEnv.length > 0) {
  console.error("");
  console.error("  Cannot start the server: missing required setting(s): " + missingEnv.join(", "));
  console.error("  Please add them to your .env file (see .env.example), for example:");
  console.error("    ADMIN_PASSWORD=choose-a-strong-password");
  console.error("    SESSION_SECRET=a-long-random-string");
  console.error("  Then run  npm start  again.");
  console.error("");
  process.exit(1);
}

const path = require("node:path");
const crypto = require("node:crypto");
const express = require("express");
const cookieSession = require("cookie-session");

const {
  init,
  getPublicIdeas,
  recordInterest,
  addContactRequest,
  getAllIdeasAdmin,
  getIdeaAdminById,
  updateIdea,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} = require("./db");
init();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === "production";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const ALLOWED_IDEA_STATUS = ["Exploring", "Developing", "Paused"];
const ALLOWED_CONTACT_STATUS = ["new", "contacted", "archived"];

// Read JSON request bodies (small size limit).
app.use(express.json({ limit: "10kb" }));

// Signed cookie session for the single admin. Stores only a small flag.
app.use(
  cookieSession({
    name: "beth_admin",
    secret: process.env.SESSION_SECRET,
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD, // Secure cookie only over HTTPS (production)
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  })
);

// --- Serve the public website (public/ only) --------------------------
// The admin/ folder is NOT exposed here; admin files are served by the
// explicit routes further below.
app.use(express.static(path.join(__dirname, "public")));

/* ---- Small helpers --------------------------------------------------- */
function isAdmin(req) {
  return !!(req.session && req.session.isAdmin === true);
}

// Constant-time password comparison. Both sides are hashed to a fixed
// length first so lengths can never be leaked or cause a throw.
function passwordMatches(candidate) {
  const a = crypto.createHash("sha256").update(String(candidate)).digest();
  const b = crypto.createHash("sha256").update(String(ADMIN_PASSWORD)).digest();
  return crypto.timingSafeEqual(a, b);
}

// Reject unauthenticated admin API requests with 401.
function requireAdmin(req, res, next) {
  if (isAdmin(req)) return next();
  return res.status(401).json({ error: "Not authenticated." });
}

// For state-changing requests, reject clearly cross-origin calls when the
// browser tells us where they came from. Simple, no CSRF-token system.
function sameOriginGuard(req, res, next) {
  const changing = ["POST", "PATCH", "PUT", "DELETE"].indexOf(req.method) !== -1;
  if (changing) {
    const host = req.get("host");
    const origin = req.get("origin");
    const referer = req.get("referer");
    const hostOf = function (u) {
      try { return new URL(u).host; } catch (e) { return null; }
    };
    if (origin && hostOf(origin) !== host) {
      return res.status(403).json({ error: "Cross-origin request rejected." });
    }
    if (!origin && referer && hostOf(referer) !== host) {
      return res.status(403).json({ error: "Cross-origin request rejected." });
    }
  }
  next();
}

/* =====================================================================
   PUBLIC API
   ===================================================================== */

app.get("/api/ideas", (req, res) => {
  try {
    res.json(getPublicIdeas());
  } catch (err) {
    console.error("Failed to load research ideas:", err);
    res.status(500).json({ error: "Could not load research ideas." });
  }
});

app.post("/api/ideas/:id/interest", (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ error: "Invalid idea id." });
  }
  const ideaId = Number(req.params.id);
  try {
    const result = recordInterest(ideaId);
    if (!result.found) {
      return res.status(404).json({ error: "Research idea not found." });
    }
    return res.json({ success: true, idea_id: ideaId, interest_count: result.interest_count });
  } catch (err) {
    console.error("Failed to record interest:", err);
    return res.status(500).json({ error: "Could not record interest." });
  }
});

app.post("/api/contact", (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Please enter your email address." });
  }
  if (typeof body.email !== "string") {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  const email = body.email.trim().toLowerCase();
  if (email.length === 0) {
    return res.status(400).json({ error: "Please enter your email address." });
  }
  if (email.length > 254) {
    return res.status(400).json({ error: "That email address is too long." });
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (body.consent !== true) {
    return res.status(400).json({ error: "Please tick the consent box to continue." });
  }
  try {
    addContactRequest(email);
    return res.status(201).json({ success: true, message: "Thanks — your email has been saved." });
  } catch (err) {
    console.error("Failed to save contact request:", err);
    return res.status(500).json({ error: "Could not save your email. Please try again." });
  }
});

/* =====================================================================
   ADMIN API  (same-origin guard on all; requireAdmin on data routes)
   ===================================================================== */

app.use("/api/admin", sameOriginGuard);

// ---- Auth ----
app.post("/api/admin/login", (req, res) => {
  const password = req.body && req.body.password;
  if (typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ error: "Please enter the password." });
  }
  if (passwordMatches(password)) {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }
  // Generic message — never reveal anything about the correct password.
  return res.status(401).json({ error: "Incorrect password." });
});

app.post("/api/admin/logout", (req, res) => {
  req.session = null;
  return res.json({ success: true });
});

app.get("/api/admin/session", (req, res) => {
  return res.json({ authenticated: isAdmin(req) });
});

// ---- Research ideas (admin) ----
app.get("/api/admin/ideas", requireAdmin, (req, res) => {
  try {
    return res.json(getAllIdeasAdmin());
  } catch (err) {
    console.error("Failed to load admin ideas:", err);
    return res.status(500).json({ error: "Could not load research ideas." });
  }
});

app.patch("/api/admin/ideas/:id", requireAdmin, (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ error: "Invalid idea id." });
  }
  const id = Number(req.params.id);
  const existing = getIdeaAdminById(id);
  if (!existing) {
    return res.status(404).json({ error: "Research idea not found." });
  }

  const body = req.body || {};
  const update = {};
  if ("status" in body) {
    if (typeof body.status !== "string" || ALLOWED_IDEA_STATUS.indexOf(body.status) === -1) {
      return res.status(400).json({ error: "Invalid status value." });
    }
    update.status = body.status;
  }
  if ("is_public" in body) {
    if (typeof body.is_public !== "boolean") {
      return res.status(400).json({ error: "Invalid visibility value." });
    }
    update.is_public = body.is_public;
  }
  // Only status and is_public are ever applied; any other field is ignored.
  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: "Nothing to update." });
  }

  try {
    return res.json(updateIdea(id, update));
  } catch (err) {
    console.error("Failed to update idea:", err);
    return res.status(500).json({ error: "Could not update research idea." });
  }
});

// ---- Contact requests (admin) ----
app.get("/api/admin/contacts", requireAdmin, (req, res) => {
  try {
    return res.json(getAllContacts());
  } catch (err) {
    console.error("Failed to load contacts:", err);
    return res.status(500).json({ error: "Could not load contact requests." });
  }
});

app.patch("/api/admin/contacts/:id", requireAdmin, (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ error: "Invalid contact id." });
  }
  const id = Number(req.params.id);
  const existing = getContactById(id);
  if (!existing) {
    return res.status(404).json({ error: "Contact request not found." });
  }
  const status = req.body && req.body.status;
  if (typeof status !== "string" || ALLOWED_CONTACT_STATUS.indexOf(status) === -1) {
    return res.status(400).json({ error: "Invalid status value." });
  }
  try {
    return res.json(updateContactStatus(id, status));
  } catch (err) {
    console.error("Failed to update contact:", err);
    return res.status(500).json({ error: "Could not update contact request." });
  }
});

app.delete("/api/admin/contacts/:id", requireAdmin, (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ error: "Invalid contact id." });
  }
  const id = Number(req.params.id);
  const existing = getContactById(id);
  if (!existing) {
    return res.status(404).json({ error: "Contact request not found." });
  }
  try {
    deleteContact(id);
    return res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete contact:", err);
    return res.status(500).json({ error: "Could not delete contact request." });
  }
});

/* =====================================================================
   ADMIN PAGES + ASSETS  (explicit routes — the admin/ folder is NOT
   exposed as a public static directory)
   ===================================================================== */
const ADMIN_DIR = path.join(__dirname, "admin");

app.get("/admin/login", (req, res) => {
  if (isAdmin(req)) return res.redirect("/admin");
  return res.sendFile(path.join(ADMIN_DIR, "login.html"));
});

app.get("/admin", (req, res) => {
  if (!isAdmin(req)) return res.redirect("/admin/login");
  return res.sendFile(path.join(ADMIN_DIR, "dashboard.html"));
});

// Only these specific admin assets are served (no secrets in them).
app.get("/admin/admin.css", (req, res) => res.sendFile(path.join(ADMIN_DIR, "admin.css")));
app.get("/admin/login.js", (req, res) => res.sendFile(path.join(ADMIN_DIR, "login.js")));
app.get("/admin/dashboard.js", (req, res) => res.sendFile(path.join(ADMIN_DIR, "dashboard.js")));

/* ---- Start the server ------------------------------------------------ */
app.listen(PORT, () => {
  console.log("");
  console.log("  Beth's academic website is running.");
  console.log("  Public site: http://localhost:" + PORT);
  console.log("  Admin login: http://localhost:" + PORT + "/admin/login");
  console.log("");
  console.log("  Press Ctrl+C to stop the server.");
  console.log("");
});
