import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Section } from '@/components/ui/Section'
import { getHome, getProducts, getSettings } from '@/content/queries'
import { isLocale } from '@/i18n/locales'
import { SECTION_ID } from '@/i18n/ui'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const home = await getHome(locale)

  return pageMetadata({
    locale,
    path: '',
    title: home.metaTitle,
    description: home.metaDescription,
  })
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const [home, products, settings] = await Promise.all([
    getHome(locale),
    getProducts(locale),
    getSettings(),
  ])

  const principles = [
    { n: '01', title: home.principleOneTitle, body: home.principleOneBody },
    { n: '02', title: home.principleTwoTitle, body: home.principleTwoBody },
    { n: '03', title: home.principleThreeTitle, body: home.principleThreeBody },
    { n: '04', title: home.principleFourTitle, body: home.principleFourBody },
  ]

  return (
    <>
      {/* Hero. The section is only as tall as its content — the min-heights are
          the drawn heights, not a cap, so longer copy or a longer language
          grows the band instead of overflowing the image. */}
      <section className="on-dark relative isolate bg-ink text-white">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="-z-10 object-cover object-[62%_50%] lg:object-[70%_50%]"
        />
        <div className="hero-scrim absolute inset-0 -z-10" aria-hidden="true" />

        <Container className="flex min-h-[460px] flex-col justify-end gap-4 py-8 lg:min-h-[600px] lg:max-w-[1240px] lg:justify-center lg:gap-6 lg:py-16">
          <div className="lg:max-w-[52rem]">
            {home.heroEyebrow ? (
              <Eyebrow tone="light">{home.heroEyebrow}</Eyebrow>
            ) : null}

            <h1 className="mt-4 font-display text-[clamp(2.125rem,5vw,3.25rem)] font-normal leading-[1.08] tracking-[-0.02em] lg:mt-6 lg:max-w-[20ch]">
              {home.heroHeading}
            </h1>

            <p className="mt-4 max-w-[44ch] text-[1.0625rem] leading-[1.6] text-white/85 lg:mt-6 lg:text-[1.3125rem] lg:leading-[1.65]">
              {home.heroBody}
            </p>

            <div className="mt-6 flex flex-col gap-2.5 lg:mt-8 lg:flex-row lg:gap-3.5">
              <Button href={`/${locale}#${SECTION_ID.products}`} variant="primaryOnDark">
                {home.heroPrimaryCta}
              </Button>
              {home.heroSecondaryCta ? (
                <Button href={`/${locale}#${SECTION_ID.why}`} variant="secondaryOnDark">
                  {home.heroSecondaryCta}
                </Button>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <Section id={SECTION_ID.products}>
        <div className="lg:mb-10">
          <Eyebrow>{home.productsEyebrow}</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(2.125rem,3.4vw,2.875rem)] leading-[1.12] tracking-[-0.015em] lg:mt-4 lg:max-w-[62rem]">
            {home.productsHeading}
          </h2>
        </div>

        <div className="mt-6 grid gap-3.5 lg:mt-0 lg:grid-cols-3 lg:gap-5">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} locale={locale} />
          ))}
        </div>
      </Section>

      <Section id={SECTION_ID.why} tone="soft">
        <div className="lg:grid lg:grid-cols-[1fr_1.12fr] lg:items-center lg:gap-14">
          <Image
            src="/images/lab.jpg"
            alt=""
            width={1920}
            height={1086}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="h-[230px] w-full rounded-card object-cover lg:h-[440px]"
          />

          <div className="mt-6 lg:mt-0">
            <Eyebrow>{home.whyEyebrow}</Eyebrow>
            <h2 className="mt-3 font-display text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.14] tracking-[-0.015em] lg:mt-4 lg:max-w-[20ch]">
              {home.whyHeading}
            </h2>
            <p className="mt-4 max-w-[52ch] leading-[1.7] text-ink-soft lg:mt-6">
              {home.whyBodyOne}
            </p>
            <p className="mt-4 max-w-[52ch] leading-[1.7] text-ink-soft">{home.whyBodyTwo}</p>
          </div>
        </div>

        {/* Exactly four. The hairline grid is the 1px gap showing through. */}
        <ul className="mt-8 grid gap-px border border-ink/14 bg-ink/14 lg:mt-16 lg:grid-cols-4">
          {principles.map((principle) => (
            <li key={principle.n} className="bg-soft p-[18px] lg:px-6 lg:pb-[34px] lg:pt-8">
              <p className="font-display text-[1.75rem] leading-none text-accent lg:text-[2rem]">
                {principle.n}
              </p>
              <h3 className="mt-3 text-[1.125rem] font-semibold lg:mt-4 lg:text-[1.1875rem]">
                {principle.title}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-[1.6] text-muted lg:mt-2.5 lg:text-base">
                {principle.body}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id={SECTION_ID.contact} tone="accent" pad="band">
        <div className="lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-[60ch]">
            <h2 className="font-display text-[clamp(1.875rem,2.9vw,2.5rem)] leading-[1.16]">
              {home.contactHeading}
            </h2>
            <p className="mt-3 text-[1.0625rem] leading-[1.65] text-white/90 lg:text-[1.1875rem]">
              {home.contactBody}
            </p>
          </div>
          <Button
            href={`mailto:${settings.email}`}
            variant="primaryOnDark"
            className="mt-6 w-full lg:mt-0 lg:w-auto lg:shrink-0"
          >
            {home.contactCta}
          </Button>
        </div>
      </Section>
    </>
  )
}
