# Beth — Personal Academic Website

A personal academic website for Beth, an incoming PhD student in Marketing. It introduces her
current academic identity and research interests, presents two or three early-stage research ideas,
and invites visitors to respond through two small interactions:

- **Research-idea voting** — visitors vote on the idea they would most like to see developed and can
  leave an optional comment.
- **Research-interest word cloud** — visitors submit a few research keywords which, after Beth
  approves them, appear in a public word cloud.

A password-protected admin panel lets Beth moderate submissions and edit her research ideas, with
changes appearing on the public site. Visitor input is always presented as an informal community
snapshot — not a representative survey or a formal research study.

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

**Stage 1 complete — project setup and Git hygiene.**

Created so far: the project folder structure, `package.json` (with the dependency list), `.gitignore`,
`.env.example`, this README, and the headshot placed in `public/assets/`. Dependencies are installed
with `npm install`, which also generates `package-lock.json` (committed) and `node_modules/`
(git-ignored). There is **no server, database, or web page yet** — those arrive in later stages. The
real `.env` file and the SQLite database are intentionally **not** created yet.

Planned next stages (see `PLAN.md` for full detail): static page shell → infrastructure preparation
→ server + database → voting → keyword cloud → admin panel → first live deployment → polish.

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
