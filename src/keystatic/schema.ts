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
