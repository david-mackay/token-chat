// src/app/page.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppKit } from "@reown/appkit/react"
import { useAppKitAccount } from "@reown/appkit/react"

export default function HomePage(): React.ReactElement {
  const router = useRouter()
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const [tokenAddress, setTokenAddress] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleConnect = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
    open()
  }

  const handleJoinChat = (event: React.FormEvent): void => {
    event.preventDefault()
    
    if (!tokenAddress.trim()) {
      setError('Please enter a token address')
      return
    }

    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(tokenAddress)) {
      setError('Please enter a valid Solana token address')
      return
    }

    router.push(`/${tokenAddress}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 p-6">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="flex justify-end">
          <button
            onClick={handleConnect}
            className="bg-white/10 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/20 transition-colors"
          >
            {isConnected ? 
              `${address?.slice(0, 4)}...${address?.slice(-4)}` : 
              'Connect Wallet'}
          </button>
        </div>

        <div className="text-center mt-12 mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Token Chat</h1>
          <p className="text-xl text-white/90">
            Join token-specific chat rooms and discuss with other holders
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleJoinChat} className="space-y-6">
            <div>
              <label htmlFor="tokenAddress" className="block text-gray-700 font-medium mb-2">
                Enter Token Address
              </label>
              <input
                type="text"
                id="tokenAddress"
                value={tokenAddress}
                onChange={(e) => {
                  setTokenAddress(e.target.value)
                  setError(null)
                }}
                placeholder="Solana token address"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {error && (
                <p className="mt-2 text-red-500 text-sm">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Join Chat Room
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}