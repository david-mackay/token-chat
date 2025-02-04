// src/components/Chat/MessageInput.tsx
import React from 'react';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    disabled: boolean;
  }
  
  export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
    const [message, setMessage] = React.useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim() && !disabled) {
        onSendMessage(message.trim());
        setMessage('');
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    );
  };