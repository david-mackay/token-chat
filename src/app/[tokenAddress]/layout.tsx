// src/app/[tokenAddress]/layout.tsx
import type { ReactNode } from 'react'
import { Analytics } from "@vercel/analytics/react"

interface TokenLayoutProps {
  children: ReactNode
}

export default function TokenLayout({ children }: TokenLayoutProps): React.ReactElement {
  return (
    <div className="flex flex-col h-screen bg-black">
      {children}
      <Analytics />
    </div>
  )
}