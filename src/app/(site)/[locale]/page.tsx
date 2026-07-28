import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArcMotif } from '@/components/brand/ArcMotif'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Section } from '@/components/ui/Section'
import { getHome } from '@/content/queries'
import { isLocale } from '@/i18n/locales'
import { localeAlternates } from '@/i18n/urls'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const home = await getHome(locale)
  const alternates = localeAlternates('')

  return {
    title: home.metaTitle,
    description: home.metaDescription,
    alternates: {
      canonical: alternates.canonicalFor(locale),
      languages: alternates.languages,
    },
  }
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const home = await getHome(locale)

  return (
    <>
      <Section tone="tint" className="min-h-[70svh]">
        <ArcMotif className="pointer-events-none absolute -right-24 -top-24 w-72 text-brand-blue/20 sm:w-96 lg:-right-16 lg:w-[32rem]" />
        <div className="relative max-w-2xl">
          <Eyebrow>{home.heroEyebrow}</Eyebrow>
          <h1 className="mt-4 text-[clamp(2rem,7vw,3.5rem)] font-medium leading-[1.1] text-brand-teal">
            {home.heroHeading}
          </h1>
          <p className="mt-5 text-base text-ink/80 sm:text-lg">{home.heroBody}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={`/${locale}/products`}>{home.heroPrimaryCta}</Button>
            <Button href={`/${locale}/about`} variant="secondary">
              {home.heroSecondaryCta}
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <Eyebrow>{home.aboutEyebrow}</Eyebrow>
            <h2 className="mt-4 text-[clamp(1.5rem,4vw,2.25rem)] font-medium leading-tight text-brand-teal">
              {home.aboutHeading}
            </h2>
            <p className="mt-4 text-ink/80">{home.aboutBody}</p>
            <div className="mt-6">
              <Button href={`/${locale}/about`} variant="secondary">
                {home.aboutCta}
              </Button>
            </div>
          </div>
          <div className="order-first flex justify-center text-brand-blue lg:order-last">
            <ArcMotif className="w-48 sm:w-64 lg:w-full lg:max-w-sm" />
          </div>
        </div>
      </Section>

      <Section tone="tint">
        <div className="max-w-2xl">
          <Eyebrow>{home.productsEyebrow}</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.5rem,4vw,2.25rem)] font-medium leading-tight text-brand-teal">
            {home.productsHeading}
          </h2>
          <p className="mt-4 text-ink/80">{home.productsBody}</p>
        </div>
        {/* The product grid arrives with the products collection in Plan 2. */}
      </Section>

      <Section tone="teal">
        <ArcMotif className="pointer-events-none absolute -left-28 bottom-[-6rem] w-72 text-white/10 sm:w-96" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-blue-tint">
            {home.scienceEyebrow}
          </p>
          <h2 className="mt-4 text-[clamp(1.5rem,4vw,2.25rem)] font-medium leading-tight">
            {home.scienceHeading}
          </h2>
          <p className="mt-4 text-white/85">{home.scienceBody}</p>
          <div className="mt-8">
            <Button href={`/${locale}/contact`} variant="light">
              {home.scienceCta}
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
