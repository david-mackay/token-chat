// src/components/TokenPrice/PriceDisplay.tsx
import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { WebSocketStatus } from '@/types/websocket';


interface PriceDisplayProps {
  tokenAddress: string;
  socket: Socket;
  connectionStatus: WebSocketStatus;  // Add this prop
}

interface PriceData {
  tokenAddress: string;
  price: number;
  tokenName: string | null;
  tokenSymbol: string | null;
  timestamp: string;
}

export function PriceDisplay({ 
  tokenAddress, 
  socket,
  connectionStatus 
}: PriceDisplayProps): React.ReactElement {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  useEffect(() => {
    socket.on('price_update', (message: { type: string; data: PriceData }) => {
      try {
        if (message.data.tokenAddress === tokenAddress) {
          setPriceData(message.data);
          const utcDate = parseISO(message.data.timestamp);
          setLastUpdateTime(formatDistanceToNow(utcDate, {
            addSuffix: true,
            includeSeconds: true
          }));
        }
      } catch (error) {
        console.error('Error processing price update:', error);
      }
    });

    return () => {
      socket.off('price_update');
    };
  }, [tokenAddress, socket]);

  if (connectionStatus === 'connecting' || connectionStatus === 'disconnected') {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (connectionStatus === 'error' || !priceData) {
    return (
      <div className="text-red-500 text-sm flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
        Unable to load price data. Please check your connection.
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center">
      <div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-bold">
            ${priceData.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6
            })}
          </h2>
          {priceData.tokenSymbol && (
            <span className="text-gray-600">{priceData.tokenSymbol}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 'bg-gray-500'
          }`}></span>
          Updated {lastUpdateTime}
        </div>
      </div>
      {priceData.tokenName && (
        <div className="text-right">
          <div className="text-sm text-gray-600">Token Name</div>
          <div className="font-medium">{priceData.tokenName}</div>
        </div>
      )}
    </div>
  );
}