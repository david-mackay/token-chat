import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AppKit } from '@/context/appkit'
import { Analytics } from "@vercel/analytics/react"
import MatrixRain from '@/components/Visuals/MatrixRain'

import './globals.css'

export const metadata: Metadata = {
  title: 'TR4DE',
  description: 'Real-time token price tracking and discussion platform',
  metadataBase: new URL('https://tr4de.fun'),
  openGraph: {
    title: 'TR4DE',
    description: 'Track token prices and discuss with other traders in real-time',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TR4DE',
    description: 'Track token prices and discuss with other traders in real-time',
    images: ['/og-image.png'],
    creator: '@tr4defun',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/site.webmanifest',
}

export const viewport = 'width=device-width, initial-scale=1, maximum-scale=1';

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en">
      <meta name="twitter:image" content="https://tr4de.fun/og-image.png" />
      <body className="min-h-screen bg-black font-mono text-green-500">
        <MatrixRain />
        <AppKit>
          <main className="z-10 block contents">
            {children}
          </main>
        </AppKit>
        <Analytics/>
      </body>
    </html>
  )
}