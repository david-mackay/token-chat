'use client'

import React from 'react'
import { Terminal } from 'lucide-react'
import { useAppKit } from "@reown/appkit/react"
import { useAppKitAccount } from "@reown/appkit/react"

export function TerminalHeader(): React.ReactElement {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  const handleConnect = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
    open()
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2 group">
        <Terminal className="text-green-500 w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
        <h1 className="text-3xl md:text-2xl font-mono text-green-500 tracking-wider animate-pulse">
          TR4DE TERMINAL
        </h1>
      </div>
      <button
        onClick={handleConnect}
        className="w-full sm:w-auto bg-black border border-green-500 font-mono text-green-500 px-4 py-2 
                 relative overflow-hidden group"
      >
        <span className="relative z-10 group-hover:text-black transition-colors duration-300">
          {isConnected ? 
            `ADDR: ${address?.slice(0, 4)}...${address?.slice(-4)}` : 
            'CONNECT_WALLET'}
        </span>
        <div className="absolute inset-0 bg-green-500 transform -translate-x-full 
                      group-hover:translate-x-0 transition-transform duration-300" />
      </button>
    </div>
  )
}