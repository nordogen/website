import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const svg = readFileSync(join(process.cwd(), 'public/brand/logo-mark.svg'), 'utf8')

/**
 * The class lands on the <svg> itself, not on a wrapper: sizing an inline
 * wrapper leaves the SVG with no box to derive its own from, and the logo
 * renders at zero height. The wrapper is `display: contents` for the same
 * reason.
 */
export function LogoMark({ className }: { className?: string }) {
  const html = className ? svg.replace('<svg ', `<svg class="${className}" `) : svg
  return <span className="contents" dangerouslySetInnerHTML={{ __html: html }} />
}
