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
    <form onSubmit={handleSubmit} className="p-4 bg-black border-t border-green-500">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? "CONNECTION_REQUIRED" : "ENTER_COMMAND >_"}
          className="flex-1 p-2 bg-black border border-green-500 text-green-500 font-mono 
                   placeholder:text-green-500/50 focus:outline-none focus:ring-1 
                   focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="px-6 py-2 bg-black border border-green-500 text-green-500 font-mono
                   hover:bg-green-500 hover:text-black transition-colors 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          SEND
        </button>
      </div>
    </form>
  );
};