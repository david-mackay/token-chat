// src/server/index.ts
import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { PriceTracker } from './services/PriceTracker.js';
import { ChatManager } from './services/ChatManager.js';
import { parse as parseUrl } from 'url';




dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'token_chat',
    user: process.env.DB_USER || 'token_chat_user',
    password: process.env.DB_PASSWORD,
});

const priceTracker = new PriceTracker();
const chatManager = new ChatManager(pool);

const httpServer = createServer();
const wss = new WebSocketServer({ noServer: true });

httpServer.on('upgrade', (request, socket, head) => {
    const url = parseUrl(request.url || '', true);
    const pathSegments = url.pathname?.split('/').filter(Boolean) || [];
    
    if (pathSegments.length !== 2 || pathSegments[0] !== 'tc') {
        socket.destroy();
        return;
    }

    const tokenAddress = pathSegments[1];

    wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        ws.on('message', async (data: WebSocket.Data) => {
            try {
                const message = JSON.parse(data.toString());
                if (message.type === 'chat_message') {
                    await chatManager.handleMessage(message.data);
                }
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        ws.on('close', () => {
            chatManager.leaveRoom(tokenAddress, ws);
            priceTracker.stopTracking(tokenAddress, ws);
        });

        // Initialize connection
        Promise.all([
            chatManager.joinRoom(tokenAddress, ws),
            priceTracker.startTracking(tokenAddress, ws)
        ]).catch(error => {
            console.error('Error initializing connection:', error);
            ws.close();
        });
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Cleanup on shutdown
process.on('SIGTERM', () => {
    wss.close();
    httpServer.close();
    pool.end();
});