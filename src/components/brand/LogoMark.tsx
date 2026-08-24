import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const svg = readFileSync(join(process.cwd(), 'public/brand/logo-mark.svg'), 'utf8')

export function LogoMark({ className }: { className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />
}
