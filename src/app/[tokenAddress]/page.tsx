'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAppKit } from "@reown/appkit/react"
import { useAppKitAccount } from "@reown/appkit/react"
import { useAppKitProvider } from '@reown/appkit/react'
import type { Provider } from '@reown/appkit-adapter-solana/react'
import { ChatWindow } from '@/components/Chat/ChatWindow'
import { MessageInput } from '@/components/Chat/MessageInput'
import { PriceDisplay } from '@/components/TokenPrice/PriceDisplay'
import { generateColorFromAddress } from '@/utils/colorGeneration'
import type { ChatMessage, LocalMessage } from '@/types/websocket'
import { io, Socket } from 'socket.io-client'

interface PageState {
  messages: (ChatMessage | LocalMessage)[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  error: string | null;
  price: number | null;
  sessionToken: string | null;
}

interface AuthCredentials {
  auth_message: string;
  signature: string;
  wallet_address: string;
}

export default function TokenChatPage(): React.ReactElement {
  const params = useParams();
  const tokenAddress = params.tokenAddress as string;
  
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [authCredentials, setAuthCredentials] = useState<AuthCredentials | null>(null);
  const [pageState, setPageState] = useState<PageState>({
    messages: [],
    connectionStatus: 'connecting',
    error: null,
    price: null,
    sessionToken: null
  });

  // First, handle wallet authentication
  const getAuthCredentials = useCallback(async () => {
    if (!isConnected || !address || !walletProvider) {
      setPageState(prev => ({
        ...prev,
        connectionStatus: 'disconnected',
        error: 'Please connect your wallet'
      }));
      return null;
    }
  
    try {
      const timestamp = Date.now();
      const message = `Authenticate chat access for token ${tokenAddress} at ${timestamp}`;
      const encodedMessage = new TextEncoder().encode(message);
  
      console.log('Requesting wallet signature...');
      const signature = await walletProvider.signMessage(encodedMessage);
      const signatureHex = Buffer.from(signature).toString('hex');
  
      return {
        auth_message: message,
        signature: signatureHex,
        wallet_address: address
      };
    } catch (error) {
      console.error('Authentication error:', error);
      setPageState(prev => ({
        ...prev,
        connectionStatus: 'error',
        error: 'Failed to sign message'
      }));
      return null;
    }
  }, [isConnected, address, walletProvider, tokenAddress]);

  const handleLocalMessage = (content: string) => {
    const localMessage: LocalMessage = {
      id: crypto.randomUUID(),
      content,
      walletAddress: 'SYSTEM',
      tokenAddress: tokenAddress,
      timestamp: new Date().toISOString(),
      isLocal: true,
      colorCode: generateColorFromAddress('SYSTEM')
    };
  
    setPageState(prev => ({
      ...prev,
      messages: [...prev.messages, localMessage]
    }));
  };

  // Handle initial authentication when wallet connects
  useEffect(() => {
    const authenticate = async () => {
      const credentials = await getAuthCredentials();
      if (credentials) {
        setAuthCredentials(credentials);
      }
    };
  
    if (isConnected && !authCredentials) {
      authenticate();
    }
  }, [isConnected, address, authCredentials, getAuthCredentials]);

  // Only establish socket connection after we have auth credentials
  useEffect(() => {
    if (!authCredentials) return;

    console.log('Setting up socket connection with auth credentials...');
    const socketUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
    const newSocket = io(socketUrl, {
      query: {
        token_address: tokenAddress,
        ...authCredentials
      },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setPageState(prev => ({
        ...prev,
        connectionStatus: 'connected',
        error: null
      }));
    });

    newSocket.on('auth_success', (response: { session_token: string }) => {
      console.log('Authentication successful');
      setPageState(prev => ({
        ...prev,
        sessionToken: response.session_token,
        error: null
      }));
    });

    newSocket.on('auth_error', (error: string) => {
      console.log('Authentication failed:', error);
      setPageState(prev => ({
        ...prev,
        connectionStatus: 'error',
        error: 'Authentication failed',
        sessionToken: null
      }));
      // Clear auth credentials to allow retry
      setAuthCredentials(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setPageState(prev => ({
        ...prev,
        connectionStatus: 'disconnected',
        error: 'Connection lost. Attempting to reconnect...',
        sessionToken: null
      }));
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setPageState(prev => ({
        ...prev,
        connectionStatus: 'error',
        error: 'Failed to connect. Please try again later.',
        sessionToken: null
      }));
    });

    newSocket.on('message_history', (data) => {
      try {
        const messages = data.data as ChatMessage[];
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

    newSocket.on('chat_message', (data) => {
      try {
        const message = data.data as ChatMessage;
        setPageState(prev => ({
          ...prev,
          messages: [...prev.messages, {
            ...message,
            colorCode: generateColorFromAddress(message.walletAddress)
          }]
        }));
      } catch (error) {
        console.error('Error processing chat message:', error);
      }
    });

    newSocket.on('price_update', (data) => {
      try {
        setPageState(prev => ({
          ...prev,
          price: data.data.price
        }));
      } catch (error) {
        console.error('Error processing price update:', error);
      }
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.close();
      setSocket(null);
    };
  }, [authCredentials, tokenAddress]);

  const handleSendMessage = async (content: string) => {
    if (!isConnected || !address || !socket || !pageState.sessionToken) {
      return;
    }
  
    try {
      const message = {
        content,
        walletAddress: address,
        tokenAddress: tokenAddress,
        timestamp: new Date().toISOString(),
        session_token: pageState.sessionToken,
        colorCode: generateColorFromAddress(address)
      };
  
      socket.emit('chat_message', message);
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
    <div className="flex flex-col h-screen">
      {/* Sticky Header with Price Display */}
      <div className="sticky top-0 z-10 border-b border-green-500 bg-black">
        <PriceDisplay
          tokenAddress={tokenAddress}
          price={pageState.price}
          connectionStatus={pageState.connectionStatus}
        />
      </div>

      {pageState.error && (
        <div className="bg-red-900/20 border border-red-500 font-mono text-red-500 p-2 text-center">
          ERROR: {pageState.error}
        </div>
      )}

      {!isConnected ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-black border border-green-500 p-6 text-center w-full max-w-md">
            <p className="text-green-500 font-mono mb-4">
              AUTH_REQUIRED: CONNECT WALLET TO ACCESS TERMINAL
            </p>
            <button
              onClick={handleConnect}
              className="bg-green-500 text-black font-mono px-6 py-3 
                       hover:bg-green-600 transition-colors duration-300"
            >
              INITIALIZE_CONNECTION()
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-hidden">
            <ChatWindow
              messages={pageState.messages}
              currentUserAddress={address}
              isLoading={pageState.connectionStatus === 'connecting'}
            />
          </div>
          <MessageInput 
            onSendMessage={handleSendMessage}
            onLocalMessage={handleLocalMessage}
            disabled={!isConnected || !socket || !pageState.sessionToken}
            tokenAddress={tokenAddress}
          />
        </div>
      )}

      {/* Fixed bottom wallet button */}
      <div className="border-t border-green-500 p-2 bg-black">
        <button
          onClick={handleConnect}
          className="w-full bg-black border border-green-500 font-mono text-green-500 px-4 py-2 
                   hover:bg-green-500 hover:text-black transition-colors duration-300"
        >
          {isConnected ? 
            `ADDR: ${address?.slice(0, 4)}...${address?.slice(-4)}` : 
            'CONNECT_WALLET'}
        </button>
      </div>
    </div>
  );
}