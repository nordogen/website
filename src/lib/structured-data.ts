import type { Locale } from '@/i18n/locales'
import { SITE_ORIGIN, absoluteUrl } from '@/i18n/urls'
import { SITE_NAME } from './seo'
import type { Product } from '@/content/queries'
import type { getSettings } from '@/content/queries'

type Settings = Awaited<ReturnType<typeof getSettings>>
type Node = Record<string, unknown>

/** Stable node id, so a product can point at the company without repeating it. */
const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`

/**
 * The company. Every fact an editor can change — legal name, address, email —
 * comes from `content/settings.json`. The display name is the one exception:
 * it is the brand, shared with `og:site_name` through `SITE_NAME`, and not
 * something an editor should be able to rename from the CMS. `settings` holds
 * the *legal* name (`NORDOGEN d.o.o.`), which is a different string and goes in
 * `legalName`.
 *
 * `manufacturer` in settings is one editor-written line naming the contract
 * manufacturer. It is passed through as a name rather than parsed: the
 * declarations distinguish NORDOGEN (brand and registration holder) from
 * ELEPHANT PHARMA (who actually makes it), and splitting that string on a comma
 * would break the first time an editor rewrites it.
 */
export function organizationNode(settings: Settings): Node {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: settings.legalName,
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/icon.png`,
    email: settings.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.street,
      addressLocality: settings.city,
      addressCountry: settings.country,
    },
  }
}

export function breadcrumbNode({
  locale,
  productsLabel,
  productsUrl,
  homeLabel,
  product,
}: {
  locale: Locale
  productsLabel: string
  productsUrl: string
  homeLabel: string
  product: Product
}): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: homeLabel, item: absoluteUrl(locale) },
      { '@type': 'ListItem', position: 2, name: productsLabel, item: productsUrl },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: absoluteUrl(locale, `/products/${product.slug}`),
      },
    ],
  }
}

/**
 * One product.
 *
 * The five supplements are `DietarySupplement`. Urinord is food for special
 * medical purposes — calling it a supplement in machine-readable form would be
 * the same false claim as calling it one in the copy. schema.org has no type
 * for food for special medical purposes (`MedicalProduct` does not exist, and
 * `Drug` would be worse), so it falls back to plain `Product` with an explicit
 * `category`, and its dose and mandatory notice ride along as
 * `additionalProperty`.
 *
 * No `offers` on either: there is no shop. A `Product` with a price it does not
 * have is a worse error than one Search Console warning about a missing field.
 *
 * Everything here is either a company fact or copied from the approved
 * declarations. Structured data is a public claim like any other — no efficacy
 * wording goes in.
 */
export function productNode({
  product,
  settings,
  locale,
  categoryLabel,
  doseLabel,
  noticeLabel,
}: {
  product: Product
  settings: Settings
  locale: Locale
  categoryLabel: string
  doseLabel: string
  noticeLabel: string
}): Node {
  const isSupplement = product.category === 'supplement'
  const intake = [product.hero.dose, product.hero.doseNote].filter(Boolean).join('. ')

  const shared: Node = {
    name: product.name,
    url: absoluteUrl(locale, `/products/${product.slug}`),
    image: `${SITE_ORIGIN}/products/${product.slug}.webp`,
    description: product.hero.intro,
    brand: { '@id': ORGANIZATION_ID },
    manufacturer: { '@type': 'Organization', name: settings.manufacturer },
  }

  if (!isSupplement) {
    return {
      '@type': 'Product',
      ...shared,
      category: categoryLabel,
      additionalProperty: [
        { '@type': 'PropertyValue', name: doseLabel, value: intake },
        ...(product.regulatoryNote
          ? [{ '@type': 'PropertyValue', name: noticeLabel, value: product.regulatoryNote }]
          : []),
      ],
    }
  }

  return {
    '@type': 'DietarySupplement',
    ...shared,
    category: categoryLabel,
    activeIngredient: product.ingredients.items.map((item) => item.name),
    // The type wants a RecommendedDoseSchedule, not a string.
    recommendedIntake: { '@type': 'RecommendedDoseSchedule', description: intake },
    targetPopulation: product.audience.body,
    safetyConsideration: product.notes.warnings,
  }
}

/** Wraps nodes in the single `@graph` a page emits. */
export function graph(nodes: Node[]): Node {
  return { '@context': 'https://schema.org', '@graph': nodes }
}

/**
 * `</script>` inside a JSON string would close the tag early and drop the rest
 * of the page into the document as markup. Escaping `<` at the source is the
 * fix; the JSON stays valid because `<` is just an escaped character.
 */
export function serialize(data: Node): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
