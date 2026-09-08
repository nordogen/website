import { LogoMark } from './LogoMark'
import { LogoWordmark } from './LogoWordmark'

/**
 * Mark plus wordmark. The descriptive tagline that used to sit under the
 * wordmark is gone — at lockup size it read as stray lettering rather than as
 * part of the logo.
 *
 * Both SVGs are `currentColor`, so the colour comes from the parent.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={['inline-flex items-center gap-2.5', className].filter(Boolean).join(' ')}>
      <span className="sr-only">NORDOGEN</span>
      <LogoMark className="block h-[22px] w-auto shrink-0 lg:h-[26px]" />
      <LogoWordmark className="block h-[19px] w-auto lg:h-[22px]" />
    </span>
  )
}
