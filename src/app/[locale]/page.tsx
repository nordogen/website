export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <main className="p-8">locale: {locale}</main>
}
