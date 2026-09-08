'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'

export type NavItem = { href: string; label: string }

/**
 * The mobile drawer. It is a disclosure, not a dialog: the panel opens
 * directly under the header and the page stays visible behind it, so it
 * carries `aria-expanded`/`aria-controls` rather than `aria-modal`.
 *
 * The panel is absolutely positioned against the header, which is why the
 * header carries `relative`. The header no longer uses `backdrop-filter` — if
 * that ever comes back, note that it establishes a containing block for
 * `position: fixed` descendants and this panel would need portalling to
 * `document.body` again.
 */
export function MobileNav({
  items,
  openLabel,
  closeLabel,
}: {
  items: NavItem[]
  openLabel: string
  closeLabel: string
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Prevent the page scrolling behind the open panel.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Escape closes and hands focus back to the trigger, so keyboard position is
  // never lost.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        aria-controls={panelId}
        className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-ink"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
          ) : (
            <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" />
          )}
        </svg>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-ink/10 bg-paper"
      >
        <nav className="px-5">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-14 items-center border-b border-ink/10 text-[1.0625rem] font-medium text-ink last:border-b-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
