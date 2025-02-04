// src/components/Chat/ChatWindow.tsx
import React, { useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

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
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 rounded-lg shadow-inner">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isCurrentUser = currentUserAddress && message.walletAddress === currentUserAddress;
          const messageColor = message.colorCode || '#E5E7EB';

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} gap-2 items-end`}
            >
              {!isCurrentUser && (
                <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-xs">
                  {message.walletAddress.slice(0, 2)}
                </div>
              )}
              
              <div className={`max-w-[70%] group`}>
                <div
                  style={{ backgroundColor: isCurrentUser ? '#3B82F6' : messageColor }}
                  className={`px-4 py-2 rounded-2xl ${
                    isCurrentUser 
                      ? 'text-white rounded-br-none' 
                      : 'text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.content}
                </div>
                <div
                  className={`text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isCurrentUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                </div>
              </div>

              {isCurrentUser && (
                <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-xs">
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