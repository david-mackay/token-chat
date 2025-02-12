// src/components/TokenPrice/PriceDisplay.tsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { WebSocketStatus } from '@/types/websocket';

interface PriceDisplayProps {
  tokenAddress: string;
  price: number | null;
  connectionStatus: WebSocketStatus;
}

export function PriceDisplay({ 
  tokenAddress, 
  price,
  connectionStatus 
}: PriceDisplayProps): React.ReactElement {
  const [lastUpdateTime, setLastUpdateTime] = React.useState<string>('');

  React.useEffect(() => {
    if (price !== null) {
      const now = new Date();
      setLastUpdateTime(formatDistanceToNow(now, {
        addSuffix: true,
        includeSeconds: true,
      }));
    }
  }, [price]);

  if (connectionStatus === 'connecting' || connectionStatus === 'disconnected') {
    return (
      <div className="p-4">
        <div className="font-mono text-green-500/50 animate-pulse">
          FETCHING_PRICE_DATA...
        </div>
      </div>
    );
  }
  
  if (connectionStatus === 'error' || price === null) {
    return (
      <div className="p-4 font-mono text-red-500 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-red-500"></span>
        ERROR: PRICE_DATA_UNAVAILABLE
      </div>
    );
  }

  return (
<div className="flex flex-col p-4">
  <div className="flex items-center gap-2 mb-1">
    <span className={`w-2 h-2 ${
      connectionStatus === 'connected' ? 'bg-green-500' : 'bg-gray-500'
    }`}></span>
    <span className="font-mono text-sm text-green-500/70 overflow-hidden text-ellipsis">
      {`${tokenAddress.slice(0, 4)}...${tokenAddress.slice(-4)}`}
    </span>
  </div>
  
  <div className="flex items-baseline gap-2">
    <h2 className="text-2xl font-mono font-bold text-green-500">
      ${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      })}
    </h2>
    <span className="text-xs font-mono text-green-500/70">
      {lastUpdateTime || 'NOW'}
    </span>
  </div>
</div>
  );
}