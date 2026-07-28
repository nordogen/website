// Converts the vector logo PDF into two colour-agnostic SVG files.
// Run: node scripts/extract-logo.mjs --report      (inspect y-bands)
//      node scripts/extract-logo.mjs --split 0.62  (emit files)
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const PDF = 'data/nordogen logo 1 v1.pdf'
const TMP = 'node_modules/.cache/logo.svg'
const OUT = 'public/brand'

mkdirSync('node_modules/.cache', { recursive: true })
mkdirSync(OUT, { recursive: true })
execFileSync('pdftocairo', ['-svg', PDF, TMP])

const svg = readFileSync(TMP, 'utf8')

// Collect every drawn path with its vertical midpoint.
const items = []
for (const m of svg.matchAll(/<(path|use)\b[^>]*\/>/g)) {
  const tag = m[0]
  const nums = [...tag.matchAll(/-?\d+\.?\d*/g)].map((n) => Number(n[0]))
  if (!nums.length) continue
  items.push({ tag, y: nums.reduce((a, b) => a + b, 0) / nums.length })
}

const ys = items.map((i) => i.y)
const min = Math.min(...ys)
const max = Math.max(...ys)
const norm = (y) => (y - min) / (max - min)

if (process.argv.includes('--report')) {
  const buckets = Array.from({ length: 20 }, () => 0)
  for (const i of items) buckets[Math.min(19, Math.floor(norm(i.y) * 20))]++
  buckets.forEach((n, b) =>
    console.log(`${(b / 20).toFixed(2)}-${((b + 1) / 20).toFixed(2)}  ${'#'.repeat(n)} ${n}`),
  )
  process.exit(0)
}

const splitArg = process.argv.indexOf('--split')
if (splitArg === -1) throw new Error('pass --report or --split <0..1>')
const split = Number(process.argv[splitArg + 1])

const viewBox = svg.match(/viewBox="([^"]+)"/)[1]
const wrap = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor" ` +
  `stroke="currentColor" aria-hidden="true">${body}</svg>\n`

const strip = (t) => t.replace(/(fill|stroke)="(?!none)[^"]*"/g, '')

writeFileSync(
  `${OUT}/logo-mark.svg`,
  wrap(items.filter((i) => norm(i.y) < split).map((i) => strip(i.tag)).join('')),
)
writeFileSync(
  `${OUT}/logo-wordmark.svg`,
  wrap(items.filter((i) => norm(i.y) >= split).map((i) => strip(i.tag)).join('')),
)
console.log('wrote logo-mark.svg and logo-wordmark.svg')
