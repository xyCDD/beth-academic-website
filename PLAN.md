# PLAN.md — Beth Personal Academic Website

_Planning document only. No website code has been written. This plan is for review and approval._

Last updated: 2026-07-16 (simplified scope)
Internal target: Friday, 2026-07-17 · Official deadline: Saturday, 2026-07-18

---

## 1. Final scope

A personal academic website for Beth, an incoming PhD student in Marketing.

**Positioning:** _A personal academic website where Beth shares developing research ideas, visitors can
signal their interest, and those open to further exchange can leave their contact information._

It is **not** a discussion platform, research social network, representative survey, or formal research
experiment. There is **no visitor-generated text content** in the MVP — visitors can only click a simple
interest button and optionally leave their email. Interest counts are informal visitor engagement, never
representative research data.

### In scope (MVP)

- One responsive scrolling public page with five sections: Hero, About Beth, Research Interests, Developing
  Research Ideas, Stay in Touch.
- Research idea cards loaded from the database (so admin edits show publicly).
- An **"I'm interested" heart button** per research idea, with a visible interest count.
- A **Stay in Touch** email form (email + required consent checkbox + submit).
- Real data storage in SQLite via Node.js 24's built-in `node:sqlite`.
- Password-protected admin panel on separate protected routes.
- Admin can view interest counts, view/manage contact emails, edit research ideas, and toggle visibility.
- Runs locally first; later deployed to a VPS with Nginx + HTTPS.

### Out of scope (explicitly removed — see "Removed features")

Research-idea voting, visitor comments/notes of any kind, comment moderation, the Research Interest Cloud,
keyword submission/normalization/approval, word-cloud frequency sizing, research-interest matching, and all
other visitor free-text input. Also excluded: user accounts, direct messaging, automated email, AI APIs,
complex analytics, charts, and any framework such as React or Vue.

### Optional (only if the entire MVP is finished, tested, and stable, and time remains)

Minor visual polish only. No new data types or interactions.

---

## 2. Technical architecture (unchanged, kept deliberately simple)

- **Frontend:** plain HTML, CSS, vanilla JavaScript. No build step, no framework.
- **Backend:** one small Node.js + Express server that serves the static files and a handful of JSON API
  routes. Runs on **Node.js 24 LTS** — the same major version locally and on the VPS.
- **Storage:** a single SQLite database file using **Node.js 24's built-in `node:sqlite` module** with
  `DatabaseSync` (`const { DatabaseSync } = require('node:sqlite');`). No third-party database driver — so
  there is nothing to compile and no native build step. Created locally.
- **Admin auth:** a single admin password read from an environment variable; a lightweight **signed cookie
  session via `cookie-session`** keeps the admin logged in — no server-side session store. The cookie holds
  only a minimal non-sensitive flag, e.g. `{ isAdmin: true }`; the admin password, the `SESSION_SECRET`
  (which stays only in the real `.env`), and any visitor data are **never** stored in the cookie. No user
  accounts. The `admin/` pages and all admin API routes are served **only** behind the protected session —
  never through public static-file hosting. The production cookie uses `httpOnly: true`, `sameSite: "lax"`,
  `secure: true` when `NODE_ENV` is production and HTTPS is active, and a reasonable `maxAge`. Kept simple
  and suitable for a single-admin course project.
- **Config & secrets:** `.env` for local secrets (never committed) — no password or secret ever appears in
  client-side JavaScript. Repository ships `.env.example` and a `.gitignore` that excludes `node_modules/`,
  `.env`, and the SQLite database file **from the very first commit**.

Rationale: this is close to what the course taught (Lesson 3 used Node + Express with file storage; the
assessment states "any DB, SQLite is enough"), it runs on the most basic VPS, and a beginner can follow
every moving part. Using Node.js 24's built-in `node:sqlite` keeps a real SQLite database while avoiding
any third-party database driver — nothing to compile — which removes a common source of setup failures.

### Suggested project structure (for reference — unchanged, not re-created this revision)

```
beth-academic-website/
  server.js              # Express app: static hosting + API + admin routes
  db.js                  # node:sqlite (DatabaseSync) connection + schema init
  package.json
  .env                   # LOCAL ONLY — never committed (admin password, session secret)
  .env.example           # committed template with placeholder values
  .gitignore             # excludes .env, *.db / data file, node_modules
  public/                # served to visitors
    index.html           # the single scrolling page
    styles.css
    main.js              # fetch calls for the interest button + Stay in Touch form
    assets/
      IMG_8056.jpeg      # headshot (replaceable)
  admin/                 # protected admin views — served ONLY via session-guarded routes,
    login.html           #   never through public static hosting
    dashboard.html
    admin.js
  data/
    site.db              # SQLite file — LOCAL ONLY, git-ignored (prod copy lives on VPS)
```

---

## 3. Page and section structure

Single responsive scrolling page, five sections. Background/education stays inside About and never
outweighs the research content.

1. **Minimal Hero** — name; current academic title; institutional affiliation (placeholder until
   confirmed); one research-positioning sentence; one or two navigation buttons; headshot.
2. **About Beth (concise, merged)** — a single short section (~80–120 words) covering, briefly: her current
   academic identity; her **Economics bachelor's** background; her **Professional Accountancy master's**
   background; **4+ years** of marketing communications and public relations experience; and a short
   explanation of her transition into consumer research. **No separate background timeline or career
   section.**
3. **Research Interests** — the interest areas as tags or small cards: consumer behaviour, pricing &
   promotion, AI & consumer trust, digital interfaces, online consumer decision-making.
4. **Developing Research Ideas** — two or three idea cards loaded from the database, each with title, short
   description, keywords, development status, an **"I'm interested" heart button**, and a visible **interest
   count**.
5. **Stay in Touch** — a simple email form (email + required consent checkbox + submit). Emails are private,
   never shown publicly.

Sticky top navigation links jump to sections. Admin lives on separate routes (`/admin/login`, `/admin`),
not linked from the public navigation.

---

## 4. Interactions

### 4.1 "I'm interested" on a research idea

- Each idea card shows a heart button and a count, e.g. **"♡ I'm interested"** → after clicking **"♥
  Interested"**, with a count line such as **"12 people are interested."**
- Clicking sends one request that creates **one `idea_interests` row** for that idea; the displayed count
  updates.
- **Simple browser-side guard:** the browser remembers (via `localStorage`) which ideas it has already
  marked, so the button shows the "Interested" state and does not send repeat clicks from the same browser.
  This is only a light guard to reduce accidental repeats — **no** user accounts, identity verification, or
  complex anti-duplicate system. It is understood that this does not prevent all duplicates, which is fine
  for an informal engagement signal.
- Framing: interest counts are an **informal signal of visitor engagement**, never representative research
  data. A short note near the section says so.

### 4.2 Stay in Touch (email capture)

- Fields: an **email address**, a **required consent checkbox**, and a submit button. Nothing else — no
  name, institution, message, public profile, or automated email.
- Suggested prompt: _"Interested in discussing one of these ideas in the future? Leave your email, and
  Beth may get in touch."_
- Suggested consent: _"I agree that my email may be stored and used by Beth to contact me about
  research-related exchange."_ The form cannot be submitted unless the box is checked.
- The email is **stored in SQLite**, **never displayed publicly**, visible **only in the protected admin
  panel**, passes **basic validation** (well-formed email; consent required), and is **removable from the
  admin panel**.

---

## 5. Data model (SQLite via `node:sqlite`)

Three small tables. Timestamps stored as ISO text.

**research_ideas** (database-driven, so an admin edit appears on the public site after refresh)

| column | type | notes |
|---|---|---|
| id | INTEGER PK | |
| title | TEXT | |
| description | TEXT | short |
| keywords | TEXT | comma-separated |
| status | TEXT | e.g. "Early idea", "Developing", "Exploring" |
| is_public | INTEGER | 1 = shown publicly, 0 = hidden |
| created_at | TEXT | |
| updated_at | TEXT | |

**idea_interests** (one row per visitor interest click)

| column | type | notes |
|---|---|---|
| id | INTEGER PK | |
| idea_id | INTEGER FK → research_ideas.id | |
| created_at | TEXT | |

_No comment or note field. The public count for an idea is the number of `idea_interests` rows with that
`idea_id`._

**contact_requests** (Stay in Touch emails — private, admin-only)

| column | type | notes |
|---|---|---|
| id | INTEGER PK | |
| email | TEXT | validated; never shown publicly |
| consent_given | INTEGER | must be 1 for every valid stored submission |
| status | TEXT | "new" · "contacted" · "archived" |
| created_at | TEXT | also serves as the submission / consent timestamp |

_Admin session state is not stored in the DB; it is a signed cookie. The admin password lives only in
`.env`._

---

## 6. Admin panel

Password login on protected routes; wrong password rejected; all `/admin` routes (pages and API) require a
valid session and are never served via public static hosting.

The admin can:

- **Log in** with the existing single-admin password system.
- **View total interest counts** for each research idea.
- **View contact request emails** (with their status and date).
- **Mark a contact request** as `contacted` or `archived`.
- **Delete a contact request.**
- **Edit a research idea's** title, short description, keywords, and status.
- **Toggle** whether a research idea is publicly visible (`is_public`).

Not included: comment moderation, keyword moderation, word-cloud management, charts, or visitor account
management.

Every content change is reflected on the public page on next load (research idea cards are database-driven).

---

## 7. Development stages (build and test one stage at a time)

Each stage ends with a working, tested state before the next begins. Security and Git hygiene come first
(already done in Stage 1), infrastructure preparation runs in parallel, and deployment happens as soon as
the required core features work locally.

- **Stage 0 — Planning (this step).** PLAN.md + DESIGN.md + README.md approved. _No code._
- **Stage 1 — Project setup & Git hygiene.** _Done:_ folder structure, `package.json`, `.gitignore`,
  `.env.example`, `README.md`, headshot in `public/assets/`, local Git initialised. (`npm install`, first
  commit, and GitHub repo are run by the user on their Mac.)
- **Stage 2 — Static shell.** `index.html` + `styles.css` with the five sections and navigation, drafted
  copy, headshot in a flexible container. Verify laptop + mobile. No backend yet.
- **Stage 3 — Infrastructure preparation (in parallel).** Register the domain; verify + rent the basic VPS;
  obtain the IP; point the A record early so DNS propagates while coding continues. Does not block coding.
- **Stage 4 — Server + database.** Create the real local `.env` when backend work starts. Express serves
  the page; `db.js` creates the schema on first run and seeds the two or three research ideas **only if the
  `research_ideas` table is empty**, starting with empty visitor data and never overwriting existing data.
  The public **Research Ideas cards load from SQLite via the API** — not hard-coded in `index.html`.
- **Stage 5 — "I'm interested" interaction.** API route creates one `idea_interests` row and returns the
  count; front-end updates the count and the button state; `localStorage` guards repeat clicks per browser.
- **Stage 6 — Stay in Touch.** API route validates and stores the email + consent in `contact_requests`
  (status `new`); on-screen acknowledgement. Emails never appear on the public page.
- **Stage 7 — Admin panel.** Password login; interest counts per idea; contact list with mark
  contacted/archived and delete; idea editing (title/description/keywords/status) and visibility toggle.
  Production cookie uses `httpOnly` / `sameSite: "lax"` / `secure` (once HTTPS) / `maxAge`. Completes the
  **required core features**.
- **Stage 8 — First live deployment (as soon as Stage 7 works locally).** On the prepared VPS: install
  Node 24, clone, `npm install`, create the production `.env` on the server only, run behind **Nginx**, add
  free **Let's Encrypt HTTPS**. The app initialises a fresh production database (schema + seeded ideas,
  empty visitor data). Confirm HTTPS on laptop + mobile and run the demo path (section 9).
- **Stage 9 — Polish (only after a working live deployment).** Minor visual refinement; skippable if time
  is short.

---

## 8. Testing checklist

Run after every major change; full pass before the Friday target.

Layout & responsiveness
- [ ] All five sections render on laptop and on a phone-width screen.
- [ ] Navigation links jump to the correct sections.
- [ ] Headshot displays well and does not dominate the mobile screen.

Research Ideas (database-driven, from Stage 4 on)
- [ ] The cards load from SQLite via the API, not hard-coded HTML.
- [ ] Editing an idea in admin and refreshing the public page shows the change.
- [ ] Setting an idea to hidden (`is_public = 0`) removes it from the public page after refresh.

"I'm interested" interaction
- [ ] Clicking the heart creates exactly one `idea_interests` row and the count increases.
- [ ] The button switches to the "Interested" state after clicking.
- [ ] After reload, the same browser still shows "Interested" and does not add another row (localStorage guard).
- [ ] The count is framed as informal engagement, not representative data.

Stay in Touch
- [ ] Submitting without checking consent is blocked.
- [ ] An invalid email is rejected; a valid email is accepted and acknowledged.
- [ ] The email is stored in `contact_requests` and never appears anywhere on the public page.

Admin
- [ ] Correct password logs in; wrong password rejected; `/admin` pages AND API require a session.
- [ ] Interest totals per idea are accurate.
- [ ] Contact emails are visible; mark contacted/archived works; delete removes the request.
- [ ] Editing an idea and toggling visibility reflect on the public page.

Security / hygiene
- [ ] `.env` and the DB file remain git-ignored and never committed.
- [ ] No password or secret appears in the repository or in client-side JavaScript.
- [ ] Basic length/validation limits on all inputs.
- [ ] Production session cookie uses `httpOnly`, `sameSite: "lax"`, and `secure` (once HTTPS is on).

Production database initialization (Stage 8)
- [ ] On first run the production DB creates the schema and seeds the research ideas.
- [ ] Production starts with empty visitor data (no local test interests or emails).
- [ ] Restarting the app does not overwrite or reset existing production data.

Deployment (Stage 8)
- [ ] Site opens over `https://` at the domain, on laptop and mobile.
- [ ] The full demo path (section 9) works on the deployed site.

---

## 9. Required live demo path

The plan supports this presentation sequence:

1. Open the public website.
2. Click **"I'm interested"** on a research idea.
3. Show that the interest count updates.
4. Submit an email through **Stay in Touch**.
5. Log in to the admin panel.
6. Show the new contact request.
7. Change a research idea's status.
8. Refresh the public website and show that the status changed.

---

## 10. Deployment order (infrastructure prepared early, deployed as soon as core features work)

Prepared early, in parallel (Stage 3): create the public GitHub repo (`.env`, `node_modules/`, DB file
excluded); register the cheapest suitable domain (Dynadot or Porkbun); verify + rent a basic VPS (Vultr /
Alibaba Cloud Intl / Tencent Cloud Intl, Hong Kong or Singapore region); obtain the VPS IP; point the A
record to it early so DNS propagates while coding continues.

First deployment, as soon as core features work locally (Stage 8): install Node 24, clone, `npm install`,
create the production `.env` on the server only, run behind Nginx, add free Let's Encrypt HTTPS. The app
initialises a fresh production database (schema on first run, seeded ideas, empty visitor data, no overwrite
on restart). Live test on laptop + mobile using the demo path.

Visual polish comes after a working live deployment (Stage 9).

---

## 11. Removed features (from the earlier plan)

The following were in earlier drafts and are **removed** in this simplified scope: research-idea voting
forms; optional notes/comments; comment submission; comment approval/moderation; public comments; the
Research Interest Cloud; keyword submission; keyword normalization; keyword approval; word-cloud frequency
and sizing; and research-interest matching. There is no visitor free-text input in the MVP. The former
About and Background/Journey sections are merged into one About Beth section, and the former Contact section
is replaced by Stay in Touch.

---

## 12. Risks and fallback options

- **Tight timeline (site must be live for the deadline).** _Priority:_ a basic but working **live version
  over HTTPS** is the goal; polish may be skipped. A local version is a troubleshooting backup only, **not**
  a compliant substitute for the required live domain + VPS + HTTPS. Internal target Friday, July 17;
  official deadline Saturday, July 18 — infrastructure is prepared early (Stage 3) to protect this.
- **First-time VPS / DNS / HTTPS setup.** _Fallback:_ prepare infrastructure early and in parallel so DNS
  has time to propagate; work step by step; keep the cheapest domain and most basic VPS plan.
- **Node.js version mismatch (local vs VPS).** Storage uses the built-in `node:sqlite`, so the main
  requirement is a recent Node. _Fallback:_ install **Node.js 24 LTS** on both machines; there is no driver
  to compile, so if `node:sqlite` is missing, Node is too old — upgrade Node rather than adding a package.
- **Duplicate interest clicks.** The `localStorage` guard is intentionally simple and does not stop every
  duplicate. _Accepted:_ counts are an informal engagement signal, not data; no accounts are added.
- **Accidentally committing secrets or the DB.** _Fallback:_ `.gitignore` is in place before the first
  commit; `.env.example` documents the shape without real values.
- **Scope creep back toward a platform.** _Fallback:_ the removed-features list is fixed; framing keeps it a
  personal academic site with an informal interest signal.
