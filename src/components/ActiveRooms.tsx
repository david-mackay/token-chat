'use client'

import React, { useState, useEffect } from 'react'
import { Terminal, Users } from 'lucide-react'
import Link from 'next/link'
import { DEFAULT_ROOMS } from '../config'
import { RoomStats, TokenInfo } from '@/types/componentdata'

interface TerminalLineProps {
  text: string;
  isTyping?: boolean;
  onComplete?: () => void;
}

const LOADING_MESSAGES = [
  "SCANNING NETWORK FOR ACTIVE ROOMS...",
  "RETRIEVING USER STATISTICS...",
  "FETCHING PRICE DATA..."
];

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

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        // First get connected users from our server
        const activeUsersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/active-rooms`);
        if (!activeUsersResponse.ok) throw new Error('Failed to fetch active users');
        const activeUsersData = await activeUsersResponse.json();
        
        // Get all unique token addresses including default rooms
        const tokenAddresses = new Set([
          ...DEFAULT_ROOMS.map(room => room.tokenAddress),
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
        const finalRooms = activeUsersData.rooms.map((room: RoomStats) => ({
          ...room,
          tokenName: tokenInfoMap[room.tokenAddress]?.name,
          tokenSymbol: tokenInfoMap[room.tokenAddress]?.symbol,
          lastPrice: Number(priceData.data[room.tokenAddress] || 0),
          isExtraActive: room.userCount > 10 // Example condition for extra active rooms
        }));

        // Add default rooms if they don't exist
        DEFAULT_ROOMS.forEach(defaultRoom => {
          const roomExists = finalRooms.some(
            (room: { tokenAddress: string; }) => room.tokenAddress.toLowerCase() === defaultRoom.tokenAddress.toLowerCase()
          );

          if (!roomExists) {
            finalRooms.push({
              ...defaultRoom,
              lastPrice: Number(priceData.data[defaultRoom.tokenAddress] || 0),
              isExtraActive: defaultRoom.userCount > 10 // Example condition for extra active rooms
            });
          }
        });

        setRooms(finalRooms.sort((a: { userCount: number; }, b: { userCount: number; }) => b.userCount - a.userCount));
      } catch (err) {
        console.error('Error fetching data:', err);
        // Even in error case, try to get default room prices
        try {
          const defaultRoomAddresses = DEFAULT_ROOMS.map(room => room.tokenAddress);
          const encodedDefaultRoomAddresses = encodeURIComponent(defaultRoomAddresses.join(','));
          const defaultRoomPriceResponse = await fetch(`https://api-v3.raydium.io/mint/price?mints=${encodedDefaultRoomAddresses}`);
          
          if (defaultRoomPriceResponse.ok) {
            const defaultRoomPriceData = await defaultRoomPriceResponse.json();
            setRooms(DEFAULT_ROOMS.map(room => ({
              ...room,
              lastPrice: Number(defaultRoomPriceData.data[room.tokenAddress] || 0),
              isExtraActive: room.userCount > 10 // Example condition for extra active rooms
            })));
          } else {
            setRooms(DEFAULT_ROOMS);
          }
        } catch (priceErr) {
          console.error('Error fetching default room prices:', priceErr);
          setRooms(DEFAULT_ROOMS);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenData();
  }, []); // Removed defaultSolanaRoom from dependencies

  const handleNextMessage = () => {
    if (currentMessageIndex < LOADING_MESSAGES.length - 1) {
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
          LOADING_MESSAGES.slice(0, currentMessageIndex + 1).map((msg, index) => (
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
                <div className={`flex items-center justify-between p-2 border border-green-500 hover:border-green-500 transition-colors cursor-pointer`}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users className={`w-4 h-4 ${room.isExtraActive ? 'text-red-500 animate-pulse' : 'text-green-500'}`} />
                      <span className={room.isExtraActive ? 'rainbow-text' : 'text-green-500'}>{room.userCount}</span>
                    </div>
                    <div>
                      <span className={room.isExtraActive ? 'rainbow-text' : 'text-green-500'}>
                        {room.tokenSymbol || room.tokenAddress.slice(0, 4)}
                      </span>
                      <span className={`text-sm ml-2 ${room.isExtraActive ? 'rainbow-text' : 'text-green-500'}`}>
                        {formatPrice(room.lastPrice)}
                      </span>
                    </div>
                    {room.isExtraActive && <span className="ml-2 text-red-500">🔥</span>}
                  </div>
                  <span className={`text-green-500/30 text-xs ${room.isExtraActive ? 'rainbow-text' : 'text-green-500'}`}>
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