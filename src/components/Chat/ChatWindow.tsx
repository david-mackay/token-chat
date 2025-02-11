// src/components/Chat/ChatWindow.tsx
import React, { useRef, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Message {
  id: string;
  content: string;
  walletAddress: string;
  timestamp: string;
  colorCode?: string;
}

interface ChatWindowProps {
  messages: Message[];
  currentUserAddress?: string;
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  currentUserAddress = '',
  isLoading
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 
  return (
    <div className="h-full flex flex-col bg-black font-mono">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <p className="text-center text-green-500 animate-pulse">
            LOADING_MESSAGE_HISTORY...
          </p>
        )}
        {!isLoading && messages.map((message) => {
          const isCurrentUser = currentUserAddress && message.walletAddress === currentUserAddress;

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} gap-2 items-end`}
            >
              {!isCurrentUser && (
                <div className="flex flex-col items-center justify-center w-8 h-8 border border-green-500 text-green-500 text-xs">
                  {message.walletAddress.slice(0, 2)}
                </div>
              )}
              
              <div className={`max-w-[75%] group`}>
                <div
                  className={`px-3 py-2 ${
                    isCurrentUser 
                      ? 'border border-green-500 text-green-500 rounded-tr-none' 
                      : 'border border-green-400 text-green-400 rounded-tl-none'
                  }`}
                >
                  <span className="opacity-50">
                    {isCurrentUser ? 'OUT>> ' : 'IN<< '}
                  </span>
                  {message.content}
                </div>
                <div
                  className={`text-xs text-green-500/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isCurrentUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {formatDistanceToNow(parseISO(message.timestamp), { addSuffix: true })}
                </div>
              </div>

              {isCurrentUser && (
                <div className="flex flex-col items-center justify-center w-8 h-8 border border-green-500 text-green-500 text-xs">
                  {message.walletAddress.slice(0, 2)}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};