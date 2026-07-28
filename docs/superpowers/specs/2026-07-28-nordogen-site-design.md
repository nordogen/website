# NORDOGEN marketing site — design

Date: 2026-07-28
Status: approved

## 1. Purpose

Bilingual (Serbian + English) informational marketing site for NORDOGEN d.o.o., a
Serbian company producing food supplements in urology, gynaecology and regeneration.

Audience: patients and healthcare professionals looking up product information —
purpose, key ingredients, who a product is for.

Non-goals: no e-commerce, no accounts, no booking, no contact form, no blog.

Success criteria:

- A non-technical person can change any text or image on the site without touching code,
  JSON syntax or file paths, and cannot structurally break the build.
- Mobile-first at every breakpoint, verified automatically, not by eyeballing.
- Lighthouse SEO 100, accessibility ≥ 95.
- Approved regulatory wording appears verbatim; nothing invented is mistaken for approved.

## 2. Source data inventory

Everything below was extracted from `data/` and `logos/`.

### 2.1 Brand palette (authoritative: `NORDOGEN LOGOBOOK.pdf` p.9)

| Role | CMYK | RGB | Hex | 50% tint |
| --- | --- | --- | --- | --- |
| Blue | 61/24/16/0 | 101,162,191 | `#65A2BF` | `#B2D0DF` |
| Deep teal | 93/57/54/39 | 14,71,80 | `#0E4750` | `#86A3A7` |
| Crimson | 13/85/61/17 | 183,64,75 | `#B7404B` | `#DB9FA5` |
| Ink (logobook body) | — | 35,31,32 | `#231F20` | — |

Two prior artefacts contradict this and are **wrong**:

- `data/style.css` recorded the third brand colour as `#B7D0DB` (a soft blue). It is a
  crimson. That file also invented six per-product accent colours (green, brown, sage)
  that appear nowhere in the brand or on the packaging.
- `logos/nordogen3*.png` render crimson as `#D6404D`. Blue and teal in those files match
  the logobook byte-for-byte, so the logobook is the reliable source and the crimson
  export carries a colour-profile error. Resolution: token `#B7404B`, retint the crimson
  lockup to match.

### 2.2 Product accents, derived from actual packaging renders

Sampled dominant colour from `data/Nordogen kutije 3D/*.png`:

| Product | Sampled | Brand accent |
| --- | --- | --- |
| Nordoprost | `#5897BB` | blue |
| Litonord | `#4885AD` | blue |
| Urinord | `#4B89B1` | blue |
| Myonord | `#9E363F` | crimson |
| Nordilloma | `#99343D` | crimson |
| Renord | `#013C4A` | teal |

Packaging uses only the three brand colours. The content model therefore exposes accent
as a three-option select, not a free colour field — an editor cannot introduce an
off-brand colour.

### 2.3 Typography

Logobook specifies two fonts:

- **Vonique43** — the `nordogen` logotype only. Sourced from dafont.
- **Cera Pro Medium** — all other text. Commercial font (TypeMates); the logobook cites
  `freefontdownload.org`, i.e. an unlicensed source. Cannot be self-hosted.

Decisions:

- Vonique43 is never needed as a webfont. The logotype ships as SVG outlines.
- Cera Pro is substituted with **Jost** (Google Fonts, variable, `latin` + `latin-ext`
  so Serbian `š đ č ć ž` render). Jost is Futura-derived but retains the double-storey
  `a` and single-storey `g` that characterise Cera Pro. Poppins and Outfit were rejected:
  single-storey `a`, wrong skeleton.
- The logobook's own layout style — widely letterspaced uppercase labels — is adopted as
  the site's label treatment (`tracking-[0.16em]`).

### 2.4 Logo

`data/nordogen logo 1 v1.pdf` is true vector; `pdftocairo -svg` extracts it with text
already flattened to paths (verified). Its tagline reads
**`UROLOGIJA • GINEKOLOGIJA • REGENERACIJA`**, which matches the business better than the
logobook's alternate `MEDICAL SCIENCE` lockup. `logos/*.png` supply both lockups
(stacked = `nordogenN.png`, horizontal = `nordogenNa.png`) in all three colours at
1417px.

Implementation: one `logo.svg` with `mark` and `wordmark` as separate `<g>` elements,
filled with `currentColor`. That yields three colours × two lockups from a single ~6KB
file, crisp at any size. The tagline is **live text**, not paths, so it localises to
`UROLOGY • GYNECOLOGY • REGENERATION`. The PNGs remain the source for favicon,
apple-touch-icon and OG fallback.

### 2.5 Product declarations

`data/tekstovi deklaracija/*.docx` — six approved outer-packaging texts, Serbian only.
Each contains: product name, category, net quantity, purpose (`Namena`), active
ingredient table with mg and %NRV, full ingredient list, dosage, notes, warnings,
storage, manufacturer.

Per decision in §4, the full declarations do **not** appear on the site. They remain the
authoritative source for any medical phrasing that does appear.

Facts common to all six: NORDOGEN d.o.o., Mileševska 24/9, Beograd, Republika Srbija.
Contract manufacturer: ELEPHANT PHARMA d.o.o., Beograd.

### 2.6 Missing assets

No hero, laboratory or about photography exists. Old `data/index.html` referenced
nonexistent local files with Unsplash `onerror` fallbacks. See §6 for the alternative.

## 3. Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router), TypeScript, React |
| Output | Next.js default — **not** `output: 'export'` |
| Styling | Tailwind CSS v4, CSS-first `@theme` |
| Content | Keystatic, GitHub mode |
| i18n | none — `[locale]` segment + Keystatic dictionaries |
| Font | Jost via `next/font/google` |
| Hosting | Vercel, apex `nordogen.com` |

### 3.1 Why not `output: 'export'`

Mandatory, not preference. Keystatic's admin UI and its GitHub API routes require a
server runtime; static export cannot host them. Dropping export additionally restores
`next/image` optimisation, which matters because the only real imagery is six
1000×1500 PNGs. All content routes remain fully prerendered via `generateStaticParams` —
the site is still static in every way that affects visitors.

### 3.2 Why not `next-intl`

Once Keystatic owns the content, an i18n library would only carry nav labels and button
text — and it would force the editor to work in two systems: a CMS for product copy and
raw `messages/*.json` for chrome. That is precisely the JSON-comma failure mode the CMS
exists to prevent.

Instead: `app/[locale]/` with `generateStaticParams`, and chrome strings become a
Keystatic `siteChrome` singleton per locale. No middleware, no runtime, one editing
surface. The site has no plural, date or number formatting, so next-intl's actual value
is unused.

## 4. Scope decisions

| Question | Decision |
| --- | --- |
| Domain | `nordogen.com`; `www` → apex 301 |
| Serbian script | Latin only. Locales: `sr`, `en`. Default `sr` |
| Product depth | Marketing summary; declarations off the site entirely |
| Contact | Email, phone, address. No form |
| Structure | Home, Products, Product×6, About, Contact, Privacy, Disclaimer |
| Science page | Folded into About as a section |

Rejected, with reasons:

- **Root-serves-`sr`** (`/` instead of `/sr`). Symmetric prefixes keep Keystatic content
  paths, hreflang and the language switcher trivially correct. A prefixed default is
  handled fine by Google given `/` → 301 `/sr` and `x-default` → `/sr`. Marginal SEO gain
  is not worth the asymmetry.
- **Localised slugs** (`/sr/proizvodi`). URL keywords are a weak ranking signal; real
  traffic will be brand-name queries (`nordoprost`, `d-manoza`). Costs a rewrite table a
  maintainer must understand.
- **A separate Science page.** Two paragraphs of content on its own route is a doorway
  page and hurts more than it helps.

## 5. Routes

```
app/
  [locale]/
    layout.tsx                    Header, Footer, lang attr, Organization + WebSite JSON-LD
    page.tsx                      Home
    products/page.tsx             Products index
    products/[slug]/page.tsx      ×6, prerendered
    about/page.tsx                includes Science section
    contact/page.tsx
    privacy/page.tsx
    disclaimer/page.tsx
  keystatic/[[...params]]/page.tsx
  api/keystatic/[...params]/route.ts
  sitemap.ts
  robots.ts
```

`/` → 301 `/sr` via `next.config` redirect. `generateStaticParams` covers
`locale × slug`.

## 6. Design system

### 6.1 Tokens

Tailwind v4 `@theme` in `app/globals.css`. No `tailwind.config.js`. No inline hex
anywhere in components.

```css
@theme {
  --color-brand-blue: #65A2BF;
  --color-brand-blue-tint: #B2D0DF;
  --color-brand-teal: #0E4750;
  --color-brand-teal-tint: #86A3A7;
  --color-brand-crimson: #B7404B;
  --color-brand-crimson-tint: #DB9FA5;
  --color-ink: #231F20;
  --font-sans: var(--font-jost);
}
```

### 6.2 Visual language without photography

No stock photography. For a trust-oriented medical brand, generic Unsplash imagery reads
as filler; a system built from the brand's own geometry reads as considered. Elements:

- The mark's mountain-and-leaf arcs, scaled large at low opacity, as section motifs.
- Concentric thin-line circles — already a logobook motif.
- A deep-teal full-bleed band for the science/quality section.
- The six box renders as the actual product imagery, composited on brand tints.
- Letterspaced uppercase labels throughout, lifted from the logobook's own typography.

### 6.3 Typography scale

- Display: Jost 500/600, `clamp()`, tight leading.
- Labels/eyebrows: Jost 500, uppercase, `tracking-[0.16em]`.
- Body: Jost 400, leading 1.7, **never below 16px** — smaller triggers iOS input zoom
  and fails readability.

## 7. Mobile-first requirements

This is a mobile-first site. The rule is structural, not aspirational: **every unprefixed
Tailwind utility is the mobile style, and `sm:` / `md:` / `lg:` may only add.** A
component written desktop-first with `max-*` overrides is a defect regardless of how it
renders.

Design targets 375 / 768 / 1440. Breakpoints are Tailwind v4 defaults.

Per-element rules:

- **No horizontal overflow at any width, ever.** `overflow-x-clip` on `body`; any
  intrinsically wide content lives in its own `overflow-x-auto` container.
- **Header/nav.** Mobile: logo + hamburger opening a full-screen panel; language switcher
  reachable both in the collapsed bar and in the panel. Inline nav from `lg` up. The old
  CSS's horizontally-scrolling nav strip is explicitly replaced — it hid items with no
  affordance.
- **Touch targets ≥ 44×44px** — nav links, language switcher, product cards.
- **Hero uses `svh`, never `vh`.** `100vh` is broken by mobile browser chrome. Preference
  is content-driven height with padding, capped by `min-h-[100svh]`.
- **Product grid**: 1 column → 2 at `sm` → 3 at `lg`.
- **Product page**: single column on mobile with the box render first; two-column with a
  sticky image from `lg`.
- **Footer**: single column → 2 at `sm` → 4 at `lg`.
- **Ingredients render as a description list, not a table.** Tables cannot reflow at
  375px without a scroll container.
- **`next/image` with explicit `sizes`** per breakpoint, so a phone never downloads the
  1500px render.
- **`prefers-reduced-motion`** respected on every transition.

## 8. Content model (Keystatic)

Schema is defined once as a factory and instantiated per locale, writing to
`content/sr/…` and `content/en/…`. Structural drift between locales is therefore
impossible by construction.

### 8.1 `products` collection — 6 entries × 2 locales

| Field | Type | Notes |
| --- | --- | --- |
| `name` | text | e.g. `NORDOPROST` |
| `slug` | filename | shared across locales |
| `category` | select | `dodatak-ishrani` \| `fsmp` |
| `form` | text | `30 kapsula`, `15 kesica` |
| `tagline` | text | |
| `summary` | text | also feeds meta description |
| `audience` | text | who it is for |
| `accent` | select | `blue` \| `teal` \| `crimson` — no free hex |
| `image` | image | box render |
| `ingredients` | array `{name, role}` | |
| `benefits` | array of text | |
| `regulatoryNote` | text, optional | mandatory for `fsmp` |
| `order` | number | sort order |
| `seo` | object `{title?, description?}` | optional overrides |

### 8.2 Singletons

Per locale: `siteChrome` (nav, buttons, footer, switcher, mandatory disclaimer),
`home`, `about`, `contact`, `legal`.

Global: `settings` — legal entity, address, manufacturer, contact email, default OG.

## 9. SEO

- `generateMetadata` per route, localised, with `canonical` and
  `alternates.languages` = `{ sr, en, 'x-default': sr }`.
- `app/sitemap.ts` — native, no dependency. Every route × 2 locales, each entry carrying
  its own `alternates.languages`, so hreflang is declared in both HTML and sitemap.
- `app/robots.ts` — native. Disallows `/keystatic` and `/api`.
- **JSON-LD**, hand-built, typed with `schema-dts` (dev-only, no runtime cost):
  - Root: `Organization` (legal name, logo, `PostalAddress`, email, `sameAs`) + `WebSite`.
  - Product pages: **`DietarySupplement`**, not `Product`. It is a `MedicalEntity`
    subtype with exactly the right fields — `activeIngredient`, `nonProprietaryName`,
    `recommendedIntake`, `targetPopulation`, `safetyConsideration`. `Product` would
    require `offers`, which do not exist. Plus `BreadcrumbList`.
  - Urinord is framed per its FSMP category, not identically to the other five.
  - Contact: `ContactPage`.
- `opengraph-image.tsx` per route via `next/og`, generated at build: teal field, mark,
  product name, tagline, box render. Per-product, not one generic image.
- Zero client JS beyond the nav toggle and the analytics beacon.

## 10. Maintenance

Editor flow: `nordogen.com/keystatic` → GitHub login → labelled form fields → Save →
commit to `main` → Vercel deploys in ~40s.

**Direct to `main`, not PR mode.** Once fields are typed, structural breakage is
impossible — which is the entire reason for not using JSON — so a review gate would only
add a step that gets clicked through. Git history is the undo.

`npm run check:content`, on `prebuild` and in CI, asserts:

- every product slug exists in both locales
- required fields non-empty
- referenced images exist on disk

`[REVIEW]` markers are **reported, not fatal**, by default — authored drafts legitimately
carry them during build-out. `npm run check:content -- --strict` turns them fatal and is
run as a **pre-launch gate**, not on every CI run, so the site cannot go to production
with unreviewed copy still in it.

GitHub Action on PR and `main`: `check:content` → `next build` → `vitest` →
`playwright` responsive suite → Lighthouse CI budgets (a11y ≥ 95, SEO 100, LCP). This is
the real safety net: a content edit cannot silently regress the site, which matters
precisely because a non-technical person is making the edits.

## 11. Dependencies

Runtime: `next`, `react`, `react-dom`, `@keystatic/core`, `@keystatic/next`,
`@vercel/analytics`, `@vercel/speed-insights`.

Dev: `typescript`, `tailwindcss@4`, `@tailwindcss/postcss`, `eslint`,
`eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss`, `schema-dts`, `vitest`,
`@playwright/test`, `@lhci/cli`.

Deliberately excluded:

| Package | Replaced by |
| --- | --- |
| `next-intl` | `[locale]` segment + Keystatic dictionaries |
| `next-sitemap` | native `app/sitemap.ts` |
| `next-seo` | `generateMetadata` |
| `framer-motion` | CSS transitions; motion libraries cost LCP for no gain here |
| any icon library | six hand-inlined SVGs |
| `@next/mdx` | Keystatic's markdoc renderer |

Vercel: Web Analytics (cookieless, so **no consent banner is required** — the reason GA4
is not used), Speed Insights, Preview Comments enabled so the editor can comment on
preview deploys.

## 12. Copy authoring rules

1. **Medical and regulatory wording is never altered.** Any phrasing about function,
   ingredients, dosage, population or warnings is taken verbatim from
   `data/tekstovi deklaracija/*.docx`. Not paraphrased, not "improved", not softened.
2. Copy authored fresh — home hero, about, philosophy, science, contact intro, legal
   pages — is marked `[REVIEW]`.
3. The borderline claims in the old `data/products.html` draft ("HPV-related care
   contexts", "kidney stone support", "post-surgical recovery") are **carried as-is and
   marked `[REVIEW]`**, not rewritten. Rewriting medical phrasing is out of scope; a
   human decides.
4. English is a translation of Serbian for marketing copy. Where an English rendering of
   a regulated claim would be an unofficial translation, it is marked `[REVIEW]`.

## 13. Regulatory notes

Flagged from the source data. Not legal advice.

1. **Mandatory footer statement.** All six declarations carry *"Dodaci ishrani nisu
   zamena za raznovrsnu i uravnoteženu ishranu i zdrav način života."* It belongs in the
   footer in both locales, editable via `siteChrome`.
2. **Urinord is not a supplement.** It is *hrana za posebne medicinske namene* (food for
   special medical purposes) and its declaration states it must be used under medical
   supervision. It cannot be presented identically to the other five — hence `category`
   driving a distinct page treatment and a mandatory `regulatoryNote`.
3. Privacy policy and disclaimer pages are required but thin: no forms, no cookies,
   cookieless analytics.

## 14. Verification

No pretend-TDD on a marketing site. Tests target the parts with actual logic.

- **vitest**: content loader, locale resolution, sitemap generation, JSON-LD builders,
  `check:content` rules.
- **playwright**: for every route × {375, 414, 768, 1024, 1440} assert
  `document.documentElement.scrollWidth <= clientWidth` (no horizontal overflow) and
  capture a screenshot. This makes §7 enforceable rather than aspirational.
- `next build` clean, `check:content` passing.
- Lighthouse CI budgets.

## 15. Build order

1. `git init` + GitHub repo. Keystatic GitHub mode requires one; none exists yet.
2. Scaffold, tokens, Jost, logo SVG rebuild, Header/Footer shell, **Home in both
   locales** → review gate.
3. Keystatic config + seed all content from `data/`.
4. Products index + six product pages.
5. About, Contact, legal pages.
6. SEO layer: metadata, hreflang, sitemap, robots, JSON-LD, OG images.
7. CI, Playwright responsive suite, Lighthouse, Vercel domain.
