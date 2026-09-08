import { fields } from '@keystatic/core'

const required = { length: { min: 1 } }

/**
 * ONE factory per content shape, instantiated once per locale in
 * keystatic.config.ts. Structural drift between `sr` and `en` is impossible by
 * construction — do not inline field definitions per locale.
 *
 * Field labels and descriptions are read by a non-technical editor. Write them
 * for that reader.
 */
export function siteChromeSchema() {
  return {
    footerTagline: fields.text({
      label: 'Footer: short description under the logo',
      description: 'One or two sentences. Appears in the first footer column.',
      multiline: true,
      validation: required,
    }),
    supplementDisclaimer: fields.text({
      label: 'Legally required supplement statement',
      description:
        'REQUIRED BY LAW. Do not delete or reword. The Serbian text is fixed by regulation.',
      multiline: true,
      validation: required,
    }),
    copyright: fields.text({ label: 'Footer: copyright line', validation: required }),
  }
}

export function homeSchema() {
  return {
    heroEyebrow: fields.text({
      label: 'Hero: small label above the headline',
      description: 'Optional. Leave empty to remove it and its rule.',
    }),
    heroHeading: fields.text({ label: 'Hero: main headline', multiline: true, validation: required }),
    heroBody: fields.text({ label: 'Hero: paragraph', multiline: true, validation: required }),
    heroPrimaryCta: fields.text({ label: 'Hero: main button text', validation: required }),
    heroSecondaryCta: fields.text({
      label: 'Hero: second button text',
      description: 'Optional. Leave empty to show only the main button.',
    }),

    productsEyebrow: fields.text({ label: 'Products block: small label', validation: required }),
    productsHeading: fields.text({
      label: 'Products block: heading',
      multiline: true,
      validation: required,
    }),

    whyEyebrow: fields.text({ label: 'Why Nordogen: small label', validation: required }),
    whyHeading: fields.text({ label: 'Why Nordogen: heading', multiline: true, validation: required }),
    whyBodyOne: fields.text({
      label: 'Why Nordogen: first paragraph',
      multiline: true,
      validation: required,
    }),
    whyBodyTwo: fields.text({
      label: 'Why Nordogen: second paragraph',
      multiline: true,
      validation: required,
    }),

    // Exactly four, deliberately flat rather than an array: the numerals are
    // authored content and the desktop layout is a four-across hairline grid
    // that breaks at any other count.
    principleOneTitle: fields.text({ label: 'Principle 01: title', validation: required }),
    principleOneBody: fields.text({ label: 'Principle 01: text', multiline: true, validation: required }),
    principleTwoTitle: fields.text({ label: 'Principle 02: title', validation: required }),
    principleTwoBody: fields.text({ label: 'Principle 02: text', multiline: true, validation: required }),
    principleThreeTitle: fields.text({ label: 'Principle 03: title', validation: required }),
    principleThreeBody: fields.text({ label: 'Principle 03: text', multiline: true, validation: required }),
    principleFourTitle: fields.text({ label: 'Principle 04: title', validation: required }),
    principleFourBody: fields.text({ label: 'Principle 04: text', multiline: true, validation: required }),

    contactHeading: fields.text({ label: 'Contact band: heading', multiline: true, validation: required }),
    contactBody: fields.text({ label: 'Contact band: paragraph', multiline: true, validation: required }),
    contactCta: fields.text({
      label: 'Contact band: button text',
      description: 'The button opens the visitor’s mail app, addressed to the company email.',
      validation: required,
    }),

    metaTitle: fields.text({ label: 'Search engines: page title', validation: required }),
    metaDescription: fields.text({
      label: 'Search engines: page description',
      description: 'Aim for 150 characters or fewer.',
      multiline: true,
      validation: required,
    }),
  }
}

/**
 * One product, in one locale. The file name is the slug, and the slug is also
 * the product photo: `public/products/<slug>.webp`. The photo is deliberately
 * not a CMS field — it is identical in both locales, and a per-locale image
 * field is a per-locale way to get them out of sync.
 */
export function productSchema() {
  return {
    name: fields.slug({
      name: { label: 'Product name', description: 'For example: Myonord', validation: required },
      slug: {
        label: 'File name and photo',
        description:
          'Lowercase, no spaces. Must match the photo in public/products, e.g. “myonord” for myonord.webp.',
      },
    }),
    order: fields.integer({
      label: 'Position in the list',
      description: 'Lower numbers come first.',
      validation: { isRequired: true },
    }),
    group: fields.text({
      label: 'Badge label',
      description: 'The small coloured tag on the card. For example: Žensko zdravlje.',
      validation: required,
    }),
    accent: fields.select({
      label: 'Badge colour',
      options: [
        { label: 'Blue — urology and kidneys', value: 'blue' },
        { label: 'Deep teal — recovery', value: 'teal' },
        { label: 'Crimson — women’s health', value: 'crimson' },
      ],
      defaultValue: 'blue',
    }),
    category: fields.select({
      label: 'Regulatory category',
      description:
        'Urinord is food for special medical purposes, not a supplement, and must not be presented as one.',
      options: [
        { label: 'Food supplement / Dodatak ishrani', value: 'supplement' },
        { label: 'Food for special medical purposes', value: 'fsmp' },
      ],
      defaultValue: 'supplement',
    }),
    summary: fields.text({
      label: 'What it is for',
      description: 'One line, shown on the card.',
      multiline: true,
      validation: required,
    }),
    ingredients: fields.text({
      label: 'Key ingredients',
      description: 'Optional. Separated by · — shown as the last line of the card.',
      multiline: true,
    }),
    pack: fields.text({
      label: 'Pack size',
      description: 'For example: 30 kapsula. Not shown on the home page.',
    }),
    purpose: fields.text({
      label: 'Purpose (from the approved declaration)',
      description:
        'Copied word for word from the approved packaging text. Never paraphrased or softened.',
      multiline: true,
      validation: required,
    }),
    regulatoryNote: fields.text({
      label: 'Mandatory notice',
      description:
        'Only for food for special medical purposes. Copied word for word from the declaration.',
      multiline: true,
    }),
  }
}
