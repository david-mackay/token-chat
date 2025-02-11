// src/hooks/useSocketAuth.ts
import { useState, useCallback } from 'react';
import { useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-solana/react';
import { Socket } from 'socket.io-client';

interface UseSocketAuthProps {
  socket: Socket | null;
  tokenAddress: string;
  walletAddress: string | undefined;
}

interface UseSocketAuthReturn {
  authenticate: () => Promise<void>;
  sessionToken: string | null;
  authError: string | null;
}

export const useSocketAuth = ({ 
  socket, 
  tokenAddress, 
  walletAddress 
}: UseSocketAuthProps): UseSocketAuthReturn => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const { walletProvider } = useAppKitProvider<Provider>('solana');

  const authenticate = useCallback(async () => {
    if (!socket || !walletAddress || !walletProvider) {
      setAuthError('Wallet not connected');
      return;
    }

    try {
      // Create authentication message
      const timestamp = Date.now();
      const message = `Authenticate chat access for token ${tokenAddress} at ${timestamp}`;
      const encodedMessage = new TextEncoder().encode(message);

      // Get signature from wallet
      const signature = await walletProvider.signMessage(encodedMessage);
      const signatureHex = Buffer.from(signature).toString('hex');

      // Set up auth success handler
      socket.once('auth_success', (response: { session_token: string }) => {
        setSessionToken(response.session_token);
        setAuthError(null);
      });

      // Set up auth error handler
      socket.once('auth_error', (error: string) => {
        setAuthError(error);
        setSessionToken(null);
      });

      // Emit authentication request
      socket.emit('authenticate', {
        token_address: tokenAddress,
        wallet_address: walletAddress,
        auth_message: message,
        signature: signatureHex
      });

    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
      setSessionToken(null);
    }
  }, [socket, tokenAddress, walletAddress, walletProvider]);

  return {
    authenticate,
    sessionToken,
    authError
  };
};