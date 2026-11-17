/**
 * Where a product's two photos live. Both are derived from the slug — neither
 * is a CMS field, because they are identical in both locales.
 *
 * - The **box** is a cutout with an alpha channel: home card, related-product
 *   cards, and the structured-data `image`.
 * - The **scene** is the box on a pharmacy counter, opaque, cropped 4:5: the
 *   product page hero.
 *
 * The directory is versioned on purpose. `next/image` caches its optimised
 * output by URL, not by content, and so do browsers and the CDN — replace a
 * picture at the same path and the old one keeps being served. When the photos
 * change, put them in a new directory and change it here, once.
 */
const PHOTO_DIR = '/products/2026-11-v2'

export function productBoxSrc(slug: string): string {
  return `${PHOTO_DIR}/${slug}.webp`
}

export function productSceneSrc(slug: string): string {
  return `${PHOTO_DIR}/${slug}-pharmacy.webp`
}
