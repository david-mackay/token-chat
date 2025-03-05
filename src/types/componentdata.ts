export interface RoomStats {
    tokenAddress: string;
    userCount: number;
    tokenName?: string;
    tokenSymbol?: string;
    lastPrice?: number;
    isExtraActive?: boolean;
  }
  
export interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  }