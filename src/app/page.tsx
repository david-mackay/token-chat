'use client'

import React from 'react'
import { TerminalHeader } from '@/components/TerminalHeader'
import { ChatConnection } from '@/components/ChatConnection'
import { ActiveRooms } from '@/components/ActiveRooms'
import { TerminalTips } from '@/components/TerminalTips'
import { TerminalIntro } from '@/components/TerminalIntro'
import { useAppKitAccount } from "@reown/appkit/react"

export default function HomePage(): React.ReactElement {
  const { isConnected } = useAppKitAccount()

  return (
    <main className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-xl mx-auto space-y-6 md:space-y-8">
        <TerminalHeader />
        <TerminalIntro isConnected={isConnected} />
        <ActiveRooms />
        <ChatConnection />
        <TerminalTips />
      </div>
    </main>
  )
}