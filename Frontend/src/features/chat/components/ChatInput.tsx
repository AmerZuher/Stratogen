import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export default function ChatInput({ onSendMessage, disabled = false, initialValue = '' }: ChatInputProps) {
  const [message, setMessage] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Sync with initialValue
  useEffect(() => {
    setMessage(initialValue || '');
  }, [initialValue]);

  // Adjust height dynamically
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = 150;
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || disabled) return;
    onSendMessage(message.trim());
    setMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 py-3 bg-[var(--sidebar-bg)] border-t border-[var(--border)] rounded-lg">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none rounded-lg px-4 py-3 bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all overflow-hidden min-h-[50px] max-h-[150px]"
          data-testid="input-chat-message"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--accent-color)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          data-testid="button-send-message"
        >
          <Send size={24} />
        </button>
      </form>
    </div>
  );
}
