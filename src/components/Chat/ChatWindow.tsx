// src/components/Chat/ChatWindow.tsx
import React, { useRef, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Message {
  id: string;
  content: string;
  walletAddress: string;
  timestamp: string;
  colorCode?: string;
  isLocal?: boolean;
}

interface ChatWindowProps {
  messages: Message[];
  currentUserAddress?: string;
  isLoading: boolean;
}

const formatMessageContent = (content: string) => {
  // Split content into lines
  const lines = content.split('\n');
  
  return lines.map((line, index) => {
    // Check for URLs in the line
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = line.split(urlRegex);
    
    return (
      <React.Fragment key={index}>
        {parts.map((part, partIndex) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={partIndex}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {part}
              </a>
            );
          }
          return part;
        })}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

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
          const isCurrentUser = !message.isLocal && currentUserAddress && message.walletAddress === currentUserAddress;
          const isSystemMessage = message.isLocal;

          return (
            <div
              key={message.id}
              className={`flex ${isSystemMessage ? 'justify-center' : isCurrentUser ? 'justify-end' : 'justify-start'} gap-2 items-end`}
            >
              {!isCurrentUser && !isSystemMessage && (
                <div className="flex flex-col items-center justify-center w-8 h-8 border border-green-500 text-green-500 text-xs">
                  {message.walletAddress.slice(0, 2)}
                </div>
              )}
              
              <div className={`${isSystemMessage ? 'w-full' : 'max-w-[75%]'} group`}>
                <div
                  className={`px-3 py-2 ${
                    isSystemMessage
                      ? 'border border-green-300 text-green-300 opacity-75 whitespace-pre-wrap'
                      : isCurrentUser 
                        ? 'border border-green-500 text-green-500 rounded-tr-none' 
                        : 'border border-green-400 text-green-400 rounded-tl-none'
                  }`}
                >
                  {!isSystemMessage && (
                    <span className="opacity-50">
                      {isCurrentUser ? 'OUT>> ' : 'IN<< '}
                    </span>
                  )}
                  {formatMessageContent(message.content)}
                </div>
                {!isSystemMessage && (
                  <div
                    className={`text-xs text-green-500/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isCurrentUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatDistanceToNow(parseISO(message.timestamp), { addSuffix: true })}
                  </div>
                )}
              </div>

              {isCurrentUser && !isSystemMessage && (
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