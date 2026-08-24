# NORDOGEN Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the NORDOGEN site foundation — brand tokens, logo, locale routing, Keystatic content backbone, mobile-first Header/Footer, and the Home page in both locales — ending at a design review gate.

**Architecture:** Next.js App Router with a `[locale]` segment and `generateStaticParams`, so every visitor-facing route is prerendered. Keystatic (git-based CMS) owns all copy from the first task, read at build time through `createReader`; there is no i18n library — per-locale Keystatic singletons are the dictionaries. Tailwind v4 supplies brand tokens via CSS-first `@theme`.

**Tech Stack:** Next.js 16.2.12, React 19.2.8, TypeScript 6.0.3, Tailwind CSS 4.3.3, Keystatic 0.6.3 / @keystatic/next 5.0.4, Vitest 4.1.10.

**Spec:** `docs/superpowers/specs/2026-07-28-nordogen-site-design.md`

## Global Constraints

These apply to every task. Do not restate them per-task; they are always in force.

- **Pin `typescript@6.0.3`.** TypeScript 7 is the `latest` tag but Next 16.2.12 rejects it: `TypeScript 7.0.2 does not provide the compiler API required by Next.js`. Verified by spike.
- **Never use `output: 'export'`.** Keystatic's admin UI and route handler require a server runtime.
- **Brand palette — these exact seven values, no other brand colours.** `#65A2BF` blue / `#B2D0DF` blue tint / `#0E4750` teal / `#86A3A7` teal tint / `#B7404B` crimson / `#DB9FA5` crimson tint / `#231F20` ink. Source: `NORDOGEN LOGOBOOK.pdf` p.9. One additional neutral, `--color-surface: #F7FAFC`, is the page background; it is not a brand colour and no other neutral may be added.
- **No colour in components except brand tokens.** Permitted: the `@theme` brand tokens (`brand-blue`, `brand-blue-tint`, `brand-teal`, `brand-teal-tint`, `brand-crimson`, `brand-crimson-tint`, `ink`, `surface`), plus `white`, `transparent`, `currentColor` and `inherit`. Forbidden: inline hex values, and **every Tailwind default-palette utility** — `text-red-500`, `bg-slate-100`, `border-gray-200` and the like. This applies to throwaway and placeholder markup too, so no default-palette colour can survive into a later task unnoticed.
- **`data/style.css` is a wrong reference.** It records the third brand colour as `#B7D0DB` (a blue — it is a crimson) and invents six per-product accents that exist nowhere in the brand. Do not copy values from it.
- **Mobile-first is structural.** Every unprefixed Tailwind utility is the mobile style; `sm:` / `md:` / `lg:` may only add. A component written desktop-first with `max-*` overrides is a defect. Design targets 375 / 768 / 1440.
- **Running prose never below 16px.** Paragraphs and any body copy stay at `text-base` (16px) or larger — smaller harms readability and triggers iOS input zoom. This floor does **not** apply to interface furniture: nav links and footer meta may use `text-sm` (14px), and eyebrow labels, column headings, the copyright line and the mandatory legal statement may use `text-xs` (12px). The letterspaced 12px uppercase label is a deliberate brand cue taken from the logobook, not an oversight — do not "fix" it.
- **Use `svh`, never `vh`,** for viewport-height sizing.
- **Copy rules.** Medical, ingredient, dosage, population and warning wording is copied **verbatim** from `data/tekstovi deklaracija/*.docx` — never paraphrased, never "improved", never softened. Any copy authored fresh is suffixed ` [REVIEW]`. Borderline claims inherited from `data/products.html` are carried as-is and marked ` [REVIEW]`, not rewritten.
- **Mandatory footer statement, both locales:** `Dodaci ishrani nisu zamena za raznovrsnu i uravnoteženu ishranu i zdrav način života.` Present on the five supplement declarations — URINORD is FSMP and carries a medical-supervision notice instead. Not optional, and not marked `[REVIEW]`.
- **Locales:** `sr` (default) and `en`. Latin script only. Routes are always prefixed.
- **Canonical host:** `https://nordogen.com`.
- Commit after every task. Conventional Commits.

## Prerequisites

- `pdftocairo` (poppler-utils) must be on PATH for Task 3. Verify with `pdftocairo -v`.
- A GitHub remote is **not** required to complete this plan — Keystatic runs in `local`
  mode throughout local development. It is required before the first Vercel deploy, which
  is Plan 2.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| `keystatic.config.ts` | Content schema; per-locale singleton instantiation |
| `src/keystatic/schema.ts` | Field-group factories shared across locales |
| `src/content/reader.ts` | `createReader` instance |
| `src/content/queries.ts` | Locale-keyed typed accessors (`getSiteChrome`, `getHome`, `getSettings`) |
| `src/i18n/locales.ts` | `Locale` type, `LOCALES`, `DEFAULT_LOCALE`, `isLocale` |
| `src/i18n/urls.ts` | `absoluteUrl`, `localeAlternates` |
| `src/components/brand/LogoMark.tsx` | Mark glyph, inline SVG, `currentColor` |
| `src/components/brand/LogoWordmark.tsx` | Wordmark glyph, inline SVG, `currentColor` |
| `src/components/brand/Logo.tsx` | Composes mark + wordmark + localised tagline |
| `src/components/layout/Header.tsx` | Mobile-first header shell |
| `src/components/layout/MobileNav.tsx` | Client component: disclosure panel |
| `src/components/layout/LanguageSwitcher.tsx` | Locale links preserving path |
| `src/components/layout/Footer.tsx` | Footer incl. mandatory statement |
| `src/components/ui/Section.tsx` | Section wrapper: padding, container, tone |
| `src/components/ui/Eyebrow.tsx` | Letterspaced uppercase label |
| `src/app/(site)/[locale]/layout.tsx` | **Root layout 1** — `<html lang={locale}>`, font, Header, Footer |
| `src/app/(site)/[locale]/page.tsx` | Home |
| `src/app/(admin)/keystatic/layout.tsx` | **Root layout 2** — `<html lang="en">`, admin only |
| `src/app/globals.css` | `@import "tailwindcss"` + `@theme` tokens |

**Why two route groups.** `(site)` and `(admin)` do not appear in URLs — `/sr`, `/en` and
`/keystatic` are unchanged, and the `●` SSG markers are identical either way (verified).
They exist because `[locale]/layout.tsx` is a root layout, so any route outside it has **no**
root layout at all: `/keystatic` would serve no doctype, no `<html>`, no `<head>` and no
`<body>` — just bare tags that browsers quirks-mode-repair, which is precisely why a
screenshot of the admin looks fine while the markup is invalid. Two route groups give each
branch its own root layout, Next's supported pattern for this case.
| `scripts/extract-logo.mjs` | PDF → two cleaned SVG files |
| `content/{sr,en}/…` | Keystatic-managed content |

---

### Task 1: Scaffold that builds

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `.gitignore` (already exists — verify contents)

**Interfaces:**
- Consumes: nothing.
- Produces: a working `npm run build`, `npm run dev`; Tailwind v4 pipeline active.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "nordogen",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "16.2.12",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "4.3.3",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "4.3.3",
    "typescript": "6.0.3"
  }
}
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: exits 0. If npm resolves `typescript` to 7.x, the pin was lost — fix `package.json` and reinstall.

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "incremental": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "paths": { "@/*": ["./src/*"] },
    "plugins": [{ "name": "next" }]
  },
  "include": ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `next.config.ts` with the root redirect**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/', destination: '/sr', permanent: true }]
  },
}

export default nextConfig
```

- [ ] **Step 5: Create `postcss.config.mjs`**

```js
export default { plugins: { '@tailwindcss/postcss': {} } }
```

- [ ] **Step 6: Create `src/app/globals.css` (tokens arrive in Task 2)**

```css
@import "tailwindcss";
```

- [ ] **Step 7: Create a temporary root layout and page to prove the pipeline**

`src/app/layout.tsx`:

```tsx
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

`src/app/page.tsx`:

```tsx
export default function Placeholder() {
  return <p className="underline">scaffold ok</p>
}
```

`underline` is deliberately a non-colour utility: it proves Tailwind is processing classes
without introducing a default-palette colour, which the Global Constraints forbid even in
throwaway markup.

Note: this root `page.tsx` is deleted in Task 4 once `[locale]` exists. It is here only so Step 8 has something to render.

- [ ] **Step 8: Verify the build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, then a route table. Must NOT contain a TypeScript compiler-API error.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next 16 + Tailwind 4 + TS 6"
```

---

### Task 2: Brand tokens and the Jost typeface

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/lib/fonts.ts`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: Task 1's Tailwind pipeline.
- Produces: `jost` (a `next/font` object exposing `.variable`); Tailwind colour utilities `brand-blue`, `brand-blue-tint`, `brand-teal`, `brand-teal-tint`, `brand-crimson`, `brand-crimson-tint`, `ink`, `surface`; font utility `font-sans`.

- [ ] **Step 1: Write `src/lib/fonts.ts`**

Jost substitutes for Cera Pro, which is commercially licensed and cannot be self-hosted. `latin-ext` is **required** — without it Serbian `š đ č ć ž` fall back and the page reflows.

```ts
import { Jost } from 'next/font/google'

export const jost = Jost({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
})
```

- [ ] **Step 2: Replace `src/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-brand-blue: #65A2BF;
  --color-brand-blue-tint: #B2D0DF;
  --color-brand-teal: #0E4750;
  --color-brand-teal-tint: #86A3A7;
  --color-brand-crimson: #B7404B;
  --color-brand-crimson-tint: #DB9FA5;
  --color-ink: #231F20;
  --color-surface: #F7FAFC;

  --font-sans: var(--font-jost), ui-sans-serif, system-ui, sans-serif;
}

@layer base {
  html {
    -webkit-text-size-adjust: 100%;
  }

  body {
    /* Guarantees the no-horizontal-overflow invariant globally. */
    overflow-x: clip;
    background-color: var(--color-surface);
    color: var(--color-ink);
    /* 16px floor: smaller triggers iOS input zoom. */
    font-size: 1rem;
    line-height: 1.7;
  }

  :focus-visible {
    outline: 2px solid var(--color-brand-blue);
    outline-offset: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Wire the font variable in the temporary `src/app/layout.tsx`**

```tsx
import './globals.css'
import { jost } from '@/lib/fonts'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={jost.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
```

Note: this file is **deleted** in Task 4. `<html lang>` must vary per locale, so `src/app/[locale]/layout.tsx` becomes the root layout and renders `<html>` itself. Reading the locale from `headers()` in a root layout would force every route to render dynamically and destroy static prerendering — verified, do not do it.

- [ ] **Step 4: Prove the tokens resolve**

Replace `src/app/page.tsx`:

```tsx
export default function TokenCheck() {
  return (
    <main className="p-8">
      <p className="bg-brand-teal text-surface p-4">teal on surface — šđčćž</p>
      <p className="text-brand-crimson">crimson — šđčćž</p>
    </main>
  )
}
```

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: build succeeds. Then `npm run dev`, open `http://localhost:3000/` and confirm the teal block, the crimson text, and that all five Serbian diacritics render in Jost rather than a fallback serif.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add brand tokens and Jost typeface

Jost substitutes for Cera Pro, which the logobook sourced from an
unlicensed site and which cannot legally be self-hosted. latin-ext
subset included so Serbian diacritics do not fall back."
```

---

### Task 3: Logo as recolourable SVG

**Files:**
- Create: `scripts/extract-logo.mjs`
- Create: `src/components/brand/LogoMark.tsx`, `src/components/brand/LogoWordmark.tsx`, `src/components/brand/Logo.tsx`
- Create: `public/brand/favicon-source.png`

**Interfaces:**
- Consumes: `data/nordogen logo 1 v1.pdf`.
- Produces: `<Logo orientation="stacked" | "horizontal" tagline={string} />`; `<LogoMark />`; `<LogoWordmark />`. All inherit colour via `currentColor`.

`data/nordogen logo 1 v1.pdf` is true vector and `pdftocairo -svg` flattens its text to paths (verified). The tagline is deliberately **discarded** from the artwork and re-rendered as live text so it can localise to `UROLOGY • GYNECOLOGY • REGENERATION`.

- [ ] **Step 1: Write the extraction script**

`scripts/extract-logo.mjs`:

```js
// Converts the vector logo PDF into two colour-agnostic SVG files.
// Run: node scripts/extract-logo.mjs --report      (inspect y-bands)
//      node scripts/extract-logo.mjs --split 0.62  (emit files)
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const PDF = 'data/nordogen logo 1 v1.pdf'
const TMP = 'node_modules/.cache/logo.svg'
const OUT = 'public/brand'

mkdirSync('node_modules/.cache', { recursive: true })
mkdirSync(OUT, { recursive: true })
execFileSync('pdftocairo', ['-svg', PDF, TMP])

const svg = readFileSync(TMP, 'utf8')

// Collect every drawn path with its vertical midpoint.
const items = []
for (const m of svg.matchAll(/<(path|use)\b[^>]*\/>/g)) {
  const tag = m[0]
  const nums = [...tag.matchAll(/-?\d+\.?\d*/g)].map((n) => Number(n[0]))
  if (!nums.length) continue
  items.push({ tag, y: nums.reduce((a, b) => a + b, 0) / nums.length })
}

const ys = items.map((i) => i.y)
const min = Math.min(...ys)
const max = Math.max(...ys)
const norm = (y) => (y - min) / (max - min)

if (process.argv.includes('--report')) {
  const buckets = Array.from({ length: 20 }, () => 0)
  for (const i of items) buckets[Math.min(19, Math.floor(norm(i.y) * 20))]++
  buckets.forEach((n, b) =>
    console.log(`${(b / 20).toFixed(2)}-${((b + 1) / 20).toFixed(2)}  ${'#'.repeat(n)} ${n}`),
  )
  process.exit(0)
}

const splitArg = process.argv.indexOf('--split')
if (splitArg === -1) throw new Error('pass --report or --split <0..1>')
const split = Number(process.argv[splitArg + 1])

const viewBox = svg.match(/viewBox="([^"]+)"/)[1]
const wrap = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor" ` +
  `stroke="currentColor" aria-hidden="true">${body}</svg>\n`

const strip = (t) => t.replace(/(fill|stroke)="(?!none)[^"]*"/g, '')

writeFileSync(
  `${OUT}/logo-mark.svg`,
  wrap(items.filter((i) => norm(i.y) < split).map((i) => strip(i.tag)).join('')),
)
writeFileSync(
  `${OUT}/logo-wordmark.svg`,
  wrap(items.filter((i) => norm(i.y) >= split).map((i) => strip(i.tag)).join('')),
)
console.log('wrote logo-mark.svg and logo-wordmark.svg')
```

- [ ] **Step 2: Inspect the y-band distribution**

Run: `node scripts/extract-logo.mjs --report`
Expected: two or three dense clusters — the mark (circle, mountain, leaf) high on the page, the wordmark below it, and possibly the tagline lowest. Note the gap between the mark cluster and the wordmark cluster.

- [ ] **Step 3: Emit the two SVGs using the gap you observed**

Run: `node scripts/extract-logo.mjs --split <value from Step 2>`
Expected: `wrote logo-mark.svg and logo-wordmark.svg`

- [ ] **Step 4: Verify the split visually — do not skip this**

`rsvg-convert`, ImageMagick and Inkscape are all absent in this environment. Use headless
Chrome, which is present and — verified — both rasterises SVG and resolves `currentColor`:

```bash
for f in logo-mark logo-wordmark; do
  timeout 60 google-chrome --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --screenshot="/tmp/$f.png" --window-size=600,600 \
    "file://$PWD/public/brand/$f.svg"
done
```

Then view `/tmp/logo-mark.png` and `/tmp/logo-wordmark.png` with the Read tool.

Expected: `logo-mark.png` shows the circle-with-mountain-and-leaf glyph and nothing else;
`logo-wordmark.png` shows the word `nordogen` and nothing else. If either contains
fragments of the other, or the `UROLOGIJA • GINEKOLOGIJA • REGENERACIJA` tagline appears in
the wordmark file, adjust `--split` and repeat.

The tagline **must not** survive into either SVG — it is re-rendered as live text in Step 6
so it can localise. If the wordmark file contains it, raise `--split` is not the fix; you
need a second threshold that also drops the lowest band. Report this if you hit it.

- [ ] **Step 5: Write the two glyph components**

Both read their SVG at build time so there is a single source of truth. `src/components/brand/LogoMark.tsx`:

```tsx
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const svg = readFileSync(join(process.cwd(), 'public/brand/logo-mark.svg'), 'utf8')

export function LogoMark({ className }: { className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />
}
```

`src/components/brand/LogoWordmark.tsx` is identical but reads `logo-wordmark.svg` and exports `LogoWordmark`.

`dangerouslySetInnerHTML` is safe here: the content is a build-time asset from our own repo, never user input.

- [ ] **Step 6: Write the composed logo**

`src/components/brand/Logo.tsx`:

```tsx
import { LogoMark } from './LogoMark'
import { LogoWordmark } from './LogoWordmark'

type Props = {
  tagline: string
  orientation?: 'stacked' | 'horizontal'
  className?: string
}

export function Logo({ tagline, orientation = 'horizontal', className }: Props) {
  const stacked = orientation === 'stacked'
  return (
    <span
      className={[
        'inline-flex items-center',
        stacked ? 'flex-col gap-2' : 'flex-row gap-2.5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <LogoMark className={stacked ? 'block w-16' : 'block w-9 shrink-0'} />
      <span className={stacked ? 'flex flex-col items-center' : 'flex flex-col'}>
        <LogoWordmark className="block w-32" />
        <span className="mt-1 text-[0.5rem] uppercase tracking-[0.16em]">{tagline}</span>
      </span>
    </span>
  )
}
```

- [ ] **Step 7: Save the favicon source**

```bash
cp "logos/nordogen1.png" public/brand/favicon-source.png
```

- [ ] **Step 8: Verify**

Render `<Logo tagline="UROLOGIJA • GINEKOLOGIJA • REGENERACIJA" />` inside `src/app/page.tsx`, wrapped in `text-brand-teal`, then in `text-brand-crimson`. Run `npm run dev` and confirm the logo recolours with the text colour — that proves `currentColor` survived Step 1's `strip`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: extract logo to recolourable SVG

Single vector source split into mark and wordmark, filled with
currentColor so all three brand colours and both lockups come from
one asset. Tagline is dropped from the artwork and rendered as live
text so it localises."
```

---

### Task 4: Locale routing

**Files:**
- Create: `src/i18n/locales.ts`, `src/i18n/urls.ts`
- Create: `src/i18n/locales.test.ts`, `src/i18n/urls.test.ts`
- Create: `src/app/(site)/[locale]/layout.tsx` (becomes a root layout), `src/app/(site)/[locale]/page.tsx`
- Delete: `src/app/layout.tsx`, `src/app/page.tsx`
- Modify: `package.json` (add vitest)

**Interfaces:**
- Consumes: Task 2's `jost`.
- Produces:
  - `LOCALES: readonly ['sr', 'en']`, `type Locale = 'sr' | 'en'`, `DEFAULT_LOCALE: Locale`, `isLocale(v: string): v is Locale`
  - `absoluteUrl(locale: Locale, path?: string): string`
  - `localeAlternates(path?: string): { languages: Record<string, string>; canonicalFor: (l: Locale) => string }`
  - Route `/[locale]` prerendered for both locales.

- [ ] **Step 1: Add vitest**

```bash
npm i -D vitest@4.1.10
```

- [ ] **Step 2: Write the failing tests**

`src/i18n/locales.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, LOCALES, isLocale } from './locales'

describe('locales', () => {
  it('exposes sr and en, sr first', () => {
    expect(LOCALES).toEqual(['sr', 'en'])
  })

  it('defaults to sr', () => {
    expect(DEFAULT_LOCALE).toBe('sr')
  })

  it('accepts known locales', () => {
    expect(isLocale('sr')).toBe(true)
    expect(isLocale('en')).toBe(true)
  })

  it('rejects unknown locales, including near-misses', () => {
    expect(isLocale('SR')).toBe(false)
    expect(isLocale('sr-Latn')).toBe(false)
    expect(isLocale('de')).toBe(false)
    expect(isLocale('')).toBe(false)
  })
})
```

`src/i18n/urls.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { absoluteUrl, localeAlternates } from './urls'

describe('absoluteUrl', () => {
  it('prefixes the locale', () => {
    expect(absoluteUrl('sr')).toBe('https://nordogen.com/sr')
    expect(absoluteUrl('en')).toBe('https://nordogen.com/en')
  })

  it('appends a path', () => {
    expect(absoluteUrl('sr', '/products')).toBe('https://nordogen.com/sr/products')
  })

  it('normalises a missing leading slash', () => {
    expect(absoluteUrl('sr', 'products')).toBe('https://nordogen.com/sr/products')
  })

  it('never emits a trailing slash', () => {
    expect(absoluteUrl('en', '/')).toBe('https://nordogen.com/en')
  })

  // The root-path case above passes even if trailing-slash stripping is broken,
  // because the `suffix === '/'` guard already reduces it to ''. This case is
  // what actually pins the stripping behaviour.
  it('strips a trailing slash from a multi-segment path', () => {
    expect(absoluteUrl('sr', '/products/')).toBe('https://nordogen.com/sr/products')
  })
})

describe('localeAlternates', () => {
  it('lists both locales plus x-default pointing at sr', () => {
    expect(localeAlternates('/about').languages).toEqual({
      sr: 'https://nordogen.com/sr/about',
      en: 'https://nordogen.com/en/about',
      'x-default': 'https://nordogen.com/sr/about',
    })
  })

  it('supplies the canonical for a given locale', () => {
    expect(localeAlternates('/about').canonicalFor('en')).toBe(
      'https://nordogen.com/en/about',
    )
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/i18n`
Expected: FAIL — `Failed to resolve import "./locales"`.

- [ ] **Step 4: Implement `src/i18n/locales.ts`**

```ts
export const LOCALES = ['sr', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'sr'

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}
```

- [ ] **Step 5: Implement `src/i18n/urls.ts`**

```ts
import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales'

export const SITE_ORIGIN = 'https://nordogen.com'

export function absoluteUrl(locale: Locale, path = ''): string {
  const suffix = path.replace(/^\/?/, '/').replace(/\/$/, '')
  return `${SITE_ORIGIN}/${locale}${suffix === '/' ? '' : suffix}`
}

export function localeAlternates(path = '') {
  const languages: Record<string, string> = {}
  for (const locale of LOCALES) languages[locale] = absoluteUrl(locale, path)
  languages['x-default'] = absoluteUrl(DEFAULT_LOCALE, path)

  return {
    languages,
    canonicalFor: (locale: Locale) => absoluteUrl(locale, path),
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/i18n`
Expected: PASS, 10 tests.

- [ ] **Step 7: Make the locale layout the root layout**

Delete the temporary root layout and page first — `app/layout.tsx` and `app/[locale]/layout.tsx` cannot both be root layouts:

```bash
rm src/app/layout.tsx src/app/page.tsx
```

Create `src/app/(site)/[locale]/layout.tsx`. It renders `<html>` itself, so `lang` comes straight from the route param with no request-time lookup and every page stays statically prerendered. In Next 16 `params` is a Promise and must be awaited.

```tsx
import '../../globals.css'
import { notFound } from 'next/navigation'
import { jost } from '@/lib/fonts'
import { LOCALES, isLocale } from '@/i18n/locales'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <html lang={locale} className={jost.variable}>
      <body className="flex min-h-[100svh] flex-col font-sans antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 8: Create a temporary Home**

`src/app/(site)/[locale]/page.tsx`:

```tsx
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <main className="p-8">locale: {locale}</main>
}
```

- [ ] **Step 9: Verify routing and prerendering**

Run: `npm run build`

Expected route table — the `●` marker is the acceptance criterion, since `ƒ` would mean prerendering was lost:

```
├ ● /[locale]
│ ├ /sr
│ └ /en
```

Run: `npm run dev`, then check:
- `http://localhost:3000/sr` → `locale: sr`
- `http://localhost:3000/en` → `locale: en`
- `http://localhost:3000/` → redirects to `/sr`
- `http://localhost:3000/de` → 404

Then confirm the prerendered HTML carries the right attribute:

```bash
npm run build && npx next start -p 3000 &
sleep 5
curl -s localhost:3000/sr | grep -o 'lang="[a-z]*"' | head -1   # expect lang="sr"
curl -s localhost:3000/en | grep -o 'lang="[a-z]*"' | head -1   # expect lang="en"
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add locale routing for sr and en

Prefixed routes with sr as default; no i18n library. hreflang helper
emits x-default pointing at sr."
```

---

### Task 5: Keystatic content backbone

**Files:**
- Create: `keystatic.config.ts`, `src/keystatic/schema.ts`
- Create: `src/app/(admin)/keystatic/layout.tsx`, `src/app/(admin)/keystatic/[[...params]]/page.tsx`, `src/app/api/keystatic/[...params]/route.ts`
- Move: `src/app/[locale]/` → `src/app/(site)/[locale]/`
- Create: `src/content/reader.ts`, `src/content/queries.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `Locale` from Task 4.
- Produces:
  - `getSettings(): Promise<Settings>`
  - `getSiteChrome(locale: Locale): Promise<SiteChrome>`
  - `getHome(locale: Locale): Promise<Home>`
  - Admin UI at `/keystatic`.

- [ ] **Step 1: Install Keystatic**

```bash
npm i @keystatic/core@0.6.3 @keystatic/next@5.0.4
```

- [ ] **Step 2: Write the shared schema factories**

`src/keystatic/schema.ts`. Labels are what the non-technical editor reads, so they are written for that reader, not for a developer.

```ts
import { fields } from '@keystatic/core'

export function siteChromeSchema() {
  return {
    navHome: fields.text({ label: 'Menu: Home' }),
    navProducts: fields.text({ label: 'Menu: Products' }),
    navAbout: fields.text({ label: 'Menu: About' }),
    navContact: fields.text({ label: 'Menu: Contact' }),
    logoTagline: fields.text({
      label: 'Tagline under the logo',
      description: 'Shown in small capitals. Example: UROLOGIJA • GINEKOLOGIJA • REGENERACIJA',
    }),
    menuOpenLabel: fields.text({ label: 'Accessibility: "open menu" button' }),
    menuCloseLabel: fields.text({ label: 'Accessibility: "close menu" button' }),
    skipToContent: fields.text({ label: 'Accessibility: "skip to content" link' }),
    footerTagline: fields.text({ label: 'Footer: short description', multiline: true }),
    footerCompanyHeading: fields.text({ label: 'Footer: company column heading' }),
    footerLegalHeading: fields.text({ label: 'Footer: legal column heading' }),
    footerProductsHeading: fields.text({ label: 'Footer: products column heading' }),
    supplementDisclaimer: fields.text({
      label: 'Legally required supplement statement',
      description:
        'REQUIRED BY LAW. Do not delete or reword. Serbian text is fixed by regulation.',
      multiline: true,
    }),
    copyright: fields.text({ label: 'Footer: copyright line' }),
  }
}

export function homeSchema() {
  return {
    heroEyebrow: fields.text({ label: 'Hero: small label above the headline' }),
    heroHeading: fields.text({ label: 'Hero: main headline', multiline: true }),
    heroBody: fields.text({ label: 'Hero: paragraph', multiline: true }),
    heroPrimaryCta: fields.text({ label: 'Hero: main button text' }),
    heroSecondaryCta: fields.text({ label: 'Hero: second button text' }),
    aboutEyebrow: fields.text({ label: 'About block: small label' }),
    aboutHeading: fields.text({ label: 'About block: heading', multiline: true }),
    aboutBody: fields.text({ label: 'About block: paragraph', multiline: true }),
    aboutCta: fields.text({ label: 'About block: link text' }),
    productsEyebrow: fields.text({ label: 'Products block: small label' }),
    productsHeading: fields.text({ label: 'Products block: heading', multiline: true }),
    productsBody: fields.text({ label: 'Products block: paragraph', multiline: true }),
    scienceEyebrow: fields.text({ label: 'Science block: small label' }),
    scienceHeading: fields.text({ label: 'Science block: heading', multiline: true }),
    scienceBody: fields.text({ label: 'Science block: paragraph', multiline: true }),
    scienceCta: fields.text({ label: 'Science block: link text' }),
    metaTitle: fields.text({ label: 'Search engines: page title' }),
    metaDescription: fields.text({
      label: 'Search engines: page description',
      description: 'Aim for 150 characters or fewer.',
      multiline: true,
    }),
  }
}
```

- [ ] **Step 3: Write `keystatic.config.ts`**

Locale is encoded in the singleton *path*, and both singletons share one schema factory — so the two locales cannot structurally drift.

```ts
import { config, singleton } from '@keystatic/core'
import { homeSchema, siteChromeSchema } from './src/keystatic/schema'
import { fields } from '@keystatic/core'

// Local storage is dev-only: under `next start` Keystatic renders blank by
// design, because local mode writes to the filesystem. Production uses github.
//
// Switch on the presence of GitHub credentials, NOT on NODE_ENV. Keying off
// NODE_ENV makes `next build` select github storage, and Keystatic's route
// handler then hard-fails the build with "Missing required config in Keystatic
// API setup" unless KEYSTATIC_GITHUB_CLIENT_ID, KEYSTATIC_GITHUB_CLIENT_SECRET
// and KEYSTATIC_SECRET are all set — so the project could not build at all
// before the GitHub app exists. Presence-based detection builds fine without
// credentials and upgrades itself once Vercel supplies them.
const storage = process.env.KEYSTATIC_GITHUB_CLIENT_ID
  ? ({
      kind: 'github',
      repo: {
        owner: process.env.KEYSTATIC_GITHUB_OWNER ?? 'nordogen',
        name: process.env.KEYSTATIC_GITHUB_REPO ?? 'nordogen',
      },
    } as const)
  : ({ kind: 'local' } as const)

export default config({
  storage,
  ui: {
    brand: { name: 'NORDOGEN' },
    navigation: {
      'Serbian / Srpski': ['homeSr', 'siteChromeSr'],
      English: ['homeEn', 'siteChromeEn'],
      Settings: ['settings'],
    },
  },
  singletons: {
    settings: singleton({
      label: 'Company details',
      path: 'content/settings',
      format: { data: 'json' },
      schema: {
        legalName: fields.text({ label: 'Registered company name' }),
        street: fields.text({ label: 'Street address' }),
        city: fields.text({ label: 'City' }),
        country: fields.text({ label: 'Country' }),
        email: fields.text({ label: 'Contact email' }),
        manufacturer: fields.text({ label: 'Contract manufacturer' }),
      },
    }),
    siteChromeSr: singleton({
      label: 'Menus and footer (Serbian)',
      path: 'content/sr/site-chrome',
      format: { data: 'json' },
      schema: siteChromeSchema(),
    }),
    siteChromeEn: singleton({
      label: 'Menus and footer (English)',
      path: 'content/en/site-chrome',
      format: { data: 'json' },
      schema: siteChromeSchema(),
    }),
    homeSr: singleton({
      label: 'Home page (Serbian)',
      path: 'content/sr/home',
      format: { data: 'json' },
      schema: homeSchema(),
    }),
    homeEn: singleton({
      label: 'Home page (English)',
      path: 'content/en/home',
      format: { data: 'json' },
      schema: homeSchema(),
    }),
  },
})
```

Before the first Vercel deploy, create a Keystatic GitHub app and set all five environment
variables there: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`,
`KEYSTATIC_SECRET`, `KEYSTATIC_GITHUB_OWNER`, `KEYSTATIC_GITHUB_REPO`. Local development
needs none of them — with `KEYSTATIC_GITHUB_CLIENT_ID` unset the config falls back to
`local` storage and the build succeeds.

- [ ] **Step 4: Create the admin page — `'use client'` is mandatory**

First `src/app/(admin)/keystatic/layout.tsx` — the admin branch's own root layout, without
which `/keystatic` serves no `<html>`/`<body>` at all:

```tsx
import '../../globals.css'

export default function KeystaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

`lang="en"` is correct here: Keystatic's own interface is English regardless of which
locale's content is being edited.

Then `src/app/(admin)/keystatic/[[...params]]/page.tsx`:

```tsx
'use client'
import { makePage } from '@keystatic/next/ui/app'
import config from '../../../../../keystatic.config'

export default makePage(config)
```

**Do not remove `'use client'`.** `@keystatic/core/ui` ships a `react-server` conditional export whose `Keystatic` component returns `null`. Without the directive Next resolves that stub and `/keystatic` renders a **blank page with HTTP 200 and no console errors** — verified by spike, and effectively undebuggable if you do not know the cause.

- [ ] **Step 5: Create the route handler**

`src/app/api/keystatic/[...params]/route.ts`:

```ts
import { makeRouteHandler } from '@keystatic/next/route-handler'
import config from '../../../../../keystatic.config'

export const { POST, GET } = makeRouteHandler({ config })
```

- [ ] **Step 6: Create the reader and typed queries**

`src/content/reader.ts`:

```ts
import { createReader } from '@keystatic/core/reader'
import config from '../../keystatic.config'

export const reader = createReader(process.cwd(), config)
```

`src/content/queries.ts`. An explicit map keeps this fully typed — string-built singleton keys would not be.

```ts
import type { Locale } from '@/i18n/locales'
import { reader } from './reader'

const SITE_CHROME = {
  sr: reader.singletons.siteChromeSr,
  en: reader.singletons.siteChromeEn,
} as const

const HOME = {
  sr: reader.singletons.homeSr,
  en: reader.singletons.homeEn,
} as const

function required<T>(value: T | null, what: string): T {
  if (value === null) throw new Error(`Missing content: ${what}`)
  return value
}

export async function getSettings() {
  return required(await reader.singletons.settings.read(), 'content/settings')
}

export async function getSiteChrome(locale: Locale) {
  return required(await SITE_CHROME[locale].read(), `content/${locale}/site-chrome`)
}

export async function getHome(locale: Locale) {
  return required(await HOME[locale].read(), `content/${locale}/home`)
}
```

Failing loudly beats rendering a page full of blank strings — a missing file becomes a build error, not a silently empty section.

- [ ] **Step 7: Verify the admin actually renders**

Run: `npm run dev`, open `http://localhost:3000/keystatic`.
Expected: the Keystatic dashboard with a sidebar containing `Serbian / Srpski`, `English`, `Settings`. **A blank white page means `'use client'` is missing from Step 4.**

- [ ] **Step 8: Create the five content files on disk**

Keystatic reads and writes plain JSON, so write the files directly — every key from the
schema must be present, or `getSiteChrome`/`getHome` will surface a missing field. Real
copy lands in Task 9; these are structural stubs.

```bash
mkdir -p content/sr content/en
node --input-type=module -e "
import { writeFileSync } from 'node:fs'
const chromeKeys = ['navHome','navProducts','navAbout','navContact','logoTagline',
  'menuOpenLabel','menuCloseLabel','skipToContent','footerTagline','footerCompanyHeading',
  'footerLegalHeading','footerProductsHeading','supplementDisclaimer','copyright']
const homeKeys = ['heroEyebrow','heroHeading','heroBody','heroPrimaryCta','heroSecondaryCta',
  'aboutEyebrow','aboutHeading','aboutBody','aboutCta','productsEyebrow','productsHeading',
  'productsBody','scienceEyebrow','scienceHeading','scienceBody','scienceCta',
  'metaTitle','metaDescription']
const stub = (keys) => JSON.stringify(Object.fromEntries(keys.map(k => [k, k])), null, 2) + '\n'
writeFileSync('content/settings.json', JSON.stringify({
  legalName:'NORDOGEN d.o.o.', street:'Mileševska 24/9', city:'Beograd',
  country:'Republika Srbija', email:'info@nordogen.com',
  manufacturer:'ELEPHANT PHARMA d.o.o., Beograd, Republika Srbija',
}, null, 2) + '\n')
for (const l of ['sr','en']) {
  writeFileSync(\`content/\${l}/site-chrome.json\`, stub(chromeKeys))
  writeFileSync(\`content/\${l}/home.json\`, stub(homeKeys))
}
console.log('wrote 5 content files')
"
```

Then confirm Keystatic round-trips them: with `npm run dev` running, open
`http://localhost:3000/keystatic`, open `Home page (Serbian)`, and check the fields are
populated. If a field shows as empty, its key is missing from the stub or misspelled
relative to `homeSchema()`.

- [ ] **Step 9: Verify the build reads content**

Run: `npm run build`
Expected: succeeds. If it throws `Missing content: …`, the corresponding file was not saved in Step 8.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add Keystatic content backbone

Per-locale singletons share one schema factory so the locales cannot
structurally drift. Admin page requires 'use client': the react-server
export of @keystatic/core/ui is a stub returning null, which renders a
blank 200 with no errors."
```

---

### Task 6: Mobile-first Header

**Files:**
- Create: `src/components/layout/Header.tsx`, `src/components/layout/MobileNav.tsx`, `src/components/layout/LanguageSwitcher.tsx`, `src/components/ui/Container.tsx`
- Modify: `src/app/(site)/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `getSiteChrome`, `Logo`, `Locale`, `LOCALES`.
- Produces: `<Header locale={Locale} />`; `<Container>`; `type NavItem = { href: string; label: string }`.

Mobile gets a logo plus a disclosure button opening a full-screen panel. The old `data/style.css` used a horizontally scrolling nav strip that hid items with no affordance — it is deliberately not reproduced.

- [ ] **Step 1: Write the container**

`src/components/ui/Container.tsx`:

```tsx
export function Container({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={['mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Write the language switcher**

`src/components/layout/LanguageSwitcher.tsx`. Each link carries `hrefLang`, and `min-h-11 min-w-11` enforces the 44px touch target.

```tsx
import Link from 'next/link'
import { LOCALES, type Locale } from '@/i18n/locales'

const LABEL: Record<Locale, string> = { sr: 'SR', en: 'EN' }

export function LanguageSwitcher({
  locale,
  path,
}: {
  locale: Locale
  path: string
}) {
  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((target) => {
        const active = target === locale
        return (
          <Link
            key={target}
            href={`/${target}${path}`}
            hrefLang={target}
            aria-current={active ? 'true' : undefined}
            className={[
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-medium',
              active ? 'bg-brand-teal text-white' : 'text-brand-teal hover:bg-brand-blue-tint/40',
            ].join(' ')}
          >
            {LABEL[target]}
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Write the mobile nav panel**

`src/components/layout/MobileNav.tsx` — the only stateful client component in the site.

```tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export type NavItem = { href: string; label: string }

export function MobileNav({
  items,
  openLabel,
  closeLabel,
}: {
  items: NavItem[]
  openLabel: string
  closeLabel: string
}) {
  const [open, setOpen] = useState(false)

  // Prevent the page scrolling behind the open panel.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={openLabel}
        aria-expanded={open}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-brand-teal"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface">
          <div className="flex items-center justify-end px-5 py-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={closeLabel}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-brand-teal"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-5">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center border-b border-brand-blue-tint/40 text-lg font-medium text-brand-teal"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Write the header**

`src/components/layout/Header.tsx`:

```tsx
import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import { getSiteChrome } from '@/content/queries'
import type { Locale } from '@/i18n/locales'
import { MobileNav, type NavItem } from './MobileNav'
import { LanguageSwitcher } from './LanguageSwitcher'

export async function Header({ locale }: { locale: Locale }) {
  const chrome = await getSiteChrome(locale)

  const items: NavItem[] = [
    { href: `/${locale}`, label: chrome.navHome },
    { href: `/${locale}/products`, label: chrome.navProducts },
    { href: `/${locale}/about`, label: chrome.navAbout },
    { href: `/${locale}/contact`, label: chrome.navContact },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-brand-blue-tint/40 bg-surface/90 backdrop-blur">
      <Container className="flex min-h-16 items-center justify-between gap-3 lg:min-h-20">
        <Link href={`/${locale}`} className="text-brand-blue">
          <Logo tagline={chrome.logoTagline} orientation="horizontal" />
        </Link>

        {/* No aria-label: only one nav is in the a11y tree per breakpoint (the
            other is display:none), so there is nothing to disambiguate and an
            unlabelled <nav> announces correctly as "navigation". Labelling it
            with a link's text would misname the landmark. */}
        <nav className="hidden lg:flex lg:items-center lg:gap-7">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brand-teal hover:text-brand-blue"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher locale={locale} path="" />
          <MobileNav
            items={items}
            openLabel={chrome.menuOpenLabel}
            closeLabel={chrome.menuCloseLabel}
          />
        </div>
      </Container>
    </header>
  )
}
```

- [ ] **Step 5: Mount it with a skip link**

Modify `src/app/(site)/[locale]/layout.tsx`. It remains a root layout, so it keeps rendering
`<html>` and `<body>`:

```tsx
import '../../globals.css'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { jost } from '@/lib/fonts'
import { getSiteChrome } from '@/content/queries'
import { LOCALES, isLocale } from '@/i18n/locales'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const chrome = await getSiteChrome(locale)

  return (
    <html lang={locale} className={jost.variable}>
      <body className="flex min-h-[100svh] flex-col font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-brand-teal focus:px-4 focus:py-2 focus:text-white"
        >
          {chrome.skipToContent}
        </a>
        <Header locale={locale} />
        <main id="main" className="flex-1">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Verify at 375px — this is the acceptance criterion**

Run `npm run dev`, open `/sr` in a 375px-wide viewport, and confirm:
- no horizontal scrollbar
- the hamburger opens a full-screen panel; Escape and the close button both dismiss it
- the page behind the panel does not scroll
- `SR`/`EN` remain reachable without opening the panel
- every tap target is at least 44px tall
- at ≥1024px the inline nav appears and the hamburger disappears

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add mobile-first header

Disclosure panel on small screens rather than the horizontally
scrolling nav strip of the old markup, which hid items with no
affordance. 44px minimum tap targets throughout."
```

---

### Task 7: Footer with the mandatory statement

**Files:**
- Create: `src/components/layout/Footer.tsx`
- Modify: `src/app/(site)/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `getSiteChrome`, `getSettings`, `Logo`, `Container`.
- Produces: `<Footer locale={Locale} />`.

- [ ] **Step 1: Write the footer**

`src/components/layout/Footer.tsx`. Column count climbs 1 → 2 → 4.

```tsx
import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import { getSettings, getSiteChrome } from '@/content/queries'
import type { Locale } from '@/i18n/locales'

export async function Footer({ locale }: { locale: Locale }) {
  const [chrome, settings] = await Promise.all([getSiteChrome(locale), getSettings()])

  return (
    <footer className="mt-16 bg-brand-teal text-white/85">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="text-white">
            <Logo tagline={chrome.logoTagline} orientation="horizontal" />
          </div>
          <p className="mt-4 max-w-xs text-sm">{chrome.footerTagline}</p>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-white">
            {chrome.footerCompanyHeading}
          </h2>
          <ul className="mt-4 space-y-1 text-sm">
            <li>
              <Link href={`/${locale}/about`} className="inline-flex min-h-11 items-center hover:text-white">
                {chrome.navAbout}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/contact`} className="inline-flex min-h-11 items-center hover:text-white">
                {chrome.navContact}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-white">
            {chrome.footerProductsHeading}
          </h2>
          <ul className="mt-4 space-y-1 text-sm">
            <li>
              <Link href={`/${locale}/products`} className="inline-flex min-h-11 items-center hover:text-white">
                {chrome.navProducts}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-white">
            {chrome.footerLegalHeading}
          </h2>
          <address className="mt-4 text-sm not-italic">
            {settings.legalName}
            <br />
            {settings.street}
            <br />
            {settings.city}, {settings.country}
            <br />
            <a href={`mailto:${settings.email}`} className="inline-flex min-h-11 items-center hover:text-white">
              {settings.email}
            </a>
          </address>
        </div>
      </Container>

      <div className="border-t border-white/15">
        <Container className="flex flex-col gap-3 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          {/* Legally mandated statement — on the five supplement declarations. */}
          <p className="max-w-2xl">{chrome.supplementDisclaimer}</p>
          <p className="shrink-0">{chrome.copyright}</p>
        </Container>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Mount it**

In `src/app/(site)/[locale]/layout.tsx`, add `import { Footer } from '@/components/layout/Footer'`
and place `<Footer locale={locale} />` immediately after `</main>`, still inside `<body>`.

- [ ] **Step 3: Verify**

Run `npm run build`, then `npm run dev` and check `/sr` and `/en`:
- at 375px the footer is a single column with no horizontal scroll
- at 768px it is two columns; at 1280px, four
- the mandatory supplement statement is visible on both locales
- the email is a working `mailto:` link

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add footer with legally required supplement statement"
```

---

### Task 8: Home page

**Files:**
- Create: `src/components/ui/Eyebrow.tsx`, `src/components/ui/Section.tsx`, `src/components/ui/Button.tsx`, `src/components/brand/ArcMotif.tsx`
- Modify: `src/app/(site)/[locale]/page.tsx`

**Interfaces:**
- Consumes: `getHome`, `Container`, `Locale`, `localeAlternates`.
- Produces: `<Eyebrow>`, `<Section tone="surface" | "teal" | "tint">`, `<Button href variant="primary" | "secondary" | "light">`, `<ArcMotif />`; Home with localised metadata.

There is no photography. The visual system is built from the mark's own geometry instead — for a medical brand that reads as considered rather than as filler.

- [ ] **Step 1: Write the primitives**

`src/components/ui/Eyebrow.tsx`. The `tone` prop exists because the teal section needs a
lighter eyebrow for contrast — without it that one instance has to hand-duplicate this
markup, and any later change to tracking, size or weight silently misses it. Mirrors
`Section`'s `tone` API for consistency.

```tsx
const TONE = {
  blue: 'text-brand-blue',
  tint: 'text-brand-blue-tint',
} as const

export function Eyebrow({
  children,
  tone = 'blue',
}: {
  children: React.ReactNode
  tone?: keyof typeof TONE
}) {
  return (
    <p className={`text-xs font-medium uppercase tracking-[0.16em] ${TONE[tone]}`}>{children}</p>
  )
}
```

`src/components/ui/Section.tsx`:

```tsx
import { Container } from './Container'

const TONE = {
  surface: 'bg-surface text-ink',
  tint: 'bg-brand-blue-tint/25 text-ink',
  teal: 'bg-brand-teal text-white',
} as const

export function Section({
  children,
  tone = 'surface',
  className,
}: {
  children: React.ReactNode
  tone?: keyof typeof TONE
  className?: string
}) {
  return (
    <section className={[TONE[tone], 'relative overflow-hidden py-16 sm:py-20 lg:py-28', className].filter(Boolean).join(' ')}>
      <Container>{children}</Container>
    </section>
  )
}
```

`src/components/ui/Button.tsx`:

```tsx
import Link from 'next/link'

const VARIANT = {
  primary: 'bg-brand-blue text-white hover:bg-brand-teal',
  secondary: 'border border-brand-teal text-brand-teal hover:bg-brand-blue-tint/30',
  light: 'bg-white text-brand-teal hover:bg-brand-blue-tint',
} as const

export function Button({
  href,
  children,
  variant = 'primary',
}: {
  href: string
  children: React.ReactNode
  variant?: keyof typeof VARIANT
}) {
  return (
    <Link
      href={href}
      className={[
        'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors',
        VARIANT[variant],
      ].join(' ')}
    >
      {children}
    </Link>
  )
}
```

- [ ] **Step 2: Write the arc motif**

`src/components/brand/ArcMotif.tsx` — concentric thin rings echoing the logobook, replacing photography.

```tsx
export function ArcMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="200" cy="200" r="196" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="152" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="108" strokeWidth="1.5" />
      <path d="M92 236 L168 132 L228 214 L268 168 L308 236" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
```

- [ ] **Step 3: Write the Home page**

Replace `src/app/(site)/[locale]/page.tsx`. Mobile-first: the hero is content-driven with `min-h`, never a fixed `vh`.

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArcMotif } from '@/components/brand/ArcMotif'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Section } from '@/components/ui/Section'
import { getHome } from '@/content/queries'
import { isLocale } from '@/i18n/locales'
import { localeAlternates } from '@/i18n/urls'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const home = await getHome(locale)
  const alternates = localeAlternates('')

  return {
    title: home.metaTitle,
    description: home.metaDescription,
    alternates: {
      canonical: alternates.canonicalFor(locale),
      languages: alternates.languages,
    },
  }
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const home = await getHome(locale)

  return (
    <>
      <Section tone="tint" className="min-h-[70svh]">
        <ArcMotif className="pointer-events-none absolute -right-24 -top-24 w-72 text-brand-blue/20 sm:w-96 lg:-right-16 lg:w-[32rem]" />
        <div className="relative max-w-2xl">
          <Eyebrow>{home.heroEyebrow}</Eyebrow>
          <h1 className="mt-4 text-[clamp(2rem,7vw,3.5rem)] font-medium leading-[1.1] text-brand-teal">
            {home.heroHeading}
          </h1>
          <p className="mt-5 text-base text-ink/80 sm:text-lg">{home.heroBody}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={`/${locale}/products`}>{home.heroPrimaryCta}</Button>
            <Button href={`/${locale}/about`} variant="secondary">
              {home.heroSecondaryCta}
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <Eyebrow>{home.aboutEyebrow}</Eyebrow>
            <h2 className="mt-4 text-[clamp(1.5rem,4vw,2.25rem)] font-medium leading-tight text-brand-teal">
              {home.aboutHeading}
            </h2>
            <p className="mt-4 text-ink/80">{home.aboutBody}</p>
            <div className="mt-6">
              <Button href={`/${locale}/about`} variant="secondary">
                {home.aboutCta}
              </Button>
            </div>
          </div>
          <div className="order-first flex justify-center text-brand-blue lg:order-last">
            <ArcMotif className="w-48 sm:w-64 lg:w-full lg:max-w-sm" />
          </div>
        </div>
      </Section>

      <Section tone="tint">
        <div className="max-w-2xl">
          <Eyebrow>{home.productsEyebrow}</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.5rem,4vw,2.25rem)] font-medium leading-tight text-brand-teal">
            {home.productsHeading}
          </h2>
          <p className="mt-4 text-ink/80">{home.productsBody}</p>
        </div>
        {/* The product grid arrives with the products collection in Plan 2. */}
      </Section>

      <Section tone="teal">
        <ArcMotif className="pointer-events-none absolute -left-28 bottom-[-6rem] w-72 text-white/10 sm:w-96" />
        <div className="relative max-w-2xl">
          <Eyebrow tone="tint">{home.scienceEyebrow}</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.5rem,4vw,2.25rem)] font-medium leading-tight">
            {home.scienceHeading}
          </h2>
          <p className="mt-4 text-white/85">{home.scienceBody}</p>
          <div className="mt-8">
            <Button href={`/${locale}/contact`} variant="light">
              {home.scienceCta}
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
```

- [ ] **Step 4: Verify heading hierarchy and responsiveness**

Run `npm run build`, then `npm run dev`. At 375, 768 and 1440 confirm on both `/sr` and `/en`:
- exactly one `<h1>`, and no heading level is skipped
- no horizontal scrollbar at any width
- the arc motifs never cause overflow (they are clipped by `Section`'s `overflow-hidden`)
- the hero buttons stack on mobile and sit side by side from `sm`
- `curl -s localhost:3000/sr | grep -o '<link rel="alternate"[^>]*>'` shows `hreflang` entries for `sr`, `en` and `x-default`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add home page

Visual system built from the mark's own geometry; no photography
exists and stock imagery reads as filler on a medical brand."
```

---

### Task 9: Real bilingual copy

**Files:**
- Modify: `content/settings.json`, `content/sr/site-chrome.json`, `content/en/site-chrome.json`, `content/sr/home.json`, `content/en/home.json`

**Interfaces:**
- Consumes: Task 5's schema.
- Produces: content files carrying real copy, with every authored sentence marked ` [REVIEW]`.

Company facts come from the declarations and are **not** marked — they are established fact, not draft copy. Every marketing sentence is authored and therefore **is** marked.

- [ ] **Step 1: Fill `content/settings.json`**

```json
{
  "legalName": "NORDOGEN d.o.o.",
  "street": "Mileševska 24/9",
  "city": "Beograd",
  "country": "Republika Srbija",
  "email": "info@nordogen.com",
  "manufacturer": "ELEPHANT PHARMA d.o.o., Beograd, Republika Srbija"
}
```

- [ ] **Step 2: Fill `content/sr/site-chrome.json`**

`supplementDisclaimer` is copied verbatim from the declarations and carries no marker.

```json
{
  "navHome": "Početna",
  "navProducts": "Proizvodi",
  "navAbout": "O nama",
  "navContact": "Kontakt",
  "logoTagline": "UROLOGIJA • GINEKOLOGIJA • REGENERACIJA",
  "menuOpenLabel": "Otvori meni",
  "menuCloseLabel": "Zatvori meni",
  "skipToContent": "Pređi na sadržaj",
  "footerTagline": "Dodaci ishrani iz oblasti urologije, ginekologije i regeneracije. [REVIEW]",
  "footerCompanyHeading": "Kompanija",
  "footerLegalHeading": "Kontakt podaci",
  "footerProductsHeading": "Proizvodi",
  "supplementDisclaimer": "Dodaci ishrani nisu zamena za raznovrsnu i uravnoteženu ishranu i zdrav način života.",
  "copyright": "© 2026 NORDOGEN d.o.o."
}
```

- [ ] **Step 3: Fill `content/en/site-chrome.json`**

The Serbian statement is reproduced alongside its English rendering, because the Serbian wording is the regulated one.

```json
{
  "navHome": "Home",
  "navProducts": "Products",
  "navAbout": "About",
  "navContact": "Contact",
  "logoTagline": "UROLOGY • GYNECOLOGY • REGENERATION",
  "menuOpenLabel": "Open menu",
  "menuCloseLabel": "Close menu",
  "skipToContent": "Skip to content",
  "footerTagline": "Food supplements in urology, gynaecology and regeneration. [REVIEW]",
  "footerCompanyHeading": "Company",
  "footerLegalHeading": "Contact details",
  "footerProductsHeading": "Products",
  "supplementDisclaimer": "Food supplements are not a substitute for a varied and balanced diet and a healthy lifestyle. / Dodaci ishrani nisu zamena za raznovrsnu i uravnoteženu ishranu i zdrav način života.",
  "copyright": "© 2026 NORDOGEN d.o.o."
}
```

- [ ] **Step 4: Fill `content/sr/home.json`**

```json
{
  "heroEyebrow": "UROLOGIJA • GINEKOLOGIJA • REGENERACIJA",
  "heroHeading": "Ciljane formulacije za jasno definisane potrebe [REVIEW]",
  "heroBody": "NORDOGEN razvija dodatke ishrani iz oblasti urologije, ginekologije i regeneracije, sa pažljivo odabranim sastojcima i jasno određenom namenom. [REVIEW]",
  "heroPrimaryCta": "Pogledajte proizvode",
  "heroSecondaryCta": "O nama",
  "aboutEyebrow": "O NORDOGENU",
  "aboutHeading": "Jasnoća, čistoća i precizna namena [REVIEW]",
  "aboutBody": "Naše formulacije nastaju oko sastojaka sa jasnom fiziološkom svrhom i preciznim doziranjem. Svaki proizvod ima definisanu namenu i grupu kojoj je namenjen. [REVIEW]",
  "aboutCta": "Više o nama",
  "productsEyebrow": "PROIZVODI",
  "productsHeading": "Šest formulacija, svaka sa jasnom namenom [REVIEW]",
  "productsBody": "Asortiman obuhvata dodatke ishrani i dijetetski proizvod za posebne medicinske namene. [REVIEW]",
  "scienceEyebrow": "SASTAV I KVALITET",
  "scienceHeading": "Standardizovani ekstrakti i precizne doze [REVIEW]",
  "scienceBody": "Koristimo standardizovane biljne ekstrakte i sastojke sa deklarisanim količinama, proizvedene u saradnji sa domaćim proizvođačem. [REVIEW]",
  "scienceCta": "Kontaktirajte nas",
  "metaTitle": "NORDOGEN — dodaci ishrani za urologiju, ginekologiju i regeneraciju",
  "metaDescription": "NORDOGEN razvija dodatke ishrani iz oblasti urologije, ginekologije i regeneracije. Pogledajte sastav i namenu svakog proizvoda. [REVIEW]"
}
```

- [ ] **Step 5: Fill `content/en/home.json`**

```json
{
  "heroEyebrow": "UROLOGY • GYNECOLOGY • REGENERATION",
  "heroHeading": "Targeted formulations for clearly defined needs [REVIEW]",
  "heroBody": "NORDOGEN develops food supplements in urology, gynaecology and regeneration, built around carefully selected ingredients with a clearly defined purpose. [REVIEW]",
  "heroPrimaryCta": "View products",
  "heroSecondaryCta": "About us",
  "aboutEyebrow": "ABOUT NORDOGEN",
  "aboutHeading": "Clarity, purity and a precise purpose [REVIEW]",
  "aboutBody": "Our formulations are built around ingredients with a clear physiological purpose and precise dosing. Every product has a defined purpose and a defined population. [REVIEW]",
  "aboutCta": "More about us",
  "productsEyebrow": "PRODUCTS",
  "productsHeading": "Six formulations, each with a clear purpose [REVIEW]",
  "productsBody": "The range covers food supplements and one dietary product for special medical purposes. [REVIEW]",
  "scienceEyebrow": "COMPOSITION AND QUALITY",
  "scienceHeading": "Standardised extracts, precise doses [REVIEW]",
  "scienceBody": "We use standardised plant extracts and ingredients with declared quantities, manufactured together with a Serbian producer. [REVIEW]",
  "scienceCta": "Contact us",
  "metaTitle": "NORDOGEN — supplements for urology, gynaecology and regeneration",
  "metaDescription": "NORDOGEN develops food supplements in urology, gynaecology and regeneration. See the composition and purpose of each product. [REVIEW]"
}
```

- [ ] **Step 6: Verify**

Run `npm run build`, then `npm run dev` and check `/sr` and `/en` at 375, 768 and 1440.

Confirm: no `TODO` anywhere; the Serbian mandatory statement is byte-identical to the declarations; the two locales have identical key sets:

```bash
node -e "
const a=Object.keys(require('./content/sr/home.json')).sort();
const b=Object.keys(require('./content/en/home.json')).sort();
console.log(JSON.stringify(a)===JSON.stringify(b) ? 'home keys match' : 'MISMATCH');
const c=Object.keys(require('./content/sr/site-chrome.json')).sort();
const d=Object.keys(require('./content/en/site-chrome.json')).sort();
console.log(JSON.stringify(c)===JSON.stringify(d) ? 'chrome keys match' : 'MISMATCH');
"
```

Expected: `home keys match` and `chrome keys match`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "content: add bilingual home and chrome copy

Authored marketing copy carries [REVIEW]. The mandatory supplement
statement is verbatim from the approved declarations and is not
marked. Company details come from the declarations."
```

---

## Design Review Gate

Stop here. Present to the user, at 375 / 768 / 1440 in both locales:

1. Home page
2. Header, including the open mobile panel
3. Footer
4. Logo in all three brand colours

Do not begin Plan 2 (Playwright overflow guard, `check:content`, CI, products collection and product pages) until the visual direction is approved. Screenshot baselines are deliberately deferred to Plan 2 — baselines captured against a design that is still moving are noise that trains people to ignore failures.

Known follow-ups already scheduled for Plan 2, not defects:
- `KEYSTATIC_GITHUB_OWNER` / `KEYSTATIC_GITHUB_REPO` need setting in Vercel before the first deploy.
- The Home products block has no grid yet — it needs the `products` collection.
- `/products`, `/about` and `/contact` are linked but do not exist yet, so those links 404.
