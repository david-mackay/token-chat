
// src/types/websocket.ts

export interface Message {
  id: string;
  content: string;
  walletAddress: string;
  timestamp: string;
  colorCode?: string;
  isLocal?: boolean;
}

export interface WebSocketMessage {
    type: 'chat' | 'price_update' | 'subscribe_token' | 'connection_established';
    data: ChatMessage | PriceUpdate | TokenSubscription | ConnectionStatus;
  }
  
  export interface ChatMessage extends Message{
    id: string;
    content: string;
    walletAddress: string;
    tokenAddress: string,
    timestamp: string;
    colorCode?: string;
    isLocal?: boolean;
  }
  
  export interface PriceUpdate {
    tokenAddress: string;
    price: number;
    priceChange24h: number;
    volume24h: number;
    lastUpdated: string;
  }
  
  export interface TokenSubscription {
    tokenAddress: string;
  }
  
  export interface ConnectionStatus {
    status: 'connected' | 'disconnected';
    timestamp: string;
  }
  
  export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';