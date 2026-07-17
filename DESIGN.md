# DESIGN.md — Beth Personal Academic Website

_Planning document only. No website code has been written. This defines how the site should look and feel
so the build stays consistent. For review and approval._

Last updated: 2026-07-16 (simplified scope)

---

## 1. Visual theme

Academic but approachable; clean, calm, and contemporary; professional without feeling corporate. The
design should feel considered and quiet — generous whitespace, clear hierarchy, and readable text — so a
visitor with no research background understands everything at a glance. Research interests and the
developing research ideas are the visual priority; Beth's education and career background stay compact
inside the About section.

Guiding words: calm, clear, credible, welcoming.

---

## 2. Colour palette

A restrained, high-legibility palette: a soft near-white canvas, deep ink text, one calm accent, and a
warm secondary for highlights. (Hex values are a proposed starting point and can be adjusted on approval.)

| Role | Colour | Hex | Where used |
|---|---|---|---|
| Canvas / background | Soft off-white | `#FAFAF7` | Page background |
| Surface / card | White | `#FFFFFF` | Cards, form fields, admin panels |
| Primary text (ink) | Deep slate | `#1F2933` | Headings and body copy |
| Secondary text | Muted grey | `#5B6470` | Captions, meta, notes |
| Accent (primary) | Calm teal-blue | `#2C6E7F` | Buttons, links, active nav, focus rings |
| Accent hover | Darker teal-blue | `#22525E` | Button/link hover + active |
| Warm highlight | Soft clay | `#C9836B` | Restrained accent only — see accessibility note |
| Interest heart | Warm rose | `#C1465E` | The filled "Interested" heart |
| Border / divider | Light grey | `#E4E6E1` | Card borders, section dividers |
| Success / info soft | Pale mint | `#E7F1EE` | Form acknowledgements |

**Clay accessibility note.** `#C9836B` must **not** be used as a fill behind small white text — the
contrast is insufficient. Use it only as a restrained highlight, a border, a **pale tint** background, or
paired with sufficiently **dark text (deep slate `#1F2933`)**. Status pills use a pale clay tint with
deep-slate text so they stay readable.

Contrast: primary text on canvas and accent-on-white for buttons both target WCAG AA (≥ 4.5:1 for body
text). Colour is never the only signal — the interest button also changes its label/icon, and status also
uses text labels.

---

## 3. Typography

- **Font family:** a clean, widely-available sans-serif stack, no paid or heavy web-font dependency —
  e.g. `system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. Optionally one calm serif (e.g.
  Georgia) for the hero name only, if it reads well. Prefer system fonts for speed and reliability.
- **Hierarchy (fluid, scales down on mobile):**
  - Hero name: ~2.5–3rem, semibold.
  - Section headings (h2): ~1.6–1.9rem, semibold.
  - Sub-headings (h3, card titles): ~1.15–1.3rem, medium.
  - Body: ~1rem–1.05rem, regular, line-height ~1.6.
  - Meta / notes: ~0.85–0.9rem, secondary grey.
- **Rules:** one weight jump between levels; generous line-height for body; measure capped around 65–75
  characters; no all-caps blocks except small labels.

---

## 4. Layout and spacing

- Single centred column, max content width ~ 960–1080px, comfortable side padding.
- **Spacing scale (rem):** 0.25 · 0.5 · 0.75 · 1 · 1.5 · 2 · 3 · 4. Used consistently for padding, gaps,
  and section rhythm.
- Generous vertical space between sections (~3–4rem desktop, ~2–2.5rem mobile) so the page breathes.
- Clear visual hierarchy: each section has a heading, optional one-line intro, then content.
- About stays compact and never taller or heavier than the research sections.

---

## 5. Navigation

- Sticky slim top bar: Beth's name/initials on the left; section links on the right (About, Interests,
  Ideas, Stay in Touch).
- Links scroll to sections; the active section link is shown in the accent colour.
- **Mobile:** collapses to a simple menu (a hamburger toggle revealing a vertical list, or a compact
  wrapped row). Tap targets ≥ 44px. No mega-menus, no animation-heavy transitions.
- Admin routes are **not** shown in the public navigation.

---

## 6. Cards

Used for research ideas, interest tags/areas, and admin list rows.

- White surface, ~12px radius, 1px light border, soft subtle shadow (no heavy drop shadows).
- Comfortable internal padding (~1.25–1.5rem); consistent gap in the grid.
- **Research idea card:** title (h3) · short description · keyword chips · a status pill (pale clay tint
  with deep-slate text) · the **"I'm interested" heart button** and the **interest count** line.
- **Responsive:** multi-column grid on desktop that collapses to a single column on mobile; cards never
  overflow horizontally.

---

## 7. "I'm interested" heart button and count

- Default state: an outline heart with a label, e.g. **"♡ I'm interested"** in the accent colour.
- After clicking: a filled heart in warm rose (`#C1465E`) with **"♥ Interested"**; the button becomes a
  clear, settled "done" state (not disabled-looking, but visibly chosen).
- Count line below or beside it, e.g. **"12 people are interested"** in secondary grey; **"Be the first to
  show interest"** when the count is zero, and a singular form ("1 person is interested") when it is one.
- The state persists per browser (via `localStorage`) so a returning visitor still sees the filled heart.
- Colour is never the only signal — the icon (outline → filled) and the label ("I'm interested" →
  "Interested") both change.
- A short, quiet note near the ideas section frames the counts as informal engagement: e.g. _"These counts
  reflect casual interest from visitors to this site — an informal signal, not research data."_
- Keep motion minimal: at most a small, gentle state change on click; respect reduced-motion preferences.

---

## 8. Forms (Stay in Touch)

Keep the form simple and short.

- Labels above fields; a large, legible email input with a clear border and a visible accent focus ring.
- A **required consent checkbox** with readable label text beside it; the submit button stays disabled (or
  clearly blocks with an inline message) until the box is checked.
- Suggested prompt above the form: _"Interested in discussing one of these ideas in the future? Leave your
  email, and Beth may get in touch."_
- Inline, friendly validation (e.g. "Please enter a valid email address", "Please tick the box to
  continue") — never blocking browser dialogs.
- On success, an inline acknowledgement (e.g. "Thanks — your email has been saved") on a pale-mint
  background. The email is never echoed publicly.
- Full-width field on mobile; comfortable spacing.

There is **no** comment field, no keyword field, and no word cloud anywhere on the site.

---

## 9. Buttons

- **Primary:** accent fill, white text, ~8px radius, medium weight; hover → darker accent; visible focus
  outline.
- **Secondary:** white fill, accent text + border; same sizing.
- **Interest button:** see section 7 (outline → filled-rose state).
- Minimum height ~44px; readable label text; never rely on colour alone.
- Sparing use — one clear primary action per context.

---

## 10. Headshot presentation

The portrait is `IMG_8056.jpeg`, currently 2400×3600 (portrait, 2:3). It may be replaced later, so the
container must be flexible and aspect-tolerant.

- Use a **fixed-shape container** (a rounded rectangle or soft-cornered frame) sized by CSS, with the image
  set to `object-fit: cover` and a defined `object-position` (roughly upper-centre) so any replacement
  portrait fills the frame gracefully regardless of its exact crop or aspect ratio.
- The layout must **not** depend on the image's native proportions; swapping in a slightly different photo
  should require no layout redesign.
- **Desktop hero:** headshot beside the text (e.g. text left, portrait right), moderate size — a supporting
  element, not the dominant one.
- **Mobile hero:** portrait above or below the text at a constrained size (e.g. capped max-height / a
  modest circle or rounded square) so it does **not** dominate the screen; text remains the priority.
- Provide meaningful **alt text** (e.g. "Portrait of Beth, incoming PhD student in Marketing").
- No permanent or destructive cropping of the source image; framing is done purely with CSS.
- Keep the visual treatment natural and professional (subtle frame/shadow at most; no heavy filters).

---

## 11. Admin interface

- Same palette and type as the public site, but plainer and denser — a utility dashboard, not a marketing
  page.
- **Login:** minimal centred card with a single password field and a submit button; clear error on failure.
- **Interest overview:** a simple list of research ideas with their total interest counts.
- **Contact requests:** a readable list/table of emails with their status (`new` / `contacted` /
  `archived`) and date, with clear actions — **Mark contacted · Archive · Delete**; Delete is styled
  distinctly and confirmed inline (no blocking browser dialogs).
- **Idea editing:** simple forms to edit title, short description, keywords, and status, plus a visibility
  toggle (`is_public`).
- Readable tables that reflow acceptably on smaller screens; function over decoration.
- No comment moderation, keyword moderation, word-cloud management, or charts.

---

## 12. Laptop and mobile responsive behaviour

- Mobile-friendly by default; a small number of breakpoints (roughly ~640px and ~960px).
- The ideas grid collapses to one column on mobile; the hero switches from side-by-side to stacked.
- Tap targets ≥ 44px; no horizontal scrolling; images and cards never overflow.
- Equal usability on laptop and phone — neither is an afterthought.
- Test at common widths (~375px phone, ~768px tablet, ~1280px laptop).

---

## 13. Accessibility rules

- Body-text contrast meets WCAG AA (≥ 4.5:1); large text ≥ 3:1.
- Every image has meaningful alt text; the headshot alt describes Beth.
- Visible keyboard focus indicators on all links, buttons, and inputs; logical tab order.
- The interest button is a real `<button>`, keyboard-operable, with an accessible label that reflects its
  state ("I'm interested" / "Interested"); state is not conveyed by colour alone.
- The email field has an associated `<label>`; the consent checkbox is labelled; errors are conveyed in
  text, not colour alone.
- Semantic HTML landmarks (header, nav, main, section, footer) and a sensible heading order.
- Respect reduced-motion preferences; avoid motion that could distract or harm readability.

---

## 14. Design patterns to avoid

- Excessive or attention-seeking animation; auto-playing motion; parallax.
- Heavy drop shadows, gradients, or a "corporate SaaS" look.
- Dense walls of text; long CV-style employer/client lists; autobiography tone.
- Low-contrast grey-on-grey text; colour as the only status or state signal.
- Tiny tap targets or cramped mobile spacing.
- Any framework, heavy web fonts, or a visualization/chart library.
- Blocking browser dialogs (`alert`/`confirm`) for validation or confirmation.
- Letting the headshot or the About section visually outweigh the research content.
- Any visitor free-text input, comment field, or word cloud (removed from scope).
