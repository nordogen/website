import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const svg = readFileSync(join(process.cwd(), 'public/brand/logo-wordmark.svg'), 'utf8')

export function LogoWordmark({ className }: { className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />
}
