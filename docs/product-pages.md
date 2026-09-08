# Product pages — September 2026

One template, six products, two locales: `/[locale]/products/[slug]`, all twelve prerendered.
Built from `design/handoff-product/` (gitignored), which draws Nordoprost only and is written
as the template for the other five.

## Where the content came from

`design/copy/<slug>.html` — the client's own bilingual product pages. Every section on the page
is client copy in both languages: the hero subtitle and intro, all section eyebrows and
headings, the benefit cards, the ingredient roles and amounts, the use cases and the warnings.
Nothing here is authored by us, which is why no `[REVIEW]` marker appears on a product page.

The two exceptions, both regulatory, come from `docs/product-declarations.md` instead:

- **`notes.legalNote`** — the artboard renders the mandated statement in the *singular*
  ("Dodatak ishrani nije zamena…"), as the home artboard did. The declarations' plural wording
  is used, plus "Čuvati van domašaja male dece." Urinord gets the food-for-special-medical-
  purposes wording instead: medical supervision, nutritionally incomplete, keep away from
  children.
- **`hero.dose` / `hero.doseNote`** — see below.

## Content model

The Keystatic file mirrors the page, in `fields.object` blocks: `hero`, `audience`, `benefits`,
`formula`, `ingredients`, `useCases`, `notes`. Three of those are arrays whose length is free
(`benefits.items` 2–4, `ingredients.items`, `useCases.items`); `benefits` and `useCases` are
whole sections that vanish when their array is empty, taking their soft band and their on-page
nav entry with them.

`ingredients.items` is the single source for the pills on the home card, the pills in the
product hero, and the ingredient cards. That was the point of replacing the old flat
`ingredients` string: the home card and the product page can no longer disagree about what is
in the box.

**`accent` became `family`.** The old field asked the editor to pick a badge colour. It now
asks for the therapeutic area — urology, gynaecology, regeneration — and the colour follows.
The mapping was already one-to-one, and the semantic version also drives "from the same range".

## Deliberate departures from the handoff

**`hero.doseNote`.** The handoff drops the copy's standalone dosing section and keeps only the
spec row's figure. That figure cannot carry "Ne uzimati na prazan želudac", "Sadržaj kesice
rastvoriti u 200 ml vode" or "mora da se koristi pod medicinskim nadzorom" — instructions from
the approved declarations. The dose sentence is therefore split: the figure goes in the spec
cell, the instruction in a 15px muted line under the row. Splitting it is the only place a
client sentence was reworded, and it was reworded only at the seam.

**"From the same range" is picked by `family`, with regeneration in every group.** The handoff
says to query siblings by `group`. Every product's `group` is unique here (it *is* the badge
label), so that query returns nothing and the section would never render.

The rule instead: a product's neighbours are its own therapeutic area **plus regeneration**,
same area first, capped at three. Recovery support is a companion to a urology or a gynaecology
product rather than a category of its own, so Renord belongs in both of their groups; on
Renord's own page every product is a sibling. Urology and gynaecology never appear beside each
other.

| Page | Shows |
|---|---|
| Myonord, Nordilloma (gynaecology) | the other one, plus Renord — two cards |
| Litonord, Nordoprost, Urinord (urology) | the other two, plus Renord |
| Renord (regeneration) | the first three of the rest |

Nordoprost's row is Litonord, Urinord, Renord — the artboard's own three cards, exactly. The
two-card row switches to a two-column grid rather than leaving a hole in a three-column one.

**No products index, so the breadcrumb's middle crumb points at the home page's product grid.**
A crumb to a 404 is worse than a crumb to the grid it came from.

**No active state on the header's nav.** The artboard underlines "Proizvodi" on a product page.
The header lives in the root layout, which has no access to the pathname, and turning the whole
site's nav into a client component for one underline is a bad trade. The breadcrumb already
says where you are.

**The on-page nav is a disclosure of position, not a scroller.** Scrolling is a plain anchor
plus `scroll-behavior: smooth`, which the global reduced-motion block turns back into a jump.
The client component exists only to highlight the section in view.

**It sticks on desktop only.** Five stacked 44px rows pinned under the header would eat a third
of a 375px viewport, so on mobile the bar scrolls away with the page — which is also why
`--toc-height` is `0` there and mobile anchors offset for the header alone.

## The two CSS variables

`--header-height` (73px / 85px) and `--toc-height` (0 / 63px) in `globals.css` position the
sticky header, the sticky on-page nav beneath it, and every anchor's `scroll-margin-top`. They
are measured values, not guesses, and they are not checked by anything: get them wrong and
anchors land behind the sticky bars. Both were verified against
`getBoundingClientRect().height` — header 73/85 exactly, nav 63.

## Verification that ran

`next start` plus Chrome over CDP, at 375 / 768 / 1440, `sr` and `en`, on Nordoprost (four
ingredients, has a duration), Myonord (three ingredients, no duration) and Urinord (food for
special medical purposes):

- horizontal overflow `0` everywhere
- **zero contrast failures**, compositing each colour over its real background on a canvas
- the on-page nav highlights the correct section for all five anchors, at both widths, and
  scrolled sections land at `header + nav + 8px` — 154px desktop, 81px mobile
- tap targets ≥ 44px except the desktop on-page nav rows (29px, 32px apart — the artboards'
  own spacing, covered by WCAG 2.5.8's spacing exception) and the `sr-only` skip link
- Keystatic renders the nested objects and all three arrays for a product

## Still open

- a products index at `/[locale]/products`, which would give the breadcrumb a real middle crumb
- `check:content --strict`; the pages carry no `[REVIEW]` markers today, but nothing enforces
  that
- `sitemap.ts` — twelve new URLs now exist and none of them are listed anywhere
