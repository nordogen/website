import '../globals.css'
import { notFound } from 'next/navigation'
import { jost } from '@/lib/fonts'
import { LOCALES, isLocale } from '@/i18n/locales'

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
    <html lang={locale} className={jost.variable}>
      <body className="flex min-h-[100svh] flex-col font-sans antialiased">{children}</body>
    </html>
  )
}
