# Redesign — September 2026

The home page was rebuilt from a Claude Design handoff (`design/handoff/`, gitignored). This
records what the visual system now is, and — more usefully — where the implementation departs
from the artboards and why.

## What changed from the first build

| | Before | Now |
|---|---|---|
| Palette | `brand-blue` / `brand-teal` / `brand-crimson` on `surface` | `ink` / `paper` / `soft` / `accent`, plus three per-product accents |
| Type | Jost, single family | Newsreader (display) + Work Sans (text) |
| Imagery | none, by policy — `ArcMotif` geometry | two photographs and six cut-out product renders |
| Home | hero, about, products, science | hero, products grid, "Zašto Nordogen" + four principles, contact band |
| Nav | `/products`, `/about`, `/contact` (all 404) | on-page anchors |
| Products | not modelled | `products` collection, per locale, six entries |

The old palette is gone, not deprecated. `ArcMotif.tsx` is unused.

## Source of truth

`design/handoff/artboards/*.dc.html` — every px, hex, font-size and gap is a literal inline
style on the element. Read those, not the PNG exports. `design/handoff/CLAUDE_CODE.md` carries
the parts an artboard cannot: hover/active/focus states, which groups repeat and which are
fixed, and which fields are allowed to be empty.

## Deliberate departures from the handoff

**Client copy over artboard copy.** Where `design/copy/index.html` (the client's own bilingual
draft site) has a slot that clearly matches, its wording wins. See CLAUDE.md § Copy rules,
including the GMP claim that was dropped and the singular/plural disclaimer bug.

**The h1 caps at 52px, not 72px.** The artboards' headline is five words; the client's is
twelve. At 72px it runs five lines and blows through the hero. The hero is also `min-height`
rather than a fixed 600/460px, so longer copy — or a longer language — grows the band instead
of overflowing the image. Shorten the headline in Keystatic and the design's proportions come
back on their own.

**`#6B7A78` → `#647371`** for the inactive language label. The handoff says its values were
measured; this one comes out at 4.37:1 on `paper`, under the 4.5 floor at 13px.

**Nothing links to a route that does not exist.** The artboards' `href="#"` placeholders became
real on-page anchors, a `mailto:`, and plain text. Product cards are `<article>`, so the
handoff's `Detaljnije →` hover affordance is not implemented — it belongs with the product
pages. (It is also absent from the artboard markup itself.)

**No language switch inside the mobile drawer.** The handoff asks for both a switch pinned last
in the drawer and a switch visible in the header at all widths. The header one is always there,
so the drawer copy would be a duplicate control.

**The drawer is a disclosure, not a dialog.** It opens under the header with the page visible
behind it, so it carries `aria-expanded` / `aria-controls` rather than `aria-modal`, and there
is no focus trap. Escape closes it and returns focus to the trigger; body scroll locks.

**Product renders are alpha cutouts, not the handoff's opaque files.** The originals sit on a
light grey backdrop, and the artboards hid that with `mix-blend-mode: multiply` — which leaves
the rectangle visible and darkens the packaging. The client supplied background-removed versions
(kept in `design/handoff/assets/cutouts/`), so the blend mode is gone.

**The logo is the brand lockup, not the artboards' circle-plus-Newsreader placeholder** — and
its descriptive tagline (`UROLOGIJA • GINEKOLOGIJA • REGENERACIJA`) is gone. At lockup size it
read as stray lettering rather than as part of the mark.

## Verification that actually ran

`next start`, then Chrome over CDP at 375 / 768 / 1440, both locales:

- horizontal overflow `0` at every width, with the offending elements enumerated when non-zero
- `header` / `footer` / `main`, six cards, four principles, three section ids present in the DOM
- fonts resolved to Work Sans and Newsreader, `body` background `rgb(252, 252, 250)`
- every unique text/background pair composited **on a canvas** and measured — 29–30 pairs per
  page, zero failures. Compositing matters: `text-white/85` computes to `oklab(… / .85)`, and
  parsing that string as if it were `rgb()` reports a fake 1.25:1 failure.
- tap targets ≥ 44px (the skip link is the only exception, and it is `sr-only` until focused)
- the drawer: opens under the header at full viewport width, 56px rows, scroll locked, closes

Screenshots confirmed pixels afterwards — that is how the zero-height logo was caught, since it
passed every DOM assertion above.

## Still open

- `check:content --strict` — still unwritten, and still the thing standing between this and a
  live site. The client cleared every `[REVIEW]` marker on 2026-09-08, so the page currently has
  none; the check is what stops the next batch of authored copy shipping unreviewed.
- "HPV i zdravlje epitela" was cleared with the rest, but it is the one badge that reads close
  to an indication claim and has no support in `docs/product-declarations.md`. Worth raising
  once more before launch.
- product pages, and with them `pack`, `purpose` and Urinord's `regulatoryNote`, which are
  modelled and populated but not rendered anywhere yet
