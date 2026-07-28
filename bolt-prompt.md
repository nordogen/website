# bolt.new prompt

Build a bilingual (English + Serbian) static marketing website.

## Business context

NORDOGEN - Serbian pharma company producing supplements in the field of urology, gynecology and recovery.

Visitors are patients, HCPs trying to find more info about products (benefits, content, etc).

The site is informational only. No signup, no booking, no e-commerce, no user accounts.

## Stack — use exactly this, do not substitute

- Next.js (App Router, TypeScript)
- Tailwind CSS
- `next-intl` for internationalisation
- Static output (`output: 'export'`) — no server runtime, no API routes, no database
- No CMS, no auth library, no state management library, no animation library
- Keep the dependency list minimal. Do not add packages I did not ask for.

## Internationalisation

- Locales: `en` and `sr`. Default locale: sr
- Locale-prefixed routes: `/en/...` and `/sr/...`
- All copy lives in `messages/en.json` and `messages/sr.json`, loaded the standard
  next-intl way. No custom message loader, no alternative file format. No hardcoded
  strings in components, ever.
- Use human-readable, nested keys that mirror the page structure, e.g.
  `home.hero.heading`, `home.hero.subheading`, `about.team.intro`.
  A non-technical person will edit these files directly, so the key must make it
  obvious which piece of text on which page it controls.
- Also write `messages/README.md`: a plain-language table listing every key alongside
  where that text appears on the site, plus short instructions for editing safely
  (edit only text between quotes, don't touch keys, mind the commas). Write it for
  someone who has never seen JSON. Keep it in sync with the message files.
- Keep both locale files structurally identical — same keys, same order.
- Add an npm script `check:content` that fails if the two files have differing key sets
  or if either is invalid JSON. Keep it to a single short script file.
- Language switcher in the header that preserves the current page.

If any single page ends up with more than roughly two paragraphs of running prose, tell
me before building it — that page's body belongs in a per-locale markdown file rather
than crammed into a JSON string.

## Pages and content

Example of the level of detail I want:

- `/` Home
- `/about` About
- `/contact` Contact
- `/products` Joined home for all products
- `/products/{product}` Product page for each product

Where I have not given
you copy, insert a clearly marked `TODO` string in the message files alongside writing
your own marketing text.

## Brand and design

- Colours: see attached brand book
- Typography: same, use brand book
- Logo: I will supply the file.
- Define all of the above as Tailwind theme tokens in the config. Do not use arbitrary
  hex values inline in components.
- Style direction: minimalist Scandinavian medical style that creates trust

## Deployment

- The site will be deployed using bolt's own built-in deploy. Nothing else.
- Do not add Docker files, CI workflows, GitHub Actions, or any external hosting config
  beyond the minimum that bolt's deploy itself requires.
- Do not suggest or set up Vercel, Cloudflare, Supabase or any other external service.
- Make sure the static export builds cleanly in this environment — no native
  dependencies, no build steps that need a real filesystem or a running server.
- Verify `next build` succeeds and the exported output is fully static before deploying.

## Quality requirements

- Mobile-first, responsive. Test the layout at 375px, 768px and 1440px.
- Semantic HTML: proper heading hierarchy, `<nav>`, `<main>`, `<footer>`, alt text on images.
- Per-page metadata (title, description, Open Graph) localised per locale.
- `hreflang` alternates between the en/sr versions of each page.
- Generate `sitemap.xml` and `robots.txt`.
- Lighthouse accessibility and SEO scores of 95+.
- Reusable layout components — do not copy-paste the header and footer into each page.

## Build order

1. Scaffold the project, Tailwind theme tokens, next-intl config and locale routing.
   Show me one page (`/`) working in both locales before continuing.
2. Then build the remaining pages.
3. Then metadata, sitemap, hreflang.
4. Then confirm the static build passes and deploy it from bolt.

Stop after step 1 and let me review before you continue.
