import { RoomStats } from "./types/componentdata";


export const DEFAULT_ROOMS: RoomStats[] = [
    {
      tokenAddress: "So11111111111111111111111111111111111111112",
      userCount: 3,
      tokenName: "Wrapped SOL",
      tokenSymbol: "SOL",
      lastPrice: 0
    },
    {
        tokenAddress: "CniPCE4b3s8gSUPhUiyMjXnytrEqUrMfSsnbBjLCpump",
        userCount: 11,
        tokenName: "pwease",
        tokenSymbol: "pwease",
        lastPrice: 0,
        isExtraActive: true,
      },
    // Add more default rooms here if needed
  ];