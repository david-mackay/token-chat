
// src/server/services/PriceTracker.ts and ChatManager.ts
import WebSocket from 'ws';  // Update the import

// src/server/services/PriceTracker.ts

interface PriceData {
    success: boolean;
    data: {
        value: number;
        updateUnixTime: number;
        symbol?: string;
        name?: string;
    };
}

interface TokenSubscription {
    updateInterval: NodeJS.Timeout;
    lastPrice: number;
    subscribers: Set<WebSocket>;  // Use WebSocket from 'ws'
    tokenName?: string;
    tokenSymbol?: string;
}
export class PriceTracker {
    private tokenSubscriptions: Map<string, TokenSubscription>;
    private readonly API_KEY = process.env.BIRDEYE_API_KEY || 'c90e703270514a9ea0981fe31567a58c';
    private readonly UPDATE_INTERVAL = 30000; // 30 seconds
    private readonly API_URL = 'https://public-api.birdeye.so/defi';

    constructor() {
        this.tokenSubscriptions = new Map();
    }

    async startTracking(tokenAddress: string, subscriber: WebSocket): Promise<void> {
        let subscription = this.tokenSubscriptions.get(tokenAddress);

        if (subscription) {
            subscription.subscribers.add(subscriber);
            // Send latest price immediately to new subscriber
            if (subscription.lastPrice) {
                this.sendPriceUpdate(subscriber, tokenAddress, subscription);
            }
            return;
        }

        subscription = {
            updateInterval: setInterval(
                () => this.updatePrice(tokenAddress),
                this.UPDATE_INTERVAL
            ),
            lastPrice: 0,
            subscribers: new Set([subscriber]),
            tokenName: undefined,
            tokenSymbol: undefined
        };

        this.tokenSubscriptions.set(tokenAddress, subscription);
        
        // Fetch initial price
        await this.updatePrice(tokenAddress);
    }

    stopTracking(tokenAddress: string, subscriber: WebSocket): void {
        const subscription = this.tokenSubscriptions.get(tokenAddress);
        if (!subscription) return;

        subscription.subscribers.delete(subscriber);

        if (subscription.subscribers.size === 0) {
            clearInterval(subscription.updateInterval);
            this.tokenSubscriptions.delete(tokenAddress);
        }
    }

    private async updatePrice(tokenAddress: string): Promise<void> {
        try {
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'x-chain': 'solana',
                    'X-API-KEY': this.API_KEY
                }
            };

            const response = await fetch(
                `${this.API_URL}/price?address=${tokenAddress}`,
                options
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const priceData: PriceData = await response.json();

            if (!priceData.success) {
                throw new Error('Failed to fetch price data');
            }

            const subscription = this.tokenSubscriptions.get(tokenAddress);
            if (!subscription) return;

            subscription.lastPrice = priceData.data.value;
            if (priceData.data.symbol) subscription.tokenSymbol = priceData.data.symbol;
            if (priceData.data.name) subscription.tokenName = priceData.data.name;

            // Broadcast to all subscribers
            this.broadcastPrice(tokenAddress, subscription);

        } catch (error) {
            console.error(`Price update failed for ${tokenAddress}:`, error);
            // Don't remove the subscription on error, let it try again
        }
    }

    private broadcastPrice(tokenAddress: string, subscription: TokenSubscription): void {
        const priceMessage = JSON.stringify({
            type: 'price_update',
            data: {
                tokenAddress,
                price: subscription.lastPrice,
                tokenName: subscription.tokenName,
                tokenSymbol: subscription.tokenSymbol,
                timestamp: new Date().toISOString()
            }
        });

        subscription.subscribers.forEach(subscriber => {
            if (subscriber.readyState === WebSocket.OPEN) {
                subscriber.send(priceMessage);
            }
        });
    }

    private sendPriceUpdate(subscriber: WebSocket, tokenAddress: string, subscription: TokenSubscription): void {
        if (subscriber.readyState !== WebSocket.OPEN) return;

        const priceMessage = JSON.stringify({
            type: 'price_update',
            data: {
                tokenAddress,
                price: subscription.lastPrice,
                tokenName: subscription.tokenName,
                tokenSymbol: subscription.tokenSymbol,
                timestamp: new Date().toISOString()
            }
        });

        subscriber.send(priceMessage);
    }
}