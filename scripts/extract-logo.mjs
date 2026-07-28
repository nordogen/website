// Converts the vector logo PDF into two colour-agnostic SVG files.
//
// pdftocairo flattens the PDF to an intermediate SVG of raw paths/uses.
// This source PDF's page is not just the mark + wordmark + tagline: it
// also carries a "1." export-tool page annotation (top) and a row of
// three brand-colour swatches (bottom), and none of that belongs in
// either output. A single top/bottom split cannot exclude all of it —
// the swatches' true y-range interleaves with the mark's and the
// wordmark's when compared against a naive "mean of every number in
// the tag" midpoint (that metric mixes x and y together). So each
// item's *real* bounding box is computed from its path data, and
// selection is by an explicit y-range per glyph, not a single ratio.
//
// Run: node scripts/extract-logo.mjs --report
//        inspect every item's true y-range (and x-range), sorted top to
//        bottom, to find/confirm the ranges below.
//      node scripts/extract-logo.mjs
//        emit files using the documented default ranges (reproduces the
//        committed public/brand/logo-*.svg).
//      node scripts/extract-logo.mjs --mark-y 200:315 --wordmark-y 316:365
//        override the ranges (e.g. after the source PDF changes).
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const PDF = 'data/nordogen logo 1 v1.pdf'
const TMP = 'node_modules/.cache/logo.svg'
const OUT = 'public/brand'
const PAD = 4 // uniform padding (source-PDF points) around each glyph's ink bbox

// Measured from the current PDF via --report: mark ink is y 203–310,
// wordmark ink is y 321–361. The tagline (y 368–374) and the colour
// swatches (y 397–467) sit outside both ranges and are excluded.
const DEFAULT_MARK_Y = [200, 315]
const DEFAULT_WORDMARK_Y = [316, 365]

mkdirSync('node_modules/.cache', { recursive: true })
mkdirSync(OUT, { recursive: true })
execFileSync('pdftocairo', ['-svg', PDF, TMP])

const svg = readFileSync(TMP, 'utf8')

// <defs> holds unplaced glyph templates (referenced elsewhere via <use>),
// in local glyph-space coordinates, not page coordinates — skip them.
const defsStart = svg.indexOf('<defs>')
const defsEnd = svg.indexOf('</defs>') + '</defs>'.length
const isInDefs = (index) => index >= defsStart && index < defsEnd

function parseMatrix(tag) {
  const m = tag.match(/transform="matrix\(([^)]+)\)"/)
  if (!m) return null
  const [a, b, c, d, e, f] = m[1].split(',').map(Number)
  return { a, b, c, d, e, f }
}

function applyMatrix(x, y, m) {
  return m ? [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f] : [x, y]
}

// A real bounding box from the path's own M/L/C/Z commands (the only ones
// pdftocairo emits) — not the mean of every number in the tag, which mixes
// x and y and is what let the colour swatches interleave with the real
// clusters in an earlier version of this script.
function bboxOfPath(d, matrix) {
  const tokens = d.match(/[MLCZ]|-?\d+\.?\d*/g) || []
  let cmd = null
  const xs = []
  const ys = []
  for (let i = 0; i < tokens.length; ) {
    if (/[MLCZ]/.test(tokens[i])) {
      cmd = tokens[i]
      i++
      continue
    }
    const argCount = cmd === 'C' ? 6 : cmd === 'M' || cmd === 'L' ? 2 : 0
    if (!argCount) {
      i++
      continue
    }
    for (let k = 0; k < argCount; k += 2) {
      const [x, y] = applyMatrix(Number(tokens[i + k]), Number(tokens[i + k + 1]), matrix)
      xs.push(x)
      ys.push(y)
    }
    i += argCount
  }
  if (!xs.length) return null
  return { xmin: Math.min(...xs), xmax: Math.max(...xs), ymin: Math.min(...ys), ymax: Math.max(...ys) }
}

const items = []
for (const m of svg.matchAll(/<(path|use)\b[^>]*\/>/g)) {
  if (isInDefs(m.index)) continue
  const tag = m[0]
  const dMatch = tag.match(/ d="([^"]*)"/)
  let bbox
  if (dMatch) {
    bbox = bboxOfPath(dMatch[1], parseMatrix(tag))
  } else {
    // <use>: its glyph outline lives in <defs> (skipped above); treat its
    // anchor point as a zero-size box, which is enough to keep it out of
    // both y-ranges below.
    const x = Number(tag.match(/ x="([^"]*)"/)?.[1] ?? 0)
    const y = Number(tag.match(/ y="([^"]*)"/)?.[1] ?? 0)
    bbox = { xmin: x, xmax: x, ymin: y, ymax: y }
  }
  if (bbox) items.push({ tag, bbox })
}

if (process.argv.includes('--report')) {
  items
    .slice()
    .sort((a, b) => a.bbox.ymin - b.bbox.ymin)
    .forEach(({ bbox }) =>
      console.log(
        `y ${bbox.ymin.toFixed(1)}-${bbox.ymax.toFixed(1)}   x ${bbox.xmin.toFixed(1)}-${bbox.xmax.toFixed(1)}`,
      ),
    )
  process.exit(0)
}

function rangeArg(flag, fallback) {
  const i = process.argv.indexOf(flag)
  if (i === -1) return fallback
  return process.argv[i + 1].split(':').map(Number)
}

const strip = (t) => t.replace(/(fill|stroke)="(?!none)[^"]*"/g, '')
const inRange = (bbox, [min, max]) => bbox.ymin >= min && bbox.ymax <= max

function emit(name, range) {
  const selected = items.filter((i) => inRange(i.bbox, range))
  if (!selected.length) throw new Error(`no items fall inside y-range ${range} for ${name}`)
  const xmin = Math.min(...selected.map((i) => i.bbox.xmin)) - PAD
  const ymin = Math.min(...selected.map((i) => i.bbox.ymin)) - PAD
  const xmax = Math.max(...selected.map((i) => i.bbox.xmax)) + PAD
  const ymax = Math.max(...selected.map((i) => i.bbox.ymax)) + PAD
  const viewBox = `${xmin.toFixed(1)} ${ymin.toFixed(1)} ${(xmax - xmin).toFixed(1)} ${(ymax - ymin).toFixed(1)}`
  const body = selected.map((i) => strip(i.tag)).join('')
  writeFileSync(
    `${OUT}/${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor" ` +
      `stroke="currentColor" aria-hidden="true">${body}</svg>\n`,
  )
  console.log(`wrote ${name}.svg  viewBox="${viewBox}"`)
}

emit('logo-mark', rangeArg('--mark-y', DEFAULT_MARK_Y))
emit('logo-wordmark', rangeArg('--wordmark-y', DEFAULT_WORDMARK_Y))
