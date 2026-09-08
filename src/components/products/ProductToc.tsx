'use client'

import { useEffect, useRef, useState } from 'react'
import { Container } from '@/components/ui/Container'

export type TocItem = { id: string; label: string }

/**
 * The on-page nav. Client-side only for the active state — the scrolling itself
 * is a plain anchor plus `scroll-behavior: smooth` in globals.css, which the
 * global reduced-motion block turns back into a jump.
 *
 * The observer's top margin is the sticky header plus this bar, read from the
 * same CSS variables that position them, so a header height change cannot leave
 * the highlight pointing at the wrong section.
 */
export function ProductToc({ items, label }: { items: TocItem[]; label: string }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const offset = () => {
      const styles = getComputedStyle(document.documentElement)
      const read = (name: string) => parseFloat(styles.getPropertyValue(name)) || 0
      return read('--header-height') + read('--toc-height')
    }

    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      // A thin band just under the header: whichever section crosses it owns
      // the highlight.
      { rootMargin: `-${offset() + 4}px 0px -75% 0px`, threshold: 0 },
    )
    for (const section of sections) observer.observe(section)
    return () => observer.disconnect()
  }, [items])

  return (
    <div
      ref={barRef}
      /* Sticky on desktop only. On mobile it is a stacked list of five rows —
         pinning that would eat a third of the viewport, which is why
         `--toc-height` is 0 there and anchors offset for the header alone. */
      className="border-y border-ink/10 bg-soft lg:sticky lg:top-[var(--header-height)] lg:z-30"
    >
      <Container>
        <nav
          aria-label={label}
          className="flex flex-col lg:flex-row lg:flex-wrap lg:gap-8 lg:py-4"
        >
          {items.map((item, index) => {
            const active = item.id === activeId
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={active ? 'true' : undefined}
                className={[
                  'flex min-h-11 items-center text-[1.0625rem] transition-colors duration-[140ms] ease-out',
                  // Desktop rows sit in one row 32px apart, which clears the
                  // target-spacing exception; mobile rows stay 44px tall.
                  'lg:min-h-0 lg:py-1.5 lg:leading-none',
                  // Mobile is a hairline-separated stack, with no rule above
                  // the first row; desktop is one uppercase row.
                  index === 0 ? '' : 'border-t border-ink/10',
                  'lg:border-t-0 lg:text-[0.9375rem] lg:font-medium lg:uppercase lg:tracking-[0.04em]',
                  active
                    ? 'text-accent lg:border-b-2 lg:border-accent'
                    : 'text-ink hover:text-ink lg:text-muted lg:hover:text-ink',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {item.label}
              </a>
            )
          })}
        </nav>
      </Container>
    </div>
  )
}
