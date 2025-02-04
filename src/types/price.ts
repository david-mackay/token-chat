// src/types/price.ts
export interface BirdEyePriceData {
    price: number
    volume24h: number
    change24h: number
    timestamp: string
    tokenAddress: string
    tokenSymbol?: string
    tokenName?: string
  }
  
  export interface PriceHistory {
    timestamp: string
    price: number
  }
  
  export interface TokenMetadata {
    address: string
    symbol: string
    name: string
    decimals: number
  }