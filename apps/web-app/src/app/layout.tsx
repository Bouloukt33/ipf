import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IPF Web App',
  description: 'Main web application for IPF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
