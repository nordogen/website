# NORDOGEN website — agent guide

Bilingual (Serbian + English) informational marketing site for NORDOGEN d.o.o., a Serbian
company producing food supplements for urology, gynaecology and regeneration. Audience:
patients and healthcare professionals looking up product information.

No e-commerce, no accounts, no forms, no blog.

**Read before non-trivial work:**
- `docs/redesign-2026-09.md` — the current visual system, where it came from, and what was
  deliberately changed from the handoff
- `docs/product-pages.md` — the product page template: its content model, what the copy came
  from, and where it departs from that handoff
- `docs/superpowers/specs/2026-07-28-nordogen-site-design.md` — the *first* build's decisions.
  Superseded on colour, type and imagery by the redesign; still correct on routing, i18n and
  the content-layer posture
- `docs/design-review-handoff.md` — open decisions, parked issues, copy needing legal review

## Commands

```bash
npm run dev        # localhost:3000/sr — CMS at /keystatic
npm run build      # must show ● /[locale] with /sr and /en
npm start          # production server
npx vitest run     # 24 tests
npx tsc --noEmit   # typecheck
```

`npm run lint` is currently broken — the script exists but eslint is not installed. Known,
deferred.

## Stack — versions are pinned deliberately

| | | |
|---|---|---|
| Next.js | 16.2.12 | App Router |
| React | 19.2.8 | |
| TypeScript | **6.0.3** | see trap below |
| Tailwind | 4.3.3 | CSS-first `@theme`, no `tailwind.config.js` |
| Keystatic | 0.6.3 / next 5.0.4 | git-based CMS |
| Vitest | 4.1.10 | |

**Never `output: 'export'`.** Keystatic's admin UI and route handler need a server runtime.
All visitor-facing routes are still statically prerendered via `generateStaticParams`.

**No i18n library, deliberately.** Per-locale Keystatic singletons and collections *are* the
dictionaries. Adding `next-intl` would force the editor to work in two systems.

Navigation labels, footer column headings and accessibility strings are **not** in Keystatic —
they live in `src/i18n/ui.ts`. They are structural: they change when routes change, and an
editor who can rename a menu item can point it at a page that no longer matches.

## Traps that cost real time — do not rediscover these

**TypeScript must stay on 6.x.** TS 7 (the Go-native port) is the `latest` tag and Next
16.2.12 rejects it: `TypeScript 7.0.2 does not provide the compiler API required by
Next.js`. Do not work around it with `experimental.useTypeScriptCli`.

**`src/app/(admin)/keystatic/[[...params]]/page.tsx` must start with `'use client'`.**
Without it, `/keystatic` returns **HTTP 200, a blank page, and zero console errors** —
`@keystatic/core/ui` ships a `react-server` conditional export whose `Keystatic` component
is a stub that returns `null`. If the admin is blank, check the directive first.

**Keystatic storage switches on credential presence, not `NODE_ENV`.** Keying it off
`NODE_ENV` makes `next build` select `github` storage and hard-fail with `Missing required
config in Keystatic API setup` before the GitHub app exists — the project could not build at
all. See `keystatic.config.ts`.

**Keystatic `local` storage is dev-only.** Under `next start` the admin renders blank *by
design*, because local mode writes to the filesystem. Verify the CMS with `npm run dev`.

**A className on a wrapper does not size an inlined SVG.** `LogoMark`/`LogoWordmark` inject
the class onto the `<svg>` element itself and keep the wrapper at `display: contents`. Put the
class on the wrapper instead and the logo renders at **zero height with no error** — a blank
gap where the lockup should be, which reads as a missing asset.

**`backdrop-filter` creates a containing block for `position: fixed` descendants.** The header
used to carry `backdrop-blur`, which sized the mobile nav panel to the header's box instead of
the viewport; the panel was portalled to `document.body` to escape it. The redesign's header is
a solid `paper` bar with no blur, so the panel is now an ordinary `absolute` child of the
header. **If a blur ever comes back, the portal has to come back with it.**

## Architecture

Two root layouts, via route groups. Route groups do not appear in URLs.

```
src/app/
  (site)/[locale]/layout.tsx     ROOT LAYOUT 1 — <html lang={locale}>, font, Header, Footer
  (site)/[locale]/page.tsx       Home
  (site)/[locale]/products/[slug]/page.tsx   Product page — 6 slugs x 2 locales, prerendered
  (admin)/keystatic/layout.tsx   ROOT LAYOUT 2 — <html lang="en">, admin only
  (admin)/keystatic/[[...params]]/page.tsx
  api/keystatic/[...params]/route.ts   route handler — needs no layout
  icon.png                       favicon, shared by both groups
  globals.css                    @theme tokens + base layer
```

`(site)/[locale]/layout.tsx` **is** the root layout — there is no `src/app/layout.tsx` and
there must not be. `<html lang>` varies per locale, and reading the locale from `headers()`
in a root layout would force every route to render dynamically and destroy static
prerendering. The locale comes from the route param instead.

`(admin)` exists because a route outside `[locale]` would otherwise have *no* root layout:
`/keystatic` served no doctype, `<html>`, `<head>` or `<body>` — invalid markup that
browsers quirks-mode-repair, so it looked fine in a screenshot.

**Do not add `middleware.ts`.** Not needed; `/` → `/sr` is a `next.config.ts` redirect.

### Content layer

```
src/content/reader.ts          createReader instance
src/content/queries.ts         getSettings(), getSiteChrome(locale), getHome(locale),
                               getProducts(locale)
src/keystatic/schema.ts        siteChromeSchema(), homeSchema(), productSchema()
                               — ONE factory per shape
keystatic.config.ts            singletons + the two product collections, instantiating
                               each factory once per locale
content/{sr,en}/*.json         editor-managed page content
content/{sr,en}/products/*.json  one file per product, per locale — the home card
                               AND the whole product page behind it
src/i18n/ui.ts                 nav, footer headings, a11y strings — NOT editor-managed
```

The two locales share one schema factory, instantiated twice. This makes structural drift
between `sr` and `en` impossible by construction — **do not inline field definitions per
locale.** Note `settings` is an exception (inlined, no per-locale counterpart).

The product file is grouped into `fields.object` blocks that mirror the page — `hero`,
`audience`, `benefits`, `formula`, `ingredients`, `useCases`, `notes` — so the editor works
down the page in order. `benefits` and `useCases` are whole sections that **disappear when their
array is empty**, taking their band and their on-page-nav entry with them. `ingredients.items`
feeds three things at once: the pills on the home card, the pills in the product hero, and the
ingredient cards.

**A product's photo is derived from its slug** (`public/products/<slug>.webp`), not stored as a
CMS image field. The photo is identical in both locales, and a per-locale image field is a
per-locale way to get them out of sync. `src/content/products.test.ts` asserts every slug has a
file, so a rename cannot silently blank a card.

Queries **throw** on missing content rather than returning empty strings, so a missing file
is a build error instead of a page of silent blanks. Keep that posture.

Field `label` and `description` strings are user-facing copy for a non-technical editor.
Write them for that reader.

## Hard constraints

**Colour.** The full palette is the `@theme` block in `src/app/globals.css` and nothing else.
Surfaces `paper` `#FCFCFA`, `soft` `#F6F5F1`, `well` `#F4F3EF`, `panel` `#EEF2F4` (the product
page's hero panel), `white`. Text `ink` `#14201F`,
`ink-soft` `#41504E`, `muted` `#5F6C6A`, `nav` `#3D4A49`, `inactive` `#647371`, `on-ink`
`#A7B4B3`. Accent `accent` `#2E7391`, `accent-light` `#7FB4C9`. Per-product `product-blue`
`#4C88A8`, `product-teal` `#0F4249`, `product-crimson` `#8E2A3E`, plus `badge-blue` `#3A6E88`.
Button states `ink-hover`, `ink-active`, `paper-hover`.

**No inline hex in components. No Tailwind default-palette utilities** (`text-gray-500`,
`bg-slate-100`, …), not even in throwaway markup. A gradient or other value that cannot be a
colour token goes in `@layer components` in `globals.css` (see `.hero-scrim`), not in JSX.

This replaces the pre-redesign `brand-*` palette wholesale. The old `brand-blue` / `brand-teal`
/ `brand-crimson` tokens no longer exist; if you find one referenced anywhere, it is stale.
`data/style.css` was already a wrong reference and is now doubly so.

**Blue is the only accent whose badge fill differs from the accent itself.** White text on
`product-blue` does not clear 4.5:1, so badges use `badge-blue`. `FAMILY_BADGE` in
`ProductCard.tsx` encodes this — do not "tidy" the two into one token.

**Colour follows the therapeutic area, not the other way round.** A product's `family`
(`urology` / `gynaecology` / `regeneration`) picks its badge fill and its benefit-card rule, and
also decides which products appear under "from the same range" — own area first, **plus
regeneration, which belongs to every group** (see `getRelatedProducts`). There is no separate
colour field to fall out of step with it.

**Every text/background pair on the page has been measured against real pixels**, compositing
alpha onto the actual ancestor background. Two things follow: reading `getComputedStyle().color`
alone is not a measurement, because Tailwind emits `oklab(… / .85)` for `text-white/85`; and the
handoff's own `#6B7A78` inactive language label measured **4.37:1** on paper and was darkened to
`#647371` (4.83:1). Introduce a new tint and you measure it the same way.

`brand-blue` is gone, but its lesson is not: a mid-tone blue as text on a light ground fails AA
and no screenshot will tell you.

**Mobile-first is structural, not aspirational.** Every unprefixed Tailwind utility is the
mobile style; `sm:`/`md:`/`lg:` may only ADD. A component written desktop-first with `max-*`
overrides is a defect even if it renders correctly. Targets: 375 / 768 / 1440.

- No horizontal overflow at any width. `body` has `overflow-x: clip` (not `hidden`, so the
  sticky header still works) — but never rely on it to mask a layout bug.
- Touch targets ≥ 44×44px.
- `svh`, never `vh` — mobile browser chrome breaks `100vh`.
- Running prose is 17px mobile / 19px desktop, set on `body`. Interface furniture may go
  smaller: card ingredient line 15px, footer meta and the legal line 14px, eyebrows 13/14px,
  the language switch 13px, and the product badge **11px on mobile / 12px desktop**. The badge
  is the smallest type on the site and it is deliberate — uppercase, letterspaced, and short.
  Do not "fix" it, and do not copy 11px anywhere else.
- The product page's desktop on-page nav is the one place a target is under 44px: 29px tall,
  set 32px apart, which is what the artboards draw and what WCAG 2.5.8's spacing exception
  covers. Its mobile rows are the full 44px. Everything else on the site meets 44.
- `prefers-reduced-motion` is handled globally in `globals.css`. Do not re-implement it.

**Server components by default.** There are exactly two client components, and each has a
reason that cannot be met on the server: `MobileNav.tsx` (open/close state) and
`ProductToc.tsx` (which section is in view). Everything else is a server component. Keep it
that way.

## Copy rules — these have legal weight

**Medical, regulatory and dosage wording is copied verbatim from
`docs/product-declarations.md` and never paraphrased, "improved" or softened.** That file is the
tracked extract of the client's approved `.docx` declarations.

This sentence is required by Serbian food-supplement regulation, appears on the **five
supplement** declarations (not URINORD — see below), renders in the footer in both locales, and
must stay byte-identical:

```
Dodaci ishrani nisu zamena za raznovrsnu i uravnoteženu ishranu i zdrav način života.
```

It carries **no** `[REVIEW]` marker because it is established regulatory text. The Serbian
wording above is the legally binding one and must appear on the Serbian pages byte-identical.

**The English pages carry the English rendering alone.** They used to append the Serbian
original after a slash; the client asked for English only on 2026-09-08. The same goes for each
product's `notes.legalNote`, which is the same statement plus "Keep out of the reach of small
children" (and the food-for-special-medical-purposes wording on Urinord). Do not re-append the
Serbian — and note the consequence: the binding Serbian text is now reachable only via the
Serbian pages.

**Copy has two sources, and they rank.** `design/copy/index.html` is the client's own
bilingual copy and wins wherever a slot clearly matches — it is why the hero, the products
heading, the whole "Zašto Nordogen" block, the contact band and the footer description read as
they do rather than as the artboards' Serbian. The artboards' copy fills the slots the client
file has no counterpart for: the four principles and the product badge labels. One consequence
worth knowing: the artboards claimed a GMP facility and per-batch release testing. That claim
is **not** on the site, because the client copy that replaced it makes no such claim and
nothing in `docs/product-declarations.md` supports it. Do not reintroduce it without the client.

**Authored marketing copy carries a trailing ` [REVIEW]` marker** (note the space before
`[`) while it is a draft awaiting the client's legal review. Markers are visible in the page on
purpose — that is what keeps unreviewed copy obvious. Never add a marker to regulatory text or
company facts; never silently drop one. Dropping a marker is the **client's** call, recorded
when it happens.

**Urinord is not a supplement.** It is *hrana za posebne medicinske namene* (food for special
medical purposes) and must carry a medical-supervision notice. The content model has
`category` and `regulatoryNote` for this. It cannot be presented identically to the other
five products.

Do not invent health claims. Under Reg. 1924/2006 a function claim must map to specific
authorised wording, not a generic assertion.

**As of 2026-09-08 no copy on the site carries a marker** — the client reviewed and cleared the
product badge labels, the four principles and the English meta title and description. New
authored copy still starts marked. The footer's
mandated statement stays marker-free and byte-identical — note the artboards render it in the
**singular** ("Dodatak ishrani nije zamena…"), which is wrong; the plural form above is the one
on the declarations.

Serbian is **Latin script only**. Diacritics `š đ č ć ž Š Đ Č Ć Ž` must survive — files are
UTF-8, and mojibake is a defect. Verify, don't assume.

## Verification — lessons learned the hard way

**Use `next start`, not `next dev`.** A verification pass once reported `overflow = 0` at
every width while actually measuring a **blank page**, because a stale dev server held the
port. Zeros from nothing look identical to zeros from success.

**Assert the thing exists before trusting any measurement of it.** e.g. confirm
`document.querySelector('footer')` is non-null before believing a layout number.

**`--header-height` and `--toc-height` are load-bearing, and nothing checks them.** The sticky
header, the sticky on-page nav under it, and every anchor's `scroll-margin-top` all read those
two variables in `globals.css`. Change a header padding or the on-page nav's line-height and the
numbers silently stop matching: anchors then land *behind* the sticky bars, which looks like a
scrolling bug and is really an arithmetic one. Measure both after any change to either bar —
`getBoundingClientRect().height` against `getComputedStyle(documentElement).getPropertyValue`.

**Replacing an image file does not change what a screenshot shows.** `next/image` caches
optimised output in `.next/cache/images` keyed by URL, not by content, and the browser caches on
top of that. Swap `public/products/myonord.webp` for a different picture at the same path and two
consecutive verification passes will keep showing the old one — which reads exactly like "the new
asset is wrong". Delete `.next/cache/images` **and** drive Chrome with
`Network.setCacheDisabled`. The same staleness can outlive a deployment, so bump the path when an
image changes meaningfully.

**A screenshot proves pixels, not markup.** `/keystatic` rendered a perfect-looking admin UI
while serving no `<html>` or `<body>` at all.

**Verify at the size the thing is actually consumed at.** The logo looked right on a 600×600
canvas and was a 4px speck at the 36px the header uses, because the SVG kept the source
PDF's full-page `viewBox`.

**Automated assertions measure absence-of-overflow and presence-in-DOM — never whether
something is readable.** The WCAG contrast failure was invisible to every screenshot and
overflow check that ran before it.

Headless Chrome is available (`google-chrome --headless`); it rasterises SVG and resolves
`currentColor` correctly. `rsvg-convert`, ImageMagick and Inkscape are **not** installed.
Driving the page over the Chrome DevTools Protocol works well for focus, ARIA and layout
assertions.

## Assets

**`data/`, `logos/` and `design/` are gitignored — local only, not in the repo.** They are ~25MB of
client source material and nothing in the web app reads them at build time. If they are absent
from your checkout, that is expected; obtain them from the client. What they hold:

- `data/` — the approved declaration `.docx` files, the logobook and logo PDFs, six 3D box
  renders (needed when product pages are built), and the old draft HTML/CSS (a **wrong** colour
  reference)
- `logos/` — six PNGs: three brand colours × stacked/horizontal lockups

`design/` is the Claude Design redesign handoff: `design/handoff/CLAUDE_CODE.md` (the brief,
including hover/focus states and the optional-field rules), the two `.dc.html` artboards
(desktop 1440 and mobile 375, every px and hex a literal inline style), PNG exports, and the
unoptimised source images. `design/copy/index.html` is the **client's own bilingual copy** — the
old draft site — and is the preferred source for any slot where it clearly matches.

Everything the repo actually needs from them is already extracted and tracked:

- `docs/product-declarations.md` — all six approved texts verbatim. **This is the binding
  regulatory source**, and it survives without `data/`.
- `public/brand/logo-mark.svg`, `logo-wordmark.svg` — the generated logo assets
- `public/brand/favicon-source.png` and `src/app/icon.png` — from `logos/nordogen1.png`
- `public/images/hero.jpg`, `lab.jpg` — resized to 1920w, mozjpeg q78
- `public/products/<slug>.webp` — the six renders at 900px, q82. 12 MB of source PNGs became
  ~240 KB; do not commit the originals back.

The one consequence: `scripts/extract-logo.mjs` reads `data/nordogen logo 1 v1.pdf`, so it
cannot run on a checkout without `data/`. That only matters if the logo artwork changes; the
generated SVGs are committed.
- `public/brand/logo-mark.svg`, `logo-wordmark.svg` — generated, `currentColor`, tight viewBox
- `scripts/extract-logo.mjs` — regenerates them from the vector PDF. A bare run reproduces the
  committed files byte-for-byte. The source PDF has **five** path clusters (mark, wordmark,
  tagline, three colour swatches, a page number), so selection is by documented y-range, not a
  ratio split. `--report` prints the bboxes.

The logo tagline is **live text**, not paths, so it localises (`UROLOGIJA • GINEKOLOGIJA •
REGENERACIJA` / `UROLOGY • GYNECOLOGY • REGENERATION`).

**There is photography now** — this reverses the pre-redesign rule. Two art-directed stills
(`public/images/hero.jpg`, `lab.jpg`) plus six product box renders (`public/products/*.webp`).

The renders are **background-removed cutouts with a real alpha channel**, so they need no blend
mode and sit correctly on any ground. The handoff's originals were shot on a light grey backdrop
and the artboards masked that with `mix-blend-mode: multiply`, which does not remove grey — it
leaves a visible rectangle and darkens the packaging colour. If a new product photo ever shows a
box in a tinted rectangle, it is an opaque render and needs cutting out, not a blend mode.

`ArcMotif` is no longer used anywhere. Still no emoji and no icon fonts.

## Not built yet

A products **index** at `/[locale]/products`, `/about`, `/contact`, legal pages, sitemap,
JSON-LD (`DietarySupplement`, not `Product` — no offers exist), OG images, Playwright responsive
suite, eslint, Lighthouse CI, and `check:content --strict`.

**Nothing on the site links to a 404.** Product pages exist and the home cards, the footer
product column and the "from the same range" cards all link to them. Everything else points at
an on-page anchor (`#proizvodi`, `#zasto`, `#kontakt`, ids in `src/i18n/ui.ts`) or a `mailto:` —
including the product page's own breadcrumb, whose middle crumb goes to the home page's product
grid because there is no index yet. The footer's legal column is still plain text. When a real
route lands, swap its `hash` for a `path` in `ui.ts` — do not add dead links before then.

Two ordering notes for whoever picks this up:

- `check:content --strict` is the only thing standing between the current state and a live
  site with `[REVIEW]` in its `<h1>` and meta description. Land it early, not last.
- The Playwright suite should assert computed contrast on key text/background pairs. Axe-core
  would have caught the WCAG failure mechanically.

## Deployment

### `NEXT_PUBLIC_SITE_ORIGIN` drives both canonical URLs and indexing

Set it per Vercel environment. `src/i18n/urls.ts` resolves the origin once at build time:
the explicit variable wins, then `VERCEL_PROJECT_PRODUCTION_URL` (the project's *stable*
production host — never `VERCEL_URL`, which changes on every push), then
`http://localhost:3000`.

The last fallback is deliberately **not** the canonical host: a misconfigured deployment must
not publish canonical and hreflang tags claiming to be the live site.

`src/app/robots.ts` gates indexing on `isProductionOrigin(SITE_ORIGIN)` — host, **not**
`NODE_ENV`, because staging and preview deployments are production builds. Only
`nordogen.com` / `www.nordogen.com` get `Allow: /`; every other host gets `Disallow: /`,
which is what keeps `[REVIEW]` copy out of search results. Verify by reading
`.next/server/app/robots.txt.body` after a build — the emitted file, not the source.

No `sitemap` line in `robots.txt` yet, because `sitemap.ts` does not exist. Add both together.

### Keystatic CMS

Create a Keystatic GitHub app and set five environment variables, or the CMS renders blank in
production:

`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`,
`KEYSTATIC_GITHUB_OWNER`, `KEYSTATIC_GITHUB_REPO`

The git remote is `nordogen/website`, so `KEYSTATIC_GITHUB_REPO` is **`website`**. The app's
OAuth callback is host-specific, so point it at a stable domain — preview URLs change on
every push and the CMS will not authenticate on them.

`next.config.ts` sets `outputFileTracingIncludes` for `./content/**` — needed because
`createReader` touches the filesystem, and without it any route that reads content at request
time (ISR, draft mode, a missed `generateStaticParams`) would 500 with ENOENT.

## Conventions

- Conventional Commits. Explain *why* in the body when it is not obvious.
- Canonical host `https://nordogen.com`, but never hardcode it — read `SITE_ORIGIN` from
  `src/i18n/urls.ts`. Locales always prefixed; `hreflang` covers `sr`, `en` and
  `x-default` → `sr`.
- Keep the dependency list minimal. Prefer native Next.js features over packages: `sitemap.ts`
  and `robots.ts` over `next-sitemap`, `generateMetadata` over `next-seo`, CSS transitions over
  a motion library, hand-inlined SVG over an icon library.
