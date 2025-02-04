import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AppKit } from '../context/appkit'
import './globals.css'

export const metadata: Metadata = {
  title: 'Token Chat',
  description: 'Real-time token price tracking and discussion platform',
  openGraph: {
    title: 'Token Chat',
    description: 'Track token prices and discuss with other traders in real-time',
    type: 'website'
  },
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico'
  }
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AppKit>{children}</AppKit>
      </body>
    </html>
  )
}