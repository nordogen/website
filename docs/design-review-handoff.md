# Design review handoff — foundation

Date: 2026-07-28
Branch: `feat/foundation` (23 commits + review fixes)
Plan: `docs/superpowers/plans/2026-07-28-nordogen-foundation.md`
Spec: `docs/superpowers/specs/2026-07-28-nordogen-site-design.md`

## What is built

Home page in both locales, with the header, footer, brand tokens, logo and content
backbone behind it.

- `/sr` and `/en`, both prerendered as static HTML with correct `lang`, canonical and
  `hreflang` (`sr`, `en`, `x-default` → `sr`). `/` → 301 `/sr`.
- Keystatic CMS at `/keystatic` — every string on the site is editable there, including
  navigation labels and button text. No JSON editing.
- Brand palette from the logobook, Jost substituted for the unlicensed Cera Pro, logo
  extracted from the vector PDF into one recolourable SVG.
- Mobile-first throughout, verified at 375 / 768 / 1440 with zero horizontal overflow.

## How to look at it

```bash
npm install
npm run dev          # http://localhost:3000/sr — CMS at /keystatic
npm run build        # route table should show ● /[locale] with /sr and /en
npx vitest run       # 11 tests
```

## Decisions to make at the review

### 1. The logo tagline in the header

`UROLOGIJA • GINEKOLOGIJA • REGENERACIJA` renders at 8px under the wordmark. Three
problems, all one decision:

- At 375px it wraps to two lines, leaving `REGENERACIJA` hanging under the rest.
- 8px is below every readability floor the spec sets (16px prose, 12px labels).
- It inherits `brand-blue`, which measures ~2.68:1 against the page background — a real
  WCAG AA failure on visible text, not covered by the logotype exemption.

The same string already appears at 12px as the hero eyebrow two lines below, so dropping
it from the header loses nothing. Options: hide it below `sm`, drop it from the header
entirely, or keep it at ≥10px in `brand-teal` with tighter tracking.

### 2. Repetition in the first viewport

The tagline string appears three times above the fold — header logo, hero eyebrow, footer
logo — and `heroEyebrow` is byte-identical to `logoTagline` in both locales. Worth giving
the hero its own eyebrow.

### 3. Hero height

`min-h-[70svh]` with top-aligned content leaves visible dead space below the CTAs on tall
screens. Either drop the minimum and let padding set the height, or centre the content.

### 4. Footer columns

"PROIZVODI" is a heading whose only link repeats the same word, and "KOMPANIJA" duplicates
the header navigation verbatim. Fine once product pages exist; thin today.

## Copy needing your lawyer

All authored marketing copy carries a trailing ` [REVIEW]` marker and is visible in the
page — that is deliberate for this stage. The regulatory statement
*"Dodaci ishrani nisu zamena za raznovrsnu i uravnoteženu ishranu i zdrav način života."*
is verbatim from the approved declarations, carries no marker, and renders in the footer in
both locales.

Specific claims flagged for legal review:

1. `aboutBody` — *"sastojaka sa jasnom fiziološkom svrhom"* / *"ingredients with a clear
   physiological purpose"*. Asserting a physiological purpose is a health/function claim;
   under Reg. 1924/2006 such claims must map to specific authorised wording rather than a
   generic assertion.
2. `aboutBody` — *"grupu kojoj je namenjen"* / *"a defined population"*, combined with the
   urology / gynaecology / regeneration framing that also appears in `heroEyebrow`,
   `footerTagline` and `logoTagline`. This risks reading as targeting a clinical population
   for a condition. The category-as-therapeutic-area framing itself needs sign-off, not
   just the marked sentences.
3. `metaTitle` carries the same therapeutic-area positioning as `metaDescription` but is
   unmarked. Add it to the same review.
4. `productsBody` uses the FSMP category name correctly. Low risk, noted for completeness.

No disease, cure or treatment verbs appear anywhere in the authored copy.

Note **Urinord is not a supplement** — it is *hrana za posebne medicinske namene* (food for
special medical purposes) and its declaration requires use under medical supervision. The
content model has a `category` field and a mandatory `regulatoryNote` for this; it matters
when product pages are built.

## Known issues, deliberately deferred

Each was reviewed and parked with a ruling rather than fixed.

| Item | Why deferred |
| --- | --- |
| Tagline contrast / size / wrapping | Bundled into decision 1 above |
| `"lint": "eslint ."` with no eslint installed | Script fails if run; nothing runs it. Consider deleting the line until eslint lands |
| A Cyrillic `woff2` subset ships | Not preloaded, so browsers never fetch it. ~10KB of dead build output |
| Content read 5× per page render, no `cache()` | Build-time only under static prerendering |
| `Button` primary hover uses `opacity-90` but base has only `transition-colors`, so it snaps | Cosmetic |
| `Eyebrow`'s `TONE` key is still named `blue` but renders teal | Naming drift; rename next plan |
| Mobile panel `aria-label` reuses the trigger's "open menu" label | Needs a new CMS field to name it properly |
| Mobile panel has no `overflow-y-auto` | Fits today; will not once nav grows |
| `LanguageSwitcher` does not preserve the path | Correct today since only `/` exists; breaks when `/products` lands. Needs a client component using `usePathname` |
| Duplicated className strings; three different composition styles | Cheap now, worth a shared `cn()` before more pages |
| `localePath()` helper missing — `` `/${locale}/…` `` hand-built at 12 sites | Same root cause as the switcher issue |
| Logo SVG inlined 4× per page (~27KB of 83KB HTML, 10.9KB gzipped) | A `<symbol>`/`<use>` sprite would recover the spec's intent |

## Before the first Vercel deploy

Create a Keystatic GitHub app and set five environment variables, or the CMS renders blank
in production (it falls back to local mode, which is dev-only by design):

`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`,
`KEYSTATIC_GITHUB_OWNER`, `KEYSTATIC_GITHUB_REPO`

## What the next plan picks up

Products collection and six product pages, `/about`, `/contact`, legal pages, sitemap,
robots, JSON-LD (`DietarySupplement`), OG images, the Playwright responsive suite, eslint,
Lighthouse CI, and `check:content --strict` as a pre-launch gate.

Two ordering notes carried forward:

- The `check:content --strict` gate is the only thing standing between the current state
  and a live site with `[REVIEW]` in its `<h1>` and `<meta description>`. Land it early.
- The Playwright suite should assert computed contrast on key text/background pairs. The
  WCAG failure found in final review was invisible to every screenshot and overflow
  assertion that ran before it; axe-core would have caught it mechanically.
