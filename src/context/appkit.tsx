'use client'

import { ReactNode } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { 
  solana
} from '@reown/appkit/networks'
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter 
} from '@solana/wallet-adapter-wallets'

// Define types for metadata
interface AppMetadata {
  name: string
  description: string
  url: string
  icons: string[]
}

// Define types for AppKit features
interface AppKitFeatures {
  analytics: boolean
}

// Define type for AppKit props
interface AppKitProps {
  children: ReactNode
}

// Project configuration
const projectId = 'c2d62c326c8f0490623d8990db1984f2'

const metadata: AppMetadata = {
  name: 'Token Terminal',
  description: 'Track token prices and discuss in real time with other traders.',
  url: 'https://tr4de.fun',
  icons: ['https://tr4de.fun/og-image.png']
}

// Initialize Solana adapter with typed wallets
const solanaAdapter = new SolanaAdapter({
  wallets: [
    new PhantomWalletAdapter(), 
    new SolflareWalletAdapter()
  ]
})

// Create AppKit instance with typed configuration
createAppKit({
  adapters: [solanaAdapter],
  projectId,
  networks: [solana],
  metadata,
  features: {
    email: true, // default to true
    socials: ['google', 'x', 'discord', 'farcaster', 'github', 'apple', 'facebook'],
    emailShowWallets: true, // default to true    
  },
  allWallets: 'SHOW', // default to SHOW
})

// Export typed AppKit component
export function AppKit({ children }: AppKitProps): React.ReactElement {
  return <>{children}</>
}