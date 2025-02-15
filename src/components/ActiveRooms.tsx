'use client'

import React, { useState, useEffect } from 'react'
import { Terminal, Users } from 'lucide-react'
import Link from 'next/link'

interface RoomStats {
  tokenAddress: string;
  userCount: number;
  tokenName?: string;
  tokenSymbol?: string;
  lastPrice?: number;
}

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

interface TerminalLineProps {
  text: string;
  isTyping?: boolean;
  onComplete?: () => void;
}

const TerminalLine: React.FC<TerminalLineProps> = ({ text, isTyping, onComplete }) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (isTyping && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else if (onComplete && currentIndex === text.length) {
      onComplete();
    }
  }, [currentIndex, text, isTyping, onComplete]);

  return (
    <div className="flex items-start">
      <span className="text-green-500 mr-2">&gt;</span>
      <span>{isTyping ? displayedText : text}</span>
      {isTyping && currentIndex < text.length && (
        <span className="inline-block w-2 h-4 bg-green-500 animate-pulse ml-1" />
      )}
    </div>
  );
};

export function ActiveRooms(): React.ReactElement {
  const [rooms, setRooms] = useState<RoomStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);

  const messages = [
    "SCANNING NETWORK FOR ACTIVE ROOMS...",
    "RETRIEVING USER STATISTICS...",
    "FETCHING PRICE DATA..."
  ];

  const defaultSolanaRoom: RoomStats = {
    tokenAddress: "So11111111111111111111111111111111111111112",
    userCount: 3,
    tokenName: "Wrapped SOL",
    tokenSymbol: "SOL",
    lastPrice: 0
  };

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        // First get connected users from our server
        const activeUsersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/active-rooms`);
        if (!activeUsersResponse.ok) throw new Error('Failed to fetch active users');
        const activeUsersData = await activeUsersResponse.json();
        
        // Get all unique token addresses including default SOL
        const tokenAddresses = new Set([
          defaultSolanaRoom.tokenAddress,
          ...activeUsersData.rooms.map((room: RoomStats) => room.tokenAddress)
        ]);

        // Convert addresses to comma-separated string and encode
        const addressesString = Array.from(tokenAddresses).join(',');
        const encodedAddresses = encodeURIComponent(addressesString);

        // Fetch token info and prices in parallel
        const [tokenInfoResponse, priceResponse] = await Promise.all([
          fetch(`https://api-v3.raydium.io/mint/ids?mints=${encodedAddresses}`),
          fetch(`https://api-v3.raydium.io/mint/price?mints=${encodedAddresses}`)
        ]);

        if (!tokenInfoResponse.ok || !priceResponse.ok) {
          throw new Error('Failed to fetch token data');
        }

        const tokenInfoData = await tokenInfoResponse.json();
        const priceData = await priceResponse.json();

        // Create a map of token info
        const tokenInfoMap = tokenInfoData.data.reduce((acc: Record<string, TokenInfo>, token: TokenInfo) => {
          acc[token.address] = token;
          return acc;
        }, {});

        // Combine all data
        let finalRooms = activeUsersData.rooms.map((room: RoomStats) => ({
          ...room,
          tokenName: tokenInfoMap[room.tokenAddress]?.name,
          tokenSymbol: tokenInfoMap[room.tokenAddress]?.symbol,
          lastPrice: Number(priceData.data[room.tokenAddress] || 0)
        }));

        // Add SOL room if it doesn't exist
        const solRoomExists = finalRooms.some(
          (          room: { tokenAddress: string; }) => room.tokenAddress.toLowerCase() === defaultSolanaRoom.tokenAddress.toLowerCase()
        );

        if (!solRoomExists) {
          finalRooms = [{
            ...defaultSolanaRoom,
            lastPrice: Number(priceData.data[defaultSolanaRoom.tokenAddress] || 0)
          }, ...finalRooms];
        }

        setRooms(finalRooms.sort((a: { userCount: number; }, b: { userCount: number; }) => b.userCount - a.userCount));
      } catch (err) {
        console.error('Error fetching data:', err);
        // Even in error case, try to get SOL price
        try {
          const solAddress = defaultSolanaRoom.tokenAddress;
          const encodedSolAddress = encodeURIComponent(solAddress);
          const solPriceResponse = await fetch(`https://api-v3.raydium.io/mint/price?mints=${encodedSolAddress}`);
          
          if (solPriceResponse.ok) {
            const solPriceData = await solPriceResponse.json();
            setRooms([{
              ...defaultSolanaRoom,
              lastPrice: Number(solPriceData.data[solAddress] || 0)
            }]);
          } else {
            setRooms([defaultSolanaRoom]);
          }
        } catch (priceErr) {
          console.error('Error fetching SOL price:', priceErr);
          setRooms([defaultSolanaRoom]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenData();
  }, [defaultSolanaRoom]); // Added defaultSolanaRoom to dependencies

  const handleNextMessage = () => {
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    }
  };

  const formatPrice = (price?: number): string => {
    if (!price) return 'N/A';
    return price < 0.01 ? 
      `$${price.toExponential(2)}` : 
      `$${price.toFixed(2)}`;
  };

  return (
    <div className="bg-black border border-green-500 p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="text-green-500 w-6 h-6" />
        <h2 className="text-xl font-mono text-green-500">ACTIVE ROOMS</h2>
      </div>

      <div className="space-y-4 font-mono">
        {isLoading ? (
          messages.slice(0, currentMessageIndex + 1).map((msg, index) => (
            <TerminalLine
              key={index}
              text={msg}
              isTyping={index === currentMessageIndex}
              onComplete={handleNextMessage}
            />
          ))
        ) : (
          <div className="space-y-2">
            {rooms.map((room) => (
              <Link 
                key={room.tokenAddress}
                href={`/${room.tokenAddress}`}
              >
                <div className="flex items-center justify-between p-2 border border-green-500/30 
                              hover:border-green-500 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="text-green-500 w-4 h-4" />
                      <span className="text-green-500">{room.userCount}</span>
                    </div>
                    <div>
                      <span className="text-green-500">
                        {room.tokenSymbol || room.tokenAddress.slice(0, 4)}
                      </span>
                      <span className="text-green-500/50 text-sm ml-2">
                        {formatPrice(room.lastPrice)}
                      </span>
                    </div>
                  </div>
                  <span className="text-green-500/30 text-xs">
                    {room.tokenAddress.slice(0, 4)}...{room.tokenAddress.slice(-4)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}