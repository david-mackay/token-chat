import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AppKit } from '../context/appkit'
import './globals.css'

export const metadata: Metadata = {
  title: 'Token Terminal',
  description: 'Real-time token price tracking and discussion platform',
  openGraph: {
    title: 'Token Terminal',
    description: 'Track token prices and discuss with other traders in real-time',
    type: 'website'
  },
  icons: {
    icon: '/favicon.ico'
  }
}
export const viewport = 'width=device-width, initial-scale=1, maximum-scale=1';

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black font-mono text-green-500">
        <AppKit>{children}</AppKit>
      </body>
    </html>
  )
}