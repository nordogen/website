import '../../globals.css'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { newsreader, workSans } from '@/lib/fonts'
import { LOCALES, isLocale } from '@/i18n/locales'
import { UI } from '@/i18n/ui'
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

  return (
    <html lang={locale} className={`${workSans.variable} ${newsreader.variable}`}>
      <body className="flex min-h-[100svh] flex-col font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          {UI[locale].skipToContent}
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
