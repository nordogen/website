import './globals.css'
import { jost } from '@/lib/fonts'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={jost.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
