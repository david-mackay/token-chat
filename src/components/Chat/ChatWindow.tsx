// src/components/Chat/ChatWindow.tsx
import React, { useRef, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Message } from '@/types/websocket';

interface ChatWindowProps {
  messages: Message[];
  currentUserAddress?: string;
  isLoading: boolean;
}

const formatMessageContent = (content: string) => {
  // First handle click-to-copy elements
  const processClickToCopy = (text: string) => {
    const copyRegex = /<click-to-copy value="(.*?)">(.*?)<\/click-to-copy>/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = copyRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add the copyable element
      const [valueToCopy, displayText] = match;
      parts.push(
        <button
          key={`copy-${match.index}`}
          onClick={() => {
            navigator.clipboard.writeText(valueToCopy);
          }}
          className="text-green-400 hover:underline cursor-pointer break-all inline-block"
        >
          {displayText}
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  // Split content into lines
  const lines = content.split('\n');
  
  return lines.map((line, index) => {
    // Process click-to-copy elements first
    const processedLine = processClickToCopy(line);

    // Then handle URLs in any remaining text
    const processedParts = processedLine.map((part, partIndex) => {
      if (typeof part !== 'string') return part;

      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urlParts = part.split(urlRegex);
      
      return urlParts.map((urlPart, urlPartIndex) => {
        if (urlPart.match(urlRegex)) {
          return (
            <a
              key={`${partIndex}-${urlPartIndex}`}
              href={urlPart}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:underline break-all inline-block"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {urlPart}
            </a>
          );
        }
        return urlPart;
      });
    });

    return (
      <React.Fragment key={index}>
        {processedParts}
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
                <div 
                  className="flex flex-col items-center justify-center w-8 h-8 border text-xs"
                  style={{
                    borderColor: message.colorCode || '#22c55e',
                    color: message.colorCode || '#22c55e'
                  }}
                >
                  {message.walletAddress.slice(0, 2)}
                </div>
              )}
              
              <div className={`${isSystemMessage ? 'w-full' : 'max-w-[75%]'} group`}>
                <div
                  className={`px-3 py-2 break-words ${
                    isSystemMessage
                      ? 'border border-green-300 text-green-300 opacity-75 whitespace-pre-wrap'
                      : isCurrentUser 
                        ? `border text-green-500 rounded-tr-none` 
                        : `border text-green-400 rounded-tl-none`
                  }`}
                  style={!isSystemMessage ? {
                    borderColor: message.colorCode || (isCurrentUser ? '#22c55e' : '#4ade80'),
                    color: message.colorCode || (isCurrentUser ? '#22c55e' : '#4ade80')
                  } : undefined}
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
                <div 
                  className="flex flex-col items-center justify-center w-8 h-8 border text-xs"
                  style={{
                    borderColor: message.colorCode || '#22c55e',
                    color: message.colorCode || '#22c55e'
                  }}
                >
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