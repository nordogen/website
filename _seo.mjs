const slugs = ['myonord','nordilloma','renord','litonord','nordoprost','urinord']
const paths = ['/sr','/en', ...slugs.flatMap(s => [`/sr/products/${s}`, `/en/products/${s}`])]
const rows = []
for (const p of paths) {
  const html = await (await fetch('http://localhost:3000' + p)).text()
  const pick = (re) => (html.match(re) || [])[1]
  const all = (re) => [...html.matchAll(re)].map(m => m[1])
  rows.push({
    path: p,
    lang: pick(/<html lang="([^"]+)"/),
    title: pick(/<title>([^<]*)<\/title>/),
    desc: pick(/<meta name="description" content="([^"]*)"/),
    canonical: pick(/<link rel="canonical" href="([^"]*)"/),
    hreflang: all(/hrefLang="([^"]*)"|hreflang="([^"]*)"/g).filter(Boolean).length,
    hreflangRaw: [...html.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)].map(m => m[1]),
    og: all(/<meta property="og:([^"]*)"/g),
    twitter: all(/<meta name="twitter:([^"]*)"/g),
    h1: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map(m => m[1].replace(/<[^>]+>/g,'').trim()),
    h2count: (html.match(/<h2[^>]*>/g)||[]).length,
    jsonld: (html.match(/application\/ld\+json/g)||[]).length,
    imgNoAlt: (html.match(/<img(?![^>]*\balt=)[^>]*>/g)||[]).length,
    imgEmptyAlt: (html.match(/<img[^>]*\balt=""/g)||[]).length,
    robotsMeta: pick(/<meta name="robots" content="([^"]*)"/),
  })
}
console.log(JSON.stringify(rows, null, 1))
