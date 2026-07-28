'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type NavItem = { href: string; label: string }

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

  // Prevent the page scrolling behind the open panel.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={openLabel}
        aria-expanded={open}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-brand-teal"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </button>

      {open &&
        createPortal(
          // Portalled to <body>: the header is `sticky` with `backdrop-blur`,
          // and backdrop-filter establishes a containing block for `fixed`
          // descendants. Left in place, this panel would be pinned to the
          // header's own box instead of the viewport. Rendering it outside
          // the header avoids that.
          <div className="fixed inset-0 z-50 flex flex-col bg-surface lg:hidden">
            <div className="flex items-center justify-end px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={closeLabel}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-brand-teal"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-5">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center border-b border-brand-blue-tint/40 text-lg font-medium text-brand-teal"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>,
          document.body,
        )}
    </div>
  )
}
