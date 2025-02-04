// src/app/tc/[tokenAddress]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAppKit } from "@reown/appkit/react"
import { useAppKitAccount } from "@reown/appkit/react"
import { io, Socket } from 'socket.io-client'
import { ChatWindow } from '@/components/Chat/ChatWindow'
import { MessageInput } from '@/components/Chat/MessageInput'
import { PriceDisplay } from '@/components/TokenPrice/PriceDisplay'
import { generateColorFromAddress } from '@/utils/colorGeneration'
import type { WebSocketMessage, ChatMessage, WebSocketStatus } from '@/types/websocket'

interface PageState {
  messages: ChatMessage[];
  wsStatus: WebSocketStatus;
  error: string | null;
}

export default function TokenChatPage(): React.ReactElement {
  const params = useParams();
  const tokenAddress = params.tokenAddress as string;
  
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pageState, setPageState] = useState<PageState>({
    messages: [],
    wsStatus: 'connecting',
    error: null
  });

  useEffect(() => {
    const socketIO = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || '', {
      query: { token_address: tokenAddress },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketIO.on('connect', () => {
      setPageState(prev => ({
        ...prev,
        wsStatus: 'connected',
        error: null
      }));
    });

    socketIO.on('disconnect', () => {
      setPageState(prev => ({
        ...prev,
        wsStatus: 'disconnected',
        error: 'Connection lost. Attempting to reconnect...'
      }));
    });

    socketIO.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setPageState(prev => ({
        ...prev,
        wsStatus: 'error',
        error: 'Failed to connect. Please try again later.'
      }));
    });

    socketIO.on('chat_message', (message: WebSocketMessage) => {
      try {
        const chatMessage = message.data as ChatMessage;
        setPageState(prev => {
          const messageExists = prev.messages.some(msg => msg.id === chatMessage.id);
          if (messageExists) {
            return prev;
          }
          
          return {
            ...prev,
            messages: [...prev.messages, {
              ...chatMessage,
              colorCode: generateColorFromAddress(chatMessage.walletAddress)
            }]
          };
        });
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    socketIO.on('message_history', (message: { type: 'message_history', data: ChatMessage[] }) => {
      try {
        const messages = message.data;
        setPageState(prev => ({
          ...prev,
          messages: messages.map(msg => ({
            ...msg,
            colorCode: generateColorFromAddress(msg.walletAddress)
          }))
        }));
      } catch (error) {
        console.error('Error processing message history:', error);
      }
    });

    setSocket(socketIO);

    return () => {
      socketIO.disconnect();
    };
  }, [tokenAddress]);

  const handleSendMessage = async (content: string) => {
    if (!socket || !isConnected || !address) {
      return;
    }

    try {
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        walletAddress: address,
        tokenAddress: tokenAddress,
        timestamp: new Date().toISOString(),
        colorCode: generateColorFromAddress(address)
      };

      socket.emit('chat_message', message);

      // Optimistic update
      setPageState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setPageState(prev => ({
        ...prev,
        error: 'Failed to send message. Please try again.'
      }));
    }
  };

  const handleConnect = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    open();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Token Chat</h1>
            <p className="text-white/90">
              {pageState.wsStatus === 'connected' ? 
                `Discussing ${tokenAddress}` : 
                'Connecting to chat server...'}
            </p>
          </div>
          <button
            onClick={handleConnect}
            className="bg-white/10 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/20 transition-colors"
          >
            {isConnected ? 
              `${address?.slice(0, 4)}...${address?.slice(-4)}` : 
              'Connect Wallet'}
          </button>
        </div>
  
        {/*TODO: FIX TIMESTAMP PARSING*/}
        {pageState.error && (
          <div className="bg-red-500/10 backdrop-blur-sm rounded-lg p-4 text-white text-center">
            {pageState.error}
          </div>
        )}

        {!isConnected ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
            <p className="text-white mb-4">Connect your wallet to join the conversation</p>
            <button
              onClick={handleConnect}
              className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {socket && (
              <div className="p-4 border-b">
                <PriceDisplay 
                  tokenAddress={tokenAddress} 
                  socket={socket}
                  connectionStatus={pageState.wsStatus}
                />
              </div>
            )}

            <div className="flex flex-col h-[600px]">
              <ChatWindow
                messages={pageState.messages}
                currentUserAddress={address}
                isLoading={pageState.wsStatus === 'connecting'}
              />
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={!socket || !socket.connected} 
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}