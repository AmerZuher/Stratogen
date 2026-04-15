import { type FeedbackResponse, type FeedbackCreate } from '@/api';

/**
 * Represents a clickable action button in a message.
 */
export interface Action {
  label: string;
  type: 'report_confirm' | 'postback';
  payload: string;
}

/**
 * Represents a single message in the chat.
 */
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  filePath?: string;
  actions?: Action[];
  messageId?: number;
  feedback?: FeedbackResponse[];
}

/**
 * Props for the main ChatMessage component.
 */
export interface ChatMessageProps {
  message: Message;
  onActionClick: (action: Action) => void;
  onFeedbackSubmit?: (messageId: number, feedback: FeedbackCreate) => void;
}
