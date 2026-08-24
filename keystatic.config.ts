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
        name: process.env.KEYSTATIC_GITHUB_REPO ?? 'website',
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
