import { Newsreader, Work_Sans } from 'next/font/google'

/**
 * Display face: headings, product names, the numerals on the principles grid
 * and the logo wordmark. Serif, set at 400 throughout.
 */
export const newsreader = Newsreader({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-newsreader',
  display: 'swap',
})

/** Text face: everything that is not a heading. */
export const workSans = Work_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-work-sans',
  display: 'swap',
})
