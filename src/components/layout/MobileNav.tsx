'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type NavItem = { href: string; label: string }

export function MobileNav({
  items,
  openLabel,
  closeLabel,
  switcher,
}: {
  items: NavItem[]
  openLabel: string
  closeLabel: string
  switcher?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Prevent the page scrolling behind the open panel.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Move focus into the panel on open. On close (Escape, close button, link
  // click, or unmount) the cleanup below runs and returns focus to the
  // trigger, so keyboard position is never lost.
  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    return () => {
      triggerRef.current?.focus()
    }
  }, [open])

  // Escape closes the panel; Tab/Shift+Tab cycles within it (a minimal focus
  // trap) so keyboard focus can't leak into the obscured page behind it.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = panel.querySelectorAll<HTMLElement>('button, a[href]')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
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
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={openLabel}
            className="fixed inset-0 z-50 flex flex-col bg-surface lg:hidden"
          >
            <div className="flex items-center justify-between px-5 py-4">
              {switcher}
              <button
                ref={closeButtonRef}
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
