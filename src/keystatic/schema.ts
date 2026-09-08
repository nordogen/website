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
 * One product, in one locale — the card on the home page and the whole product
 * page behind it.
 *
 * The file name is the slug, and the slug is also the product photo:
 * `public/products/<slug>.webp`. The photo is deliberately not a CMS field — it
 * is identical in both locales, and a per-locale image field is a per-locale
 * way to get them out of sync.
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
    family: fields.select({
      label: 'Therapeutic area',
      description:
        'Sets the badge colour, and decides which products appear under “from the same range”.',
      options: [
        { label: 'Urology / Urologija', value: 'urology' },
        { label: 'Gynaecology / Ginekologija', value: 'gynaecology' },
        { label: 'Regeneration / Regeneracija', value: 'regeneration' },
      ],
      defaultValue: 'urology',
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
    group: fields.text({
      label: 'Badge label',
      description: 'The small coloured tag on the card and at the top of the product page.',
      validation: required,
    }),
    summary: fields.text({
      label: 'What it is for',
      description: 'One line, shown on the home page card.',
      multiline: true,
      validation: required,
    }),

    hero: fields.object(
      {
        subtitle: fields.text({
          label: 'Subtitle under the product name',
          description: 'Optional. Shown in the accent colour.',
          multiline: true,
        }),
        intro: fields.text({ label: 'Intro paragraph', multiline: true, validation: required }),
        dose: fields.text({
          label: 'Dosage',
          description: 'The short figure for the spec row. For example: 2 kapsule dnevno.',
          validation: required,
        }),
        doseNote: fields.text({
          label: 'Dosage instructions',
          description:
            'Optional. Anything the dosage figure leaves out — how to take it, what it must be dissolved in.',
          multiline: true,
        }),
        pack: fields.text({
          label: 'Pack size',
          description: 'For example: 30 kapsula.',
          validation: required,
        }),
        duration: fields.text({
          label: 'How long a pack lasts',
          description: 'Optional. Leave empty when the dose varies. For example: 15 dana.',
        }),
      },
      { label: 'Top of the page' },
    ),

    audience: fields.object(
      {
        eyebrow: fields.text({ label: 'Small label', validation: required }),
        heading: fields.text({ label: 'Heading', multiline: true, validation: required }),
        body: fields.text({ label: 'Paragraph', multiline: true, validation: required }),
      },
      { label: 'Who it is for' },
    ),

    benefits: fields.object(
      {
        eyebrow: fields.text({ label: 'Small label' }),
        heading: fields.text({ label: 'Heading', multiline: true }),
        items: fields.array(
          fields.object({
            title: fields.text({ label: 'Title', validation: required }),
            body: fields.text({ label: 'Text', multiline: true, validation: required }),
          }),
          {
            label: 'Benefit cards',
            description: 'Two to four. The whole section disappears when this is empty.',
            itemLabel: (props) => props.fields.title.value,
          },
        ),
      },
      { label: 'Key benefits' },
    ),

    formula: fields.object(
      {
        eyebrow: fields.text({ label: 'Small label', validation: required }),
        heading: fields.text({ label: 'Heading', multiline: true, validation: required }),
        intro: fields.text({ label: 'Paragraph', multiline: true, validation: required }),
        calloutLabel: fields.text({
          label: 'Highlighted box: small label',
          description: 'Optional. Leave both box fields empty to hide the box.',
        }),
        calloutBody: fields.text({ label: 'Highlighted box: text', multiline: true }),
      },
      { label: 'Formula' },
    ),

    ingredients: fields.object(
      {
        eyebrow: fields.text({ label: 'Small label', validation: required }),
        heading: fields.text({ label: 'Heading', multiline: true, validation: required }),
        items: fields.array(
          fields.object({
            name: fields.text({ label: 'Ingredient', validation: required }),
            amount: fields.text({
              label: 'Amount',
              description: 'Optional. For example: 250 mg dnevno.',
            }),
            role: fields.text({ label: 'What it does', multiline: true, validation: required }),
          }),
          {
            label: 'Active ingredients',
            description: 'Also shown as the pills on the home page card.',
            itemLabel: (props) => props.fields.name.value,
          },
        ),
      },
      { label: 'Active ingredients' },
    ),

    useCases: fields.object(
      {
        eyebrow: fields.text({ label: 'Small label' }),
        heading: fields.text({ label: 'Heading', multiline: true }),
        items: fields.array(fields.text({ label: 'Situation' }), {
          label: 'Situations',
          description: 'One sentence each. The whole section disappears when this is empty.',
          itemLabel: (props) => props.value,
        }),
      },
      { label: 'When it may be used' },
    ),

    notes: fields.object(
      {
        eyebrow: fields.text({ label: 'Small label', validation: required }),
        heading: fields.text({ label: 'Heading', multiline: true, validation: required }),
        warnings: fields.text({
          label: 'Warnings',
          description: 'Copied word for word from the approved declaration. Never softened.',
          multiline: true,
          validation: required,
        }),
        legalNote: fields.text({
          label: 'Legally required statement',
          description: 'REQUIRED BY LAW. Do not delete or reword.',
          multiline: true,
          validation: required,
        }),
      },
      { label: 'Important information' },
    ),

    purpose: fields.text({
      label: 'Purpose (from the approved declaration)',
      description:
        'Copied word for word from the approved packaging text. Serbian in both languages — there is no approved English translation.',
      multiline: true,
      validation: required,
    }),
    regulatoryNote: fields.text({
      label: 'Mandatory notice',
      description:
        'Only for food for special medical purposes. Copied word for word from the declaration.',
      multiline: true,
    }),

    metaTitle: fields.text({
      label: 'Search engines: page title',
      description: 'Optional. Falls back to the product name and its subtitle.',
    }),
    metaDescription: fields.text({
      label: 'Search engines: page description',
      description: 'Optional. Falls back to the intro paragraph.',
      multiline: true,
    }),
  }
}
