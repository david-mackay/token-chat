'use client'

import React from 'react'
import { ChatConnection } from '@/components/ChatConnection'
import { ActiveRooms } from '@/components/ActiveRooms'
import { TerminalTips } from '@/components/TerminalTips'

export default function HomePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-xl mx-auto space-y-4 md:space-y-8">
        <ChatConnection />
        <ActiveRooms />
        <TerminalTips />
      </div>
    </main>
  )
}