// src/components/Header/Header.tsx
import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { PriceDisplay } from '@/components/TokenPrice/PriceDisplay';
import { WebSocketStatus } from '@/types/websocket';

interface HeaderProps {
  tokenAddress: string;
  price: number | null;
  connectionStatus: WebSocketStatus;
}

export const Header: React.FC<HeaderProps> = ({ tokenAddress, price, connectionStatus }) => {
  return (
    <header className="p-4 bg-black border-b border-green-500">
      <div className="flex justify-between items-center">
        <Link 
          href="/"
          className="p-2 border border-green-500 text-green-500 hover:bg-green-500 
                   hover:text-black transition-colors flex items-center gap-2 font-mono"
        >
          <Home size={20} />
          <span className="hidden sm:inline">HOME</span>
        </Link>
        
        <PriceDisplay 
          tokenAddress={tokenAddress}
          price={price}
          connectionStatus={connectionStatus}
        />
      </div>
    </header>
  );
};