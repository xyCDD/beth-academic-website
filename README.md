# Beth — Personal Academic Website

A personal academic website where Beth, an incoming PhD student in Marketing, shares developing
research ideas, visitors can signal their interest, and those open to further exchange can leave their
contact information. It introduces her current academic identity and research interests, presents two
or three developing research ideas, and offers two small interactions:

- **"I'm interested"** — visitors click a simple heart button on a research idea; each idea shows a
  visible count of how many visitors have expressed interest.
- **Stay in Touch** — visitors can leave their email (with a required consent checkbox) so Beth may
  reach out about research-related exchange.

A password-protected admin panel lets Beth view interest counts, manage the private contact emails,
and edit her research ideas, with changes appearing on the public site. There is no visitor free-text
content, and interest counts are framed only as informal visitor engagement — not a discussion
platform, research social network, representative survey, or formal research study.

## Technology stack

Kept deliberately simple and beginner-friendly:

- **Front end:** plain HTML, CSS, and vanilla JavaScript (no framework, no build step)
- **Back end:** Node.js with the Express web framework
- **Database:** SQLite, via Node.js 24's **built-in `node:sqlite` module** (`DatabaseSync`) — a single
  local file, with no third-party database driver to install or compile
- **Admin login:** a single password kept in an environment variable, with a lightweight signed cookie
  session (via `cookie-session`) — no server-side session store. The cookie holds only a minimal
  non-sensitive flag such as `{ isAdmin: true }`; the password and secret never go in the cookie.
- **Hosting (later):** a basic VPS behind Nginx, served over HTTPS (free Let's Encrypt certificate)
- **Node.js:** version 24 LTS — required for the built-in `node:sqlite` module, and the same major
  version must be used locally and on the VPS

## Current development status

**Stages 1–6 complete.** Project setup and Git hygiene (Stage 1); responsive static page shell
(Stage 2); the local Express server + SQLite database + database-driven Research Ideas (Stage 4); the
one-way "I'm interested" interaction (Stage 5); and the Stay in Touch email form saved privately to
SQLite (Stage 6).

The site runs through a local server (`server.js`) that serves the `public/` folder and three public API
routes: `GET /api/ideas` (list), `POST /api/ideas/:id/interest` (record one interest), and
`POST /api/contact` (save a Stay in Touch email). A `db.js` module uses Node.js 24's built-in
`node:sqlite` to create `data/site.db`, build the three tables on first run, and seed the three research
ideas only if the table is empty. The Research Ideas cards are rendered by `main.js` from the API.
Clicking a card's "I'm interested" heart records one row in `idea_interests` and shows a settled
"♥ Interested" state; the public count always comes from the database. Interest is **one-way** in the
MVP — no unlike, toggle, undo, or decrement — with a light `localStorage` guard
(`bethInterestedIdeaIds`) against repeat-clicking.

The **Stay in Touch** form now works: a valid email plus a ticked consent box is `POST`ed as JSON to
`/api/contact`, validated again on the server (trimmed, lowercased, format-checked, consent required),
and stored privately in `contact_requests` with `consent_given = 1` and `status = 'new'`. The email is
never shown publicly and there is **no public route to read contact requests** — those become visible
only in the admin panel, which is **not built yet**. All admin functionality (login, dashboard,
research-idea editing) remains unimplemented.

The real `.env` (with `PORT` and `NODE_ENV`) is created locally and git-ignored, and so is
`data/site.db`. Planned next stages (see `PLAN.md` for full detail): infrastructure preparation →
"I'm interested" submission → Stay in Touch email storage → admin panel → first live deployment →
polish.

## Project structure

```
beth-academic-website/
  package.json         # project info + dependency list
  .gitignore           # files Git must never track (secrets, database, node_modules)
  .env.example         # template for environment variables (safe, no real secrets)
  README.md            # this file
  PLAN.md              # full build plan
  DESIGN.md            # look-and-feel specification
  public/              # files served to visitors (web pages come in a later stage)
    assets/
      IMG_8056.jpeg    # headshot
  admin/               # protected admin pages (added in a later stage)
  data/                # SQLite database will live here later (git-ignored)
  docs/                # course materials
```

## Local setup (for later stages, once the server exists)

These steps are **not needed yet** because the server has not been built. They are recorded here so
they are ready when Stage 4 adds the back end:

1. Install [Node.js](https://nodejs.org/) — **version 24 LTS** (required for the built-in `node:sqlite`
   module; use the same major version locally and on the VPS).
2. In the project folder, install dependencies (this creates `package-lock.json` and `node_modules/`):
   ```
   npm install
   ```
3. Create your real environment file by copying the template, then fill in real values:
   ```
   cp .env.example .env
   ```
4. Start the site locally:
   ```
   npm start
   ```
   (or `npm run dev` to auto-restart while editing)
5. Open the address shown in the terminal (for example, http://localhost:3000).

## Important

Never commit the real `.env` file or the SQLite database — both are already listed in `.gitignore`.
