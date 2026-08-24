import '../../globals.css'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { jost } from '@/lib/fonts'
import { getSiteChrome } from '@/content/queries'
import { LOCALES, isLocale } from '@/i18n/locales'
import { SITE_ORIGIN } from '@/i18n/urls'

// Inherited by every route, so any relative URL in metadata (OG images, when
// they exist) resolves against the deployment's own origin instead of
// silently against localhost.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const chrome = await getSiteChrome(locale)

  return (
    <html lang={locale} className={jost.variable}>
      <body className="flex min-h-[100svh] flex-col font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-brand-teal focus:px-4 focus:py-2 focus:text-white"
        >
          {chrome.skipToContent}
        </a>
        <Header locale={locale} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} />
      </body>
    </html>
  )
}
