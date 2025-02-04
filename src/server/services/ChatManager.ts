// src/server/services/ChatManager.ts
import { Pool } from 'pg';
import WebSocket from 'ws';  // Update the import

interface ChatMessage {
    id: string;
    content: string;
    walletAddress: string;
    timestamp: string;
    tokenAddress: string;
}

interface ChatRoom {
    tokenAddress: string;
    subscribers: Set<WebSocket>;
    messageCount: number;
}

export class ChatManager {
    private chatRooms: Map<string, ChatRoom>;
    private readonly MESSAGE_LIMIT = 500;
    private readonly pool: Pool;

    constructor(databasePool: Pool) {
        this.chatRooms = new Map();
        this.pool = databasePool;
    }

    async joinRoom(tokenAddress: string, subscriber: WebSocket): Promise<void> {
        let room = this.chatRooms.get(tokenAddress);

        if (!room) {
            room = {
                tokenAddress,
                subscribers: new Set(),
                messageCount: await this.getMessageCount(tokenAddress)
            };
            this.chatRooms.set(tokenAddress, room);
        }

        room.subscribers.add(subscriber);

        // Send recent message history to new subscriber
        const recentMessages = await this.getRecentMessages(tokenAddress);
        if (recentMessages.length > 0) {
            subscriber.send(JSON.stringify({
                type: 'message_history',
                data: recentMessages
            }));
        }
    }

    leaveRoom(tokenAddress: string, subscriber: WebSocket): void {
        const room = this.chatRooms.get(tokenAddress);
        if (!room) return;

        room.subscribers.delete(subscriber);

        if (room.subscribers.size === 0) {
            this.chatRooms.delete(tokenAddress);
        }
    }

    async handleMessage(message: ChatMessage): Promise<void> {
        const room = this.chatRooms.get(message.tokenAddress);
        if (!room) return;

        try {
            await this.pool.query(
                'BEGIN'
            );

            // Insert new message
            await this.pool.query(
                `INSERT INTO messages (id, content, wallet_address, token_address, created_at)
                 VALUES ($1, $2, $3, $4, $5)`,
                [message.id, message.content, message.walletAddress, message.tokenAddress, message.timestamp]
            );

            // Update message count
            room.messageCount++;

            // Clean up old messages if limit exceeded
            if (room.messageCount > this.MESSAGE_LIMIT) {
                await this.pool.query(
                    `DELETE FROM messages
                     WHERE token_address = $1
                     AND id NOT IN (
                         SELECT id FROM messages
                         WHERE token_address = $1
                         ORDER BY created_at DESC
                         LIMIT $2
                     )`,
                    [message.tokenAddress, this.MESSAGE_LIMIT]
                );
                room.messageCount = this.MESSAGE_LIMIT;
            }

            await this.pool.query('COMMIT');

            // Broadcast to all subscribers in the room
            this.broadcastMessage(message);

        } catch (error) {
            await this.pool.query('ROLLBACK');
            console.error('Error handling message:', error);
            throw error;
        }
    }

    private async getMessageCount(tokenAddress: string): Promise<number> {
        const result = await this.pool.query(
            'SELECT COUNT(*) as count FROM messages WHERE token_address = $1',
            [tokenAddress]
        );
        return parseInt(result.rows[0].count);
    }

    private async getRecentMessages(tokenAddress: string): Promise<ChatMessage[]> {
        const result = await this.pool.query(
            `SELECT id, content, wallet_address, created_at
             FROM messages
             WHERE token_address = $1
             ORDER BY created_at DESC
             LIMIT $2`,
            [tokenAddress, this.MESSAGE_LIMIT]
        );

        return result.rows.map(row => ({
            id: row.id,
            content: row.content,
            walletAddress: row.wallet_address,
            timestamp: row.created_at.toISOString(),
            tokenAddress
        }));
    }

    private broadcastMessage(message: ChatMessage): void {
        const room = this.chatRooms.get(message.tokenAddress);
        if (!room) return;

        const messageString = JSON.stringify({
            type: 'chat_message',
            data: message
        });

        room.subscribers.forEach(subscriber => {
            if (subscriber.readyState === WebSocket.OPEN) {
                subscriber.send(messageString);
            }
        });
    }
}