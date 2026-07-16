# DESIGN.md — Beth Personal Academic Website

_Planning document only. No website code has been written. This defines how the site should look and feel
so the build stays consistent. For review and approval._

Last updated: 2026-07-16

---

## 1. Visual theme

Academic but approachable; clean, calm, and contemporary; professional without feeling corporate. The
design should feel considered and quiet — generous whitespace, clear hierarchy, and readable text — so a
visitor with no research background understands everything at a glance. Research interests, research ideas,
and the interactive corner are the visual priority; education and the industry-to-research story stay
compact and secondary.

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
| Secondary text | Muted grey | `#5B6470` | Captions, meta, disclaimers |
| Accent (primary) | Calm teal-blue | `#2C6E7F` | Buttons, links, active nav, focus rings |
| Accent hover | Darker teal-blue | `#22525E` | Button/link hover + active |
| Warm highlight | Soft clay | `#C9836B` | Restrained accent only — see accessibility note below |
| Border / divider | Light grey | `#E4E6E1` | Card borders, section dividers |
| Success / info soft | Pale mint | `#E7F1EE` | "Submitted / pending" acknowledgements |

**Clay accessibility note.** `#C9836B` must **not** be used as a fill behind small white text — the
contrast is insufficient. Use it only as a restrained highlight, a border, a **pale tint** background, or
paired with sufficiently **dark text (deep slate `#1F2933`)**. Status pills use a pale clay tint with
deep-slate text so they stay readable.

Contrast: primary text on canvas and accent-on-white for buttons both target WCAG AA (≥ 4.5:1 for body
text). Colour is never the only signal — status also uses text labels.

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
  - Meta / disclaimer: ~0.85–0.9rem, secondary grey.
- **Rules:** one weight jump between levels; generous line-height for body; measure (line length) capped
  around 65–75 characters for readability; no all-caps blocks except small labels.

---

## 4. Layout and spacing

- Single centred column, max content width ~ 960–1080px, comfortable side padding.
- **Spacing scale (rem):** 0.25 · 0.5 · 0.75 · 1 · 1.5 · 2 · 3 · 4. Use consistently for padding, gaps,
  and section rhythm.
- Generous vertical space between sections (~3–4rem desktop, ~2–2.5rem mobile) so the page breathes.
- Clear visual hierarchy: each section has a heading, optional one-line intro, then content.
- Background story and education stay compact (short items / small timeline) and never taller or heavier
  than the research sections.

---

## 5. Navigation

- Sticky slim top bar: Beth's name/initials on the left; section links on the right (About, Interests,
  Ideas, Corner, Contact).
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
  with deep-slate text — see palette accessibility note) · a single **"Vote for this idea"** button that
  scrolls to the one voting form in the Interactive Research Corner and preselects this idea. The card does
  **not** contain its own voting or comment form — those live once, in the Interactive Research Corner.
- **Responsive:** multi-column grid on desktop that collapses to a single column on mobile; cards never
  overflow horizontally.

---

## 7. Forms

Keep every form simple and short.

- Labels above fields; large, legible inputs with clear borders; visible focus ring in the accent colour.
- **Keyword form:** exactly **three simple fixed input fields** (not a dynamic add/remove component). The
  first is required; the second and third are optional. Each has a clear character limit. All non-empty
  fields submit together, with an inline acknowledgement ("Thanks — your keywords are pending review") on a
  pale-mint background.
- **Voting form (single instance, in the Interactive Research Corner):** the visitor selects one idea (the
  card buttons preselect it), with a single optional comment textarea and one submit button — empty comment
  allowed. There is only one voting/comment form on the whole page; it is never duplicated inside idea
  cards.
- Inline, friendly validation messages (e.g. "Please keep it under N characters"); never block with modal
  dialogs.
- Sufficient spacing between fields; full-width fields on mobile.

---

## 8. Buttons

- **Primary:** accent fill, white text, ~8px radius, medium weight; hover → darker accent; visible focus
  outline.
- **Secondary:** white fill, accent text + border; same sizing.
- Minimum height ~44px; readable label text; never rely on colour alone (labels are explicit).
- Sparing use — one clear primary action per context (e.g. "Vote", "Submit keywords").

---

## 9. Headshot presentation

The portrait is `IMG_8056.jpeg`, currently 2400×3600 (portrait, 2:3). It may be replaced later, so the
container must be flexible and aspect-tolerant.

- Use a **fixed-shape container** (a rounded rectangle or soft-cornered frame) sized by CSS, with the image
  set to `object-fit: cover` and a defined `object-position` (roughly upper-centre) so any replacement
  portrait fills the frame gracefully regardless of its exact crop or aspect ratio.
- The layout must **not** depend on the image's native proportions; swapping in a slightly different photo
  should require no layout redesign.
- **Desktop hero:** headshot beside the text (e.g. text left, portrait right), moderate size — a supporting
  element, not the dominant one.
- **Mobile hero:** portrait sits above or below the text at a constrained size (e.g. capped max-height /
  a modest circle or rounded square) so it does **not** dominate the screen; text remains the priority.
- Provide meaningful **alt text** (e.g. "Portrait of Beth, incoming PhD student in Marketing").
- No permanent or destructive cropping of the source image; framing is done purely with CSS.
- Keep the visual treatment natural and professional (subtle frame/shadow at most; no heavy filters).

---

## 10. Word cloud presentation

- A responsive, CSS-only cloud (flex-wrapped inline keyword chips/text) — no visualization library for the
  MVP.
- Prominence by approved frequency: map each keyword's count to a small set of fixed size/weight steps
  (e.g. 4–5 steps) so more frequent topics read larger/heavier; keep the largest sizes restrained so the
  cloud stays legible and calm.
- Only **approved** keywords appear; pending/hidden never show publicly.
- Accessible: real text (not an image), sufficient contrast at every size, wraps cleanly on mobile.
- A visible disclaimer beneath the cloud: _"This cloud reflects topics voluntarily shared by visitors to
  this website. It is an informal community snapshot, not a representative survey."_
- Similar treatment for voting results: describe as visitor feedback; if a simple results bar is shown
  later, use plain CSS bars, not a chart library.

---

## 11. Admin interface

- Same palette and type as the public site, but plainer and denser — a utility dashboard, not a marketing
  page.
- **Login:** minimal centred card with a single password field and a submit button; clear error on failure.
- **Dashboard:** a compact totals row (votes, comments, pending/approved/hidden keywords), then simple
  tables/lists.
- **Keyword moderation:** each row shows the keyword + status with clear action buttons (Approve · Hide ·
  Edit · Delete); destructive actions (Delete) styled distinctly and confirmed inline (no blocking browser
  dialogs).
- **Idea editing:** simple forms to edit title/description/keywords/status and a visibility toggle.
- Readable tables that reflow acceptably on smaller screens; function over decoration.

---

## 12. Laptop and mobile responsive behaviour

- Mobile-friendly by default; a small number of breakpoints (roughly ~640px and ~960px).
- Multi-column grids (ideas, interests) collapse to one column on mobile; hero switches from side-by-side
  to stacked.
- Tap targets ≥ 44px; no horizontal scrolling; images and cards never overflow.
- Equal usability on laptop and phone — neither is an afterthought.
- Test at common widths (~375px phone, ~768px tablet, ~1280px laptop).

---

## 13. Accessibility rules

- Body-text contrast meets WCAG AA (≥ 4.5:1); large text ≥ 3:1.
- Every image has meaningful alt text; the headshot alt describes Beth.
- Visible keyboard focus indicators on all links, buttons, and inputs; logical tab order.
- Form fields have associated `<label>`s; errors are conveyed in text, not colour alone.
- Semantic HTML landmarks (header, nav, main, section, footer) and a sensible heading order.
- Word cloud and results use real text, not images, so they remain readable and selectable.
- Respect reduced-motion preferences; avoid motion that could distract or harm readability.

---

## 14. Design patterns to avoid

- Excessive or attention-seeking animation; auto-playing motion; parallax.
- Heavy drop shadows, gradients, or a "corporate SaaS" look.
- Dense walls of text; long CV-style employer/client lists; autobiography tone.
- Low-contrast grey-on-grey text; colour as the only status signal.
- Tiny tap targets or cramped mobile spacing.
- Any framework, heavy web fonts, or a visualization library for the MVP.
- Blocking browser dialogs (`alert`/`confirm`) for validation or confirmation.
- Letting the headshot or the background/journey section visually outweigh the research content.
