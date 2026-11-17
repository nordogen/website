/**
 * Where a product's two photos live. Both are derived from the slug — neither
 * is a CMS field, because they are identical in both locales.
 *
 * - The **box** is a cutout with an alpha channel: home card, related-product
 *   cards, and the structured-data `image`.
 * - The **scene** is the box on a pharmacy counter, opaque, cropped 4:5: the
 *   product page hero.
 *
 * Paths are flat and unversioned by choice. `next/image`, browsers and the CDN
 * cache by URL, not by content, so a picture replaced at the same path can keep
 * showing the old one for a while after deploy — accepted for simplicity.
 */
const PHOTO_DIR = '/products'

export function productBoxSrc(slug: string): string {
  return `${PHOTO_DIR}/${slug}.webp`
}

export function productSceneSrc(slug: string): string {
  return `${PHOTO_DIR}/${slug}-pharmacy.webp`
}
