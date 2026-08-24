# NORDOGEN website — agent guide

Bilingual (Serbian + English) informational marketing site for NORDOGEN d.o.o., a Serbian
company producing food supplements for urology, gynaecology and regeneration. Audience:
patients and healthcare professionals looking up product information.

No e-commerce, no accounts, no forms, no blog.

**Read before non-trivial work:**
- `docs/superpowers/specs/2026-07-28-nordogen-site-design.md` — design decisions and *why*
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

**No i18n library, deliberately.** Per-locale Keystatic singletons *are* the dictionaries.
Adding `next-intl` would force the editor to work in two systems.

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

**`backdrop-filter` creates a containing block for `position: fixed` descendants.** The
header has `backdrop-blur`, so the mobile nav panel was sized to the header's 64px box
instead of the viewport. It is portalled to `document.body` via `createPortal` for this
reason — see the comment in `MobileNav.tsx`. Do not "simplify" it back.

## Architecture

Two root layouts, via route groups. Route groups do not appear in URLs.

```
src/app/
  (site)/[locale]/layout.tsx     ROOT LAYOUT 1 — <html lang={locale}>, font, Header, Footer
  (site)/[locale]/page.tsx       Home
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
src/content/reader.ts     createReader instance
src/content/queries.ts    getSettings(), getSiteChrome(locale), getHome(locale)
src/keystatic/schema.ts   siteChromeSchema(), homeSchema() — ONE factory per shape
keystatic.config.ts       singletons, instantiating each factory once per locale
content/{sr,en}/*.json    editor-managed content
```

The two locales share one schema factory, instantiated twice. This makes structural drift
between `sr` and `en` impossible by construction — **do not inline field definitions per
locale.** Note `settings` is an exception (inlined, no per-locale counterpart).

Queries **throw** on missing content rather than returning empty strings, so a missing file
is a build error instead of a page of silent blanks. Keep that posture.

Field `label` and `description` strings are user-facing copy for a non-technical editor.
Write them for that reader.

## Hard constraints

**Colour.** Only these tokens: `brand-blue` `#65A2BF`, `brand-blue-tint` `#B2D0DF`,
`brand-teal` `#0E4750`, `brand-teal-tint` `#86A3A7`, `brand-crimson` `#B7404B`,
`brand-crimson-tint` `#DB9FA5`, `ink` `#231F20`, `surface` `#F7FAFC`, plus `white`,
`transparent`, `currentColor`, `inherit`. **No inline hex in components. No Tailwind
default-palette utilities** (`text-gray-500`, `bg-slate-100`, …), not even in throwaway
markup.

`data/style.css` is a **wrong** reference — it records the third brand colour as a blue when
it is a crimson, and invents six per-product accents that exist nowhere in the brand. Do not
copy values from it.

**`brand-blue` is decorative only — never text, never a focus ring, on light grounds.** It
measures 2.43–2.81:1 where AA needs 4.5:1. Text and focus rings on light use `brand-teal`
(9.84:1 on surface) or `ink` (15.55:1); `brand-crimson` passes at 5.21:1 for accents. On the
dark teal band use `white` or `brand-blue-tint`. Full table in spec §2.1.1. The logotype
artwork is WCAG-exempt; live text in the lockup is not.

**Mobile-first is structural, not aspirational.** Every unprefixed Tailwind utility is the
mobile style; `sm:`/`md:`/`lg:` may only ADD. A component written desktop-first with `max-*`
overrides is a defect even if it renders correctly. Targets: 375 / 768 / 1440.

- No horizontal overflow at any width. `body` has `overflow-x: clip` (not `hidden`, so the
  sticky header still works) — but never rely on it to mask a layout bug.
- Touch targets ≥ 44×44px.
- `svh`, never `vh` — mobile browser chrome breaks `100vh`.
- Running prose ≥ 16px. Interface furniture may go smaller: nav/footer meta 14px, eyebrow
  labels, column headings, copyright and the legal line 12px. The letterspaced 12px
  uppercase label is a deliberate brand cue from the logobook — do not "fix" it.
- `prefers-reduced-motion` is handled globally in `globals.css`. Do not re-implement it.

**Server components by default.** `MobileNav.tsx` is the only client component. Keep it that
way unless there is a real reason.

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

It carries **no** `[REVIEW]` marker because it is established regulatory text. In the `en`
file the field holds the English rendering *followed by* the Serbian original — intentional,
since the Serbian wording is the legally binding one.

**Authored marketing copy carries a trailing ` [REVIEW]` marker** (note the space before
`[`). These are drafts awaiting the client's legal review, and they are currently visible in
the page — correct for this stage. Never add a marker to regulatory text or company facts;
never silently drop one.

**Urinord is not a supplement.** It is *hrana za posebne medicinske namene* (food for special
medical purposes) and must carry a medical-supervision notice. The content model has
`category` and `regulatoryNote` for this. It cannot be presented identically to the other
five products.

Do not invent health claims. Under Reg. 1924/2006 a function claim must map to specific
authorised wording, not a generic assertion.

Serbian is **Latin script only**. Diacritics `š đ č ć ž Š Đ Č Ć Ž` must survive — files are
UTF-8, and mojibake is a defect. Verify, don't assume.

## Verification — lessons learned the hard way

**Use `next start`, not `next dev`.** A verification pass once reported `overflow = 0` at
every width while actually measuring a **blank page**, because a stale dev server held the
port. Zeros from nothing look identical to zeros from success.

**Assert the thing exists before trusting any measurement of it.** e.g. confirm
`document.querySelector('footer')` is non-null before believing a layout number.

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

**`data/` and `logos/` are gitignored — local only, not in the repo.** They are ~25MB of
client source material and nothing in the web app reads them at build time. If they are absent
from your checkout, that is expected; obtain them from the client. What they hold:

- `data/` — the approved declaration `.docx` files, the logobook and logo PDFs, six 3D box
  renders (needed when product pages are built), and the old draft HTML/CSS (a **wrong** colour
  reference)
- `logos/` — six PNGs: three brand colours × stacked/horizontal lockups

Everything the repo actually needs from them is already extracted and tracked:

- `docs/product-declarations.md` — all six approved texts verbatim. **This is the binding
  regulatory source**, and it survives without `data/`.
- `public/brand/logo-mark.svg`, `logo-wordmark.svg` — the generated logo assets
- `public/brand/favicon-source.png` and `src/app/icon.png` — from `logos/nordogen1.png`

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

There is **no photography** and none is coming. The visual system is built from the brand's
own geometry — `ArcMotif`'s concentric rings and the mark's arcs, plus a deep-teal band. Do
not add stock imagery, emoji or icon fonts; on a medical brand it reads as filler.

## Not built yet

Product pages and the `products` collection, `/about`, `/contact`, legal pages, sitemap,
JSON-LD (`DietarySupplement`, not `Product` — no offers exist), OG images, Playwright
responsive suite, eslint, Lighthouse CI, and `check:content --strict`.

Home CTAs link to `/products`, `/about` and `/contact`, which **404 today**. Expected.

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
