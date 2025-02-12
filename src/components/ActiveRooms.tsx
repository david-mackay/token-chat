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
  const [error, setError] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);

  const messages = [
    "SCANNING NETWORK FOR ACTIVE ROOMS...",
    "RETRIEVING USER STATISTICS...",
    "FETCHING PRICE DATA..."
  ];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/active-rooms`);
        if (!response.ok) throw new Error('Failed to fetch active rooms');
        
        const data = await response.json();
        setRooms(data.rooms.sort((a: RoomStats, b: RoomStats) => b.userCount - a.userCount));
      } catch (err) {
        setError('ERROR: FAILED TO FETCH ROOM DATA');
        console.error('Error fetching rooms:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

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

  if (error) {
    return (
      <div className="bg-black border border-red-500 p-4 md:p-6">
        <div className="text-red-500 font-mono">{error}</div>
      </div>
    );
  }

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
        ) : rooms.length > 0 ? (
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
        ) : (
          <div className="text-green-500/50">NO ACTIVE ROOMS FOUND</div>
        )}
      </div>
    </div>
  );
}