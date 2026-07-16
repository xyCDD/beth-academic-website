# PLAN.md — Beth Personal Academic Website

_Planning document only. No website code has been written. This plan is for review and approval._

Last updated: 2026-07-16
Internal target: Friday, 2026-07-17 · Official deadline: Saturday, 2026-07-18

---

## 1. Final scope

A personal academic website for Beth, an incoming PhD student in Marketing. The site introduces her
current academic identity and developing research interests, presents two or three early-stage research
ideas, and invites visitors to respond through two lightweight interactions. A password-protected admin
panel lets Beth manage submissions and edit her own content, with changes appearing on the public site.

**Framing guardrail.** Beth's education and industry-to-research transition are *supporting context*, not
the centrepiece. The main focus is her academic identity, research interests, research ideas, and visitor
interaction. Visitor input is always described as informal feedback from website visitors — never as a
representative survey, causal finding, or proof of research feasibility. This stays a personal academic
website, not a research platform or social network.

### In scope (MVP — must be complete and stable before anything else)

- One responsive scrolling public page with clear navigation sections.
- Hero, About, Background/Journey, Research Interests, Research Ideas, Interactive Research Corner, Contact.
- Interaction 1: research-idea voting with optional comment.
- Interaction 2: open-ended research-interest keyword submission → admin-approved word cloud.
- Real data storage in SQLite.
- Password-protected admin panel on separate protected routes.
- Admin can: view votes/comments/keywords and totals; approve, hide, edit, delete keywords; edit research
  idea title/description/keywords/status; toggle a research idea's public visibility.
- Public content updates after an admin change.
- Runs locally first; later deployed to a VPS with Nginx + HTTPS.

### Out of scope (explicitly not built)

Research-interest matching, formal A/B experiments, matching algorithms, user registration/accounts,
direct messaging, real-time chat, automated email, AI/LLM APIs, AI recommendations, complex analytics,
social-networking features, multiple independent websites, heavy animation, and any framework such as
React or Vue.

### Optional (only if the entire MVP is finished, tested, and stable)

Simple voting-result charts (CSS bars first, no chart library), optional visitor name/institution field,
downloadable response data (CSV export in admin), interest filtering in admin, richer word-cloud styling.

---

## 2. Technical architecture (kept deliberately simple)

- **Frontend:** plain HTML, CSS, vanilla JavaScript. No build step, no framework.
- **Backend:** one small Node.js + Express server that serves the static files and a handful of JSON API
  routes. Runs on **Node.js 24 LTS** — the same major version locally and on the VPS.
- **Storage:** a single SQLite database file using **Node.js 24's built-in `node:sqlite` module** with
  `DatabaseSync` (`const { DatabaseSync } = require('node:sqlite');`). No third-party database driver — so
  there is nothing to compile or install, and no native-module build step. Created locally.
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
any third-party database driver — there is nothing to compile and no native build step, which removes a
common source of setup failures.

### Suggested project structure (for reference — not yet created)

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
    main.js              # fetch calls for voting + keyword submission + cloud
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

Single responsive scrolling page, sections in this fixed hierarchy (background must not outweigh research):

1. **Hero (minimal)** — name; current academic title; institutional affiliation (placeholder until
   confirmed); one research-positioning sentence; one or two navigation buttons; headshot.
2. **About (concise, ~80–120 words)** — who Beth is now and a one-to-two-sentence note on the industry →
   research transition. Not a CV or autobiography.
3. **Background / Journey (compact)** — education and industry experience as short items or a small
   timeline (Economics BA · Professional Accountancy MA · 4+ yrs marketing communications & PR). No
   employer/client/project lists.
4. **Research Interests** — the interest areas as tags or small cards: consumer behaviour, pricing &
   promotion, AI & consumer trust, digital interfaces, online consumer decision-making.
5. **Research Ideas** — two or three idea cards loaded from the database, each with title, short
   description, keywords, development status, and a simple "Vote for this idea" link/button. The card
   button does **not** contain its own form — it scrolls to the single voting form in the Interactive
   Research Corner and preselects the relevant idea.
6. **Interactive Research Corner** — Interaction 1 (idea voting + optional comment) and Interaction 2
   (keyword submission + public word cloud), each with the informal-snapshot disclaimer. The voting form,
   optional comment field, and submit button appear **only once**, here — not repeated inside each idea
   card.
7. **Contact** — a simple way to reach Beth (email link and/or professional profile links). No account or
   messaging system.

Sticky top navigation links jump to sections. Admin lives on separate routes (`/admin/login`,
`/admin`), not linked from the public navigation.

---

## 4. User journeys

**Visitor — read & respond**
Lands on hero → skims About and interests → reads a research idea → clicks "Vote for this idea" on a card,
which scrolls to the single voting form in the Interactive Research Corner with that idea preselected →
submits the vote and an optional comment → submits up to three of their own research keywords → sees the
approved community word cloud with its disclaimer → optionally uses Contact. All submissions are
acknowledged on screen ("thanks — your keywords are pending review").

**Visitor — casual browse**
Scrolls the page for Beth's profile and research without submitting anything. Everything reads clearly on
laptop and mobile with no interaction required.

**Admin (Beth) — moderate & edit**
Goes to `/admin/login` → enters the admin password → dashboard shows totals, pending keywords, votes, and
comments → approves/edits/standardises/hides/deletes keywords → edits a research idea or toggles its
visibility → returns to the public page and confirms the change is live.

---

## 5. Data model (SQLite)

Three small tables. Timestamps stored as ISO text.

**research_ideas**

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

**idea_votes**

| column | type | notes |
|---|---|---|
| id | INTEGER PK | |
| idea_id | INTEGER FK → research_ideas.id | |
| comment | TEXT | optional; moderating it (clearing/hiding) must not remove the vote |
| created_at | TEXT | |

_Vote + optional comment share one row. Clearing/hiding an inappropriate comment preserves the vote;
deleting the whole response is a separate explicit admin action._

**interest_keywords**

| column | type | notes |
|---|---|---|
| id | INTEGER PK | |
| keyword_raw | TEXT | exactly as submitted |
| keyword_normalized | TEXT | lowercased + trimmed + inner whitespace collapsed; used for aggregation/counting |
| status | TEXT | "pending" · "approved" · "hidden" |
| created_at | TEXT | |

**Keyword form (MVP).** Three simple fixed keyword input fields — not a dynamic add/remove component. The
first keyword is required; the second and third are optional. Each field has a clear character limit. The
form submits all non-empty values together in one request. This is easier to build, test, and explain.

**Normalization rule (MVP).** On submit, store the raw text and a normalized form (lowercase, trimmed,
repeated spaces collapsed). Entries that differ only by capitalization or extra spaces aggregate to the
same cloud item and count. No automatic semantic/synonym matching — the admin can manually edit a keyword
to standardise differently written entries that mean the same thing.

**Word-cloud sizing.** Prominence comes from the approved count of each `keyword_normalized`; higher count
→ larger/heavier text, mapped to a small fixed set of CSS size steps (no visualization library).

_Admin session state is not stored in the DB; it is a signed cookie. The admin password lives only in
`.env`._

---

## 6. Admin functions

- Password login on a protected route; wrong password is rejected; all `/admin` routes require a valid
  session.
- **Dashboard totals:** vote count, comment count, pending/approved/hidden keyword counts.
- **Keywords:** list with status; approve, hide, edit (standardise wording), delete. A keyword appears in
  the public cloud only after approval.
- **Votes & comments:** view the list per idea. A vote and its optional comment live in the **same
  `idea_votes` row**. The admin can **clear/hide the comment while keeping the vote** (blank out or hide
  the `comment` field; the vote still counts). Deleting the whole response — removing both the vote and its
  comment — is a separate, explicit action the admin must deliberately choose. Never remove a vote just to
  moderate a comment.
- **Research ideas:** edit title/description/keywords/status; toggle `is_public`.
- Every content change is reflected on the public page on next load (the public Research Ideas section is
  loaded from the database — see Data model and Stage 2 — so an admin edit appears after a refresh).

---

## 7. Development stages (build and test one stage at a time)

Each stage ends with a working, tested state before the next begins. No stage adds unrequested features.
Security and Git hygiene are set up **first**, and infrastructure preparation runs **in parallel** with
local development so DNS can propagate while features are built. Deployment happens **as soon as the
required core features work locally** — not at the very end.

- **Stage 0 — Planning (this step).** PLAN.md + DESIGN.md approved. _No code._

- **Stage 1 — Project setup & Git hygiene (before any commit).** Initialise the local project and create
  `.gitignore` **before the first Git commit**, excluding `node_modules/`, `.env`, and the SQLite database
  file (`data/*.db`) from the start. Add `.env.example` (placeholder values only) early. Create the
  **public GitHub repository** and make the first commit — verifying no secret, password, or database file
  is included. No password or secret ever goes into client-side JavaScript.

- **Stage 2 — Static shell.** `index.html` + `styles.css` with all seven sections and navigation, using
  drafted copy and the headshot in a flexible container. Verify laptop + mobile layout. No backend yet.

- **Stage 3 — Infrastructure preparation (in parallel — start as early as practical).** Register the
  cheapest suitable **domain**; open and **verify the VPS account**; rent the **basic VPS** and obtain its
  **IP address**; point the domain **A record to the VPS IP as early as practical** so DNS can propagate.
  Local feature development (Stages 4–7) continues while DNS propagates. This stage does not block coding.

- **Stage 4 — Server + database (backend begins).** Create the real local `.env` (admin password + session
  secret) when backend work starts — never committed. Express server serves the public page; `db.js`
  **creates the SQLite schema on first run** and **seeds the two or three research ideas only if the
  `research_ideas` table is empty**, starting with **empty visitor-response data** and **never overwriting
  existing data on later restarts**. The public **Research Ideas section is loaded from SQLite via the
  backend/API — its title, description, keywords, status, and visibility are NOT hard-coded in
  `index.html`** — so an admin edit appears on the public site after a refresh. The `admin/` directory is
  **not** exposed through public static-file hosting; admin pages and admin API routes require the
  protected admin session.

- **Stage 5 — Interaction 1 (voting/comments).** The single voting form in the Interactive Research Corner;
  card "Vote for this idea" buttons scroll to it and preselect the idea. API route records a vote + optional
  comment (one row); on-screen acknowledgement. Verify rows land in SQLite.

- **Stage 6 — Interaction 2 (keywords + cloud).** Three-field keyword form (first required, others
  optional, character limits); submissions stored as pending; public cloud renders only approved,
  normalized, count-weighted keywords with the disclaimer.

- **Stage 7 — Admin panel.** Password login on protected routes; dashboard totals; keyword moderation
  (approve/hide/edit/delete); comment clear/hide that preserves the vote; idea editing + visibility toggle.
  For the production session cookie, plan `httpOnly`, `sameSite`, and `secure` (once HTTPS is on). Verify
  an admin change appears on the public page. This completes the **required core features**.

- **Stage 8 — First live deployment (as soon as Stage 7 works locally).** On the already-prepared VPS:
  install Node, clone the repo, `npm install`, create the production `.env` **on the server only**, run the
  app as a background service behind **Nginx** as a reverse proxy, and add free **Let's Encrypt HTTPS**.
  The app initialises a **fresh production database** (schema on first run, seeded ideas, empty visitor
  data). Confirm the site opens over `https://` at the domain on laptop + mobile, and demo a live admin
  content change. Getting a basic but working live HTTPS version is the priority.

- **Stage 9 — Polish & optional features (only after a working live deployment).** Visual refinement and any
  optional features (voting-result CSS bars, optional visitor name/institution, CSV export, admin filtering,
  richer cloud styling) — added only if the required live site is stable, and skippable if time is short.

---

## 8. Testing checklist

Run after every major change; full pass before the Friday target.

Layout & responsiveness
- [ ] All seven sections render on laptop and on a phone-width screen.
- [ ] Navigation links jump to the correct sections.
- [ ] Headshot displays well and does not dominate the mobile screen.

Research Ideas (database-driven, from Stage 4 on)
- [ ] The public Research Ideas section loads from SQLite via the backend/API, not hard-coded HTML.
- [ ] Editing an idea in admin and refreshing the public page shows the change.
- [ ] Setting an idea to hidden (`is_public = 0`) removes it from the public page after refresh.

Interaction 1 — voting/comments
- [ ] There is exactly ONE voting form (in the Interactive Research Corner) — no forms inside idea cards.
- [ ] A card "Vote for this idea" button scrolls to that form and preselects the right idea.
- [ ] A vote is recorded and acknowledged on screen.
- [ ] An optional comment saves; an empty comment is allowed.
- [ ] Results are labelled as visitor feedback, not representative findings.

Interaction 2 — keywords/cloud
- [ ] The form has three fields: the first required, the second and third optional, each with a limit.
- [ ] All non-empty fields submit together; submitting with only the first field works.
- [ ] New submissions are marked pending and do NOT appear publicly.
- [ ] "Consumer Trust", "consumer trust", and " consumer  trust " aggregate as one item.
- [ ] Approved keywords appear in the cloud; more frequent ones are more prominent.
- [ ] The informal-snapshot disclaimer is visible.

Admin
- [ ] Correct password logs in; wrong password is rejected; `/admin` pages AND admin API routes are
      unreachable without a valid session (not exposed via public static hosting).
- [ ] Approve / hide / edit / delete keyword each work and reflect publicly.
- [ ] Clearing/hiding an inappropriate comment preserves the vote (the vote still counts).
- [ ] Deleting a whole response (vote + comment) only happens when explicitly chosen.
- [ ] Editing an idea and toggling visibility reflect on the public page.
- [ ] Totals are accurate.

Security / hygiene
- [ ] `.gitignore` exists before the first commit; `node_modules/`, `.env`, and the DB file are excluded.
- [ ] `.env.example` is present with placeholder values; the real `.env` is never committed.
- [ ] No password or secret appears in the repository or in client-side JavaScript.
- [ ] Basic length/validation limits on all inputs.
- [ ] Production session cookie uses `httpOnly`, `sameSite`, and `secure` (once HTTPS is on).

Production database initialization (Stage 8)
- [ ] On first run the production DB creates the schema and seeds the two or three research ideas.
- [ ] Production starts with empty visitor data (no local test votes/comments/keywords).
- [ ] Restarting the app does not overwrite or reset existing production data.

Deployment (Stage 8)
- [ ] Site opens over `https://` at the domain, on laptop and mobile.
- [ ] Admin login + a live content change demo works on the deployed site.

---

## 9. Deployment order (infrastructure prepared early, deployed as soon as core features work)

Infrastructure preparation runs **in parallel** with local development (Stage 3); the first deployment
happens as soon as the required core features work locally (after Stage 7) — not only at the very end.

Prepared early, in parallel (Stage 3):
1. Create the **public GitHub repo** (for the required repo link) — `.env`, `node_modules/`, and the DB
   file stay out via `.gitignore`.
2. Register the cheapest suitable **domain** (e.g. Dynadot or Porkbun).
3. Open and **verify the VPS account**; rent a **basic VPS** (Vultr / Alibaba Cloud Intl / Tencent Cloud
   Intl — Hong Kong or Singapore region); obtain the **VPS IP**.
4. Point the domain **A record to the VPS IP as early as practical** so DNS propagates while coding
   continues.

First deployment, as soon as core features work locally (Stage 8):
5. Install Node.js, clone the repo, `npm install`, create the production `.env` **on the server only**.
6. Run the app as a background service; put **Nginx** in front as a reverse proxy.
7. Add **HTTPS** with a free Let's Encrypt certificate.
8. The app **initialises a fresh production database**: creates the schema on first run, seeds the two or
   three research ideas if empty, starts with **empty visitor data**, and does not overwrite existing data
   on restart. Do a live test on laptop + mobile, including an admin content-change demo.

Visual polish and optional features come **after** this working live deployment (Stage 9).

---

## 10. Risks and fallback options

- **Tight timeline (site must be live for the deadline).** _Priority:_ a basic but working **live version
  over HTTPS** is the goal; optional visual improvements may be skipped if needed. Skip every optional
  feature until the required live site is stable. A local version is a useful troubleshooting backup but is
  **not** a compliant substitute for the required live domain + VPS + HTTPS deployment. Internal target
  Friday, July 17; official deadline Saturday, July 18 — infrastructure is prepared early (Stage 3) to
  protect this.
- **First-time VPS / DNS / HTTPS setup.** _Fallback:_ prepare infrastructure early and in parallel so DNS
  has time to propagate; work step by step. Keep the cheapest domain and most basic VPS plan. If a step
  stalls, resolve it — the deliverable remains a live HTTPS site, with a local copy only as a backstop for
  debugging, not as the final submission.
- **Node.js version mismatch (local vs VPS).** Because storage uses the built-in `node:sqlite` module, the
  main requirement is a recent Node. _Fallback:_ install **Node.js 24 LTS** on both the local machine and
  the VPS (same major version). There is no database driver to compile, so the earlier native-build issues
  do not arise; if `node:sqlite` is unavailable, it means Node is too old — upgrade Node rather than adding
  a package.
- **Accidentally committing secrets or the DB.** _Fallback:_ `.gitignore` is added before the first commit;
  `.env.example` documents the shape without real values. Verify with a dry-run before pushing.
- **Spam / junk submissions.** _Fallback:_ keywords are pending-by-default and only appear after admin
  approval; simple length limits and a cap of three keywords reduce abuse. No accounts needed.
- **Headshot may be replaced later.** _Fallback:_ a flexible, aspect-tolerant image container (see
  DESIGN.md) so a new portrait drops in without a layout redesign.
- **Scope creep toward a "research platform."** _Fallback:_ the out-of-scope list is fixed; disclaimers and
  framing keep it a personal academic site.
