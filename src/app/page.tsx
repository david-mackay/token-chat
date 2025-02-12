'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppKit } from "@reown/appkit/react"
import { useAppKitAccount } from "@reown/appkit/react"
import { Terminal } from 'lucide-react'
import { ActiveRooms } from '@/components/ActiveRooms'

export default function HomePage(): React.ReactElement {
  const router = useRouter()
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const [tokenAddress, setTokenAddress] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleConnect = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
    open()
  }

  const handleJoinChat = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    
    if (!tokenAddress.trim()) {
      setError('INPUT_REQUIRED: TOKEN_ADDRESS')
      return
    }

    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(tokenAddress)) {
      setError('INVALID_INPUT: SOLANA_TOKEN_ADDRESS_REQUIRED')
      return
    }

    router.push(`/${tokenAddress}`)
  }

  return (
    <main className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-xl mx-auto space-y-4 md:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="text-green-500 w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-mono text-green-500">
              &gt;_ Token Terminal
            </h1>
          </div>
          <button
            onClick={handleConnect}
            className="w-full sm:w-auto bg-black border border-green-500 font-mono text-green-500 px-4 py-2 
                     hover:bg-green-500 hover:text-black transition-colors duration-300"
          >
            {isConnected ? 
              `ADDR: ${address?.slice(0, 4)}...${address?.slice(-4)}` : 
              'CONNECT_WALLET'}
          </button>
        </div>

        <div className="bg-black border border-green-500 p-4 md:p-6">
          <form onSubmit={handleJoinChat} className="space-y-4">
            <div>
              <label htmlFor="tokenAddress" className="block text-green-500 font-mono mb-2">
                TOKEN_ADDRESS:
              </label>
              <input
                type="text"
                id="tokenAddress"
                value={tokenAddress}
                onChange={(e) => {
                  setTokenAddress(e.target.value)
                  setError(null)
                }}
                placeholder="ENTER_SOLANA_TOKEN_ADDRESS"
                className="w-full px-4 py-3 bg-black border border-green-500 text-green-500 font-mono
                         focus:ring-1 focus:ring-green-500 focus:border-green-500 
                         placeholder:text-green-500/50"
              />
              {error && (
                <p className="mt-2 text-red-500 text-sm font-mono">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-500 text-black font-mono px-6 py-3
                       hover:bg-green-600 transition-colors"
            >
              INITIALIZE_CHAT()
            </button>
          </form>
        </div>

        <ActiveRooms />
      </div>
    </main>
  )
}