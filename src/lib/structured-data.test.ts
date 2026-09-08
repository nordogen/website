import { readFileSync, readdirSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { repoPath } from '@/test/paths'

const ORIGIN = 'https://www.nordogen.com'

const SLUGS = readdirSync(repoPath('content/sr/products'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))

const product = (slug: string) => ({
  slug,
  ...JSON.parse(readFileSync(repoPath(`content/sr/products/${slug}.json`), 'utf8')),
})
const settings = JSON.parse(readFileSync(repoPath('content/settings.json'), 'utf8'))

async function load() {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', ORIGIN)
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', undefined)
  return import('./structured-data')
}

const node = async (slug: string) => {
  const { productNode } = await load()
  return productNode({
    product: product(slug),
    settings,
    locale: 'sr',
    categoryLabel: 'Dodatak ishrani',
    doseLabel: 'Doziranje',
    noticeLabel: 'Važno obaveštenje',
  }) as Record<string, unknown>
}

beforeEach(() => {
  vi.unstubAllEnvs()
})

describe('product structured data', () => {
  it('calls the five supplements DietarySupplement', async () => {
    for (const slug of SLUGS.filter((s) => s !== 'urinord')) {
      expect((await node(slug))['@type'], slug).toBe('DietarySupplement')
    }
  })

  it('never calls Urinord a supplement', async () => {
    // Food for special medical purposes. Saying "DietarySupplement" in
    // machine-readable form is the same false claim as saying it in the copy.
    const urinord = await node('urinord')
    expect(urinord['@type']).toBe('Product')
    expect(JSON.stringify(urinord)).not.toContain('DietarySupplement')
  })

  it('claims no price, stock or offer anywhere', async () => {
    for (const slug of SLUGS) {
      const json = JSON.stringify(await node(slug))
      for (const forbidden of ['offers', 'price', 'availability', 'sku', 'aggregateRating']) {
        expect(json, `${slug} / ${forbidden}`).not.toContain(`"${forbidden}"`)
      }
    }
  })

  it('uses absolute URLs on the configured origin', async () => {
    for (const slug of SLUGS) {
      const n = await node(slug)
      expect(n.url).toBe(`${ORIGIN}/sr/products/${slug}`)
      expect(n.image).toBe(`${ORIGIN}/products/${slug}.webp`)
    }
  })

  it('copies the declaration wording rather than paraphrasing it', async () => {
    for (const slug of SLUGS.filter((s) => s !== 'urinord')) {
      const n = await node(slug)
      expect(n.safetyConsideration).toBe(product(slug).notes.warnings)
      expect(n.activeIngredient).toEqual(
        product(slug).ingredients.items.map((i: { name: string }) => i.name),
      )
    }
  })

  it('keeps Urinord’s medical-supervision notice in the markup', async () => {
    const props = (await node('urinord')).additionalProperty as { value: string }[]
    expect(props.some((p) => /pod medicinskim nadzorom/.test(p.value))).toBe(true)
  })

  it('points brand at the company node rather than repeating it', async () => {
    const n = await node('myonord')
    expect(n.brand).toEqual({ '@id': `${ORIGIN}/#organization` })
  })
})

describe('organization', () => {
  it('reads the company from settings, never retyped', async () => {
    const { organizationNode } = await load()
    const org = organizationNode(settings) as Record<string, unknown>
    expect(org.legalName).toBe(settings.legalName)
    expect(org.email).toBe(settings.email)
    expect(org.url).toBe(ORIGIN)
    expect((org.address as Record<string, string>).streetAddress).toBe(settings.street)
  })
})

describe('serialize', () => {
  it('cannot break out of the script tag', async () => {
    const { serialize } = await load()
    const out = serialize({ name: '</script><img onerror=alert(1)>' })
    expect(out).not.toContain('</script>')
    expect(JSON.parse(out).name).toBe('</script><img onerror=alert(1)>')
  })
})

describe('breadcrumb', () => {
  it('numbers the trail from the home page to the product', async () => {
    const { breadcrumbNode } = await load()
    const crumb = breadcrumbNode({
      locale: 'sr',
      homeLabel: 'Početna',
      productsLabel: 'Proizvodi',
      productsUrl: `${ORIGIN}/sr#proizvodi`,
      product: product('renord'),
    }) as { itemListElement: { position: number; item: string }[] }

    expect(crumb.itemListElement.map((i) => i.position)).toEqual([1, 2, 3])
    expect(crumb.itemListElement.at(-1)?.item).toBe(`${ORIGIN}/sr/products/renord`)
    for (const item of crumb.itemListElement) expect(item.item.startsWith(ORIGIN)).toBe(true)
  })
})
