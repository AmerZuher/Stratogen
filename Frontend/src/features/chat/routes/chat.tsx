import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import {
  AiServicesService,
  FeedbackCreate,
  FeedbackResponse,
  ReportGenerationRequest,
  MessageResponse
} from '@/api';
import {FilePlus} from 'lucide-react';

// --- Interfaces ---
interface Action {
  label: string;
  type: 'report_confirm' | 'postback';
  payload: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  messageId?: number;
  feedback?: FeedbackResponse[];
  filePath?: string;
  actions?: Action[];
}

export default function Chat() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- State Initialization ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);


  // --- useEffect Hooks ---
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && conversationId) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages, conversationId]);


  useEffect(() => {
    const initializeChat = async () => {
      const storedConvId = localStorage.getItem('conversationId');
      const wasTyping = localStorage.getItem('isTyping') === 'true';

      if (storedConvId) {
        const convId = Number(storedConvId);
        setConversationId(convId);

        // Fetch messages first to see the latest state.
        const apiMessages = await AiServicesService.getConversationMessagesApiAiServicesConversationIdMessagesGet({ conversationId: convId, limit: 500 });
        const formattedMessages = mapApiMessages(apiMessages);
        if (mountedRef.current) {
          setMessages(formattedMessages);
        }

        const hasSummary = formattedMessages.some(m => {
          try {
            const parsed = JSON.parse(m.content);
            return parsed.type === 'report_summary';
          } catch { return false; }
        });

        // If localStorage says we were typing AND the final summary message hasn't arrived yet,
        // it means a report was generating. We must show the typing indicator and restart polling.
        if (wasTyping && !hasSummary) {
          if (mountedRef.current) setIsTyping(true);
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

          pollingIntervalRef.current = setInterval(() => {
            fetchMessagesForConversation(convId);
          }, 5000);
        } else if (wasTyping) {
          // If we were typing but the summary IS here, just clean up.
          if (mountedRef.current) setIsTyping(false);
          localStorage.removeItem('isTyping');
        }

      } else {
        await handleNewChat();
      }
    };

    initializeChat();

    // Standard cleanup function.
    return () => {
      mountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      // If the page becomes visible again and we have a conversation, check for new messages.
      if (document.visibilityState === 'visible' && conversationId) {
        fetchMessagesForConversation(conversationId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [conversationId]); // Re-attach the listener if the conversationId changes.

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && conversationId) {
        // When tab becomes visible again, check for new messages
        fetchMessagesForConversation(conversationId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [conversationId]);


  useEffect(() => {
    const hasOnlyWelcomeMessage = messages.length === 1 && messages[0].id === 'welcome';
    if (hasOnlyWelcomeMessage && conversationId) {

      setRecommendations([]);
    }
  }, [messages, conversationId]);


  useEffect(() => {
    const { actionToPerform, investmentData } = location.state || {};

    if (actionToPerform && investmentData && conversationId) {
      const runAction = async () => {
        // --- MODIFICATION START: Add an elegant auto-generated message for report generation ---
        const botTaskMessage: Message = {
          id: `bot-task-${Date.now()}`,
          content: JSON.stringify({
            type: 'report_generation_start',
            investment_type: investmentData.type,
            investment_name: investmentData.name
          }),
          sender: 'bot',
          timestamp: new Date()
        };

        if (mountedRef.current) {
          setMessages(prev => [...prev, botTaskMessage]);
        }
        // --- MODIFICATION END ---

        setIsTyping(true);
        localStorage.setItem('isTyping', 'true');
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

        const requestBody: ReportGenerationRequest = {
          investment_id: investmentData.id,
          investment_name: investmentData.name,
          investment_type: investmentData.type,
          conversation_id: conversationId,
        };

        try {
          await AiServicesService.generateReportEndpointApiAiServicesReportsGeneratePost({ requestBody });

          // Start polling to check for the summary.
          pollingIntervalRef.current = setInterval(() => {
            fetchMessagesForConversation(conversationId);
          }, 5000);

        } catch (err: any) {
          console.error(`Error triggering ${actionToPerform}:`, err);
          if (mountedRef.current) {
            setIsTyping(false);
            localStorage.removeItem('isTyping');
          }
        } finally {
          navigate(location.pathname, { replace: true, state: {} });
        }
      };
      runAction();
    }
  }, [location.state, conversationId, navigate]);

  const mapApiMessages = (apiMessages: MessageResponse[]): Message[] => {
    return apiMessages.map(msg => ({
      id: `msg-${msg.id}`,
      content: msg.content,
      sender: msg.role === 'user' ? 'user' : 'bot',
      timestamp: new Date(msg.created_at),
      messageId: msg.id,
      feedback: msg.feedback || [],
    }));
  };

  const fetchMessagesForConversation = async (convId: number) => {
    try {
      const apiMessages = await AiServicesService.getConversationMessagesApiAiServicesConversationIdMessagesGet({ conversationId: convId, limit: 500 });
      const formattedMessages = mapApiMessages(apiMessages);

      if (mountedRef.current) {
        setMessages(formattedMessages);
      }

      const hasSummary = formattedMessages.some(m => {
        try {
          const parsed = JSON.parse(m.content);
          return parsed.type === 'report_summary';
        } catch {
          return false;
        }
      });

      // Case 1: A report summary has arrived. Stop everything.
      if (hasSummary) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        if (mountedRef.current) {
          setIsTyping(false);
          localStorage.removeItem('isTyping');
        }
        // Case 2: We are NOT polling (i.e., normal chat). Stop typing if the bot has replied.
      } else if (!pollingIntervalRef.current) {
        const lastMessage = formattedMessages.length > 0 ? formattedMessages[formattedMessages.length - 1] : null;
        if (lastMessage?.sender === 'bot') {
          if (mountedRef.current) {
            setIsTyping(false);
            localStorage.removeItem('isTyping');
          }
        }
      }
      // Implicit Else: If no summary and we are polling, do nothing and let the typing indicator continue.

    } catch (error) {
      console.error("Failed to fetch messages:", error);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (mountedRef.current) {
        setIsTyping(false);
        localStorage.removeItem('isTyping');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function getBotResponse(content: string, convId: number) {
    setIsTyping(true);
    localStorage.setItem('isTyping', 'true');

    try {
      const data = await AiServicesService.chatApiAiServicesConversationIdChatPost({
        conversationId: convId,
        requestBody: { message: content }
      });

      if (data.assistant_message && data.assistant_message.content && data.assistant_message.content.trim() !== '') {
        const botResponse: Message = {
          id: `bot-${Date.now()}`,
          content: data.assistant_message.content,
          sender: 'bot',
          timestamp: new Date(),
          messageId: data.assistant_message.id,
          feedback: data.assistant_message.feedback,
        };
        if (mountedRef.current) {
          setMessages(prev => [...prev, botResponse]);
        }
      } else {
        const infoMessage: Message = {
          id: `bot-info-${Date.now()}`,
          content: "I received a response, but it didn't contain any information. Please try a different query.",
          sender: 'bot',
          timestamp: new Date(),
        };
        if (mountedRef.current) {
          setMessages(prev => [...prev, infoMessage]);
        }
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: `error-send-${Date.now()}`,
        content: `Sorry, something went wrong: ${error.message}`,
        sender: 'bot',
        timestamp: new Date(),
      };
      if (mountedRef.current) {
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      localStorage.removeItem('isTyping');
      if (mountedRef.current) {
        setIsTyping(false);
      }
    }
  }

  const handleNewChat = async () => {
    setIsTyping(true);
    setRecommendations([]);
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    try {
      const newConversation = await AiServicesService.createConversationApiAiServicesPost({
        requestBody: { title: `New Chat on ${new Date().toLocaleString()}` },
      });
      const newId = newConversation.id;

      setConversationId(newId);
      localStorage.setItem('conversationId', newId.toString());

      // --- MODIFICATION START: Updated welcome message for a livelier feel ---
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "Welcome to PMPilot, your AI co-pilot for project management! 🚀 I can help you analyze investments, generate detailed reports, and more. What are we working on today?",
        sender: 'bot',
        timestamp: new Date(),
      };
      // --- MODIFICATION END ---
      setMessages([welcomeMessage]);

    } catch (error) {
      console.error("Failed to start a new chat:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !conversationId) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    localStorage.setItem('isTyping', 'true'); // Persist typing state for reloads

    try {
      // The API call now directly returns the data we need.
      const data = await AiServicesService.chatApiAiServicesConversationIdChatPost({
        conversationId: conversationId,
        requestBody: { message: content }
      });

      // We process the response here instead of calling fetchMessagesForConversation
      if (data.assistant_message && data.assistant_message.content && data.assistant_message.content.trim() !== '') {
        const botResponse: Message = {
          id: `bot-${Date.now()}`,
          content: data.assistant_message.content,
          sender: 'bot',
          timestamp: new Date(),
          messageId: data.assistant_message.id,
          feedback: data.assistant_message.feedback,
        };
        if (mountedRef.current) {
          // Add the new bot response to the existing messages
          setMessages(prev => [...prev, botResponse]);
        }
      } else {
        // Handle cases where the API returns a success but no message content
        const infoMessage: Message = {
          id: `bot-info-${Date.now()}`,
          content: "I received a response, but it didn't contain any information. Please try a different query.",
          sender: 'bot',
          timestamp: new Date(),
        };
        if (mountedRef.current) {
          setMessages(prev => [...prev, infoMessage]);
        }
      }
    } catch (error: any) {
      // If the API call fails, show an error message in the chat
      const errorMessage: Message = {
        id: `error-send-${Date.now()}`,
        content: `Sorry, something went wrong: ${error.message}`,
        sender: 'bot',
        timestamp: new Date(),
      };
      if (mountedRef.current) {
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      // This 'finally' block now runs at the correct time: after the response is received and processed.
      if (mountedRef.current) {
        setIsTyping(false);
        localStorage.removeItem('isTyping');
      }
    }
  };

  const handleFeedbackSubmit = async (messageId: number, feedback: FeedbackCreate) => {
    try {
      await AiServicesService.createMessageFeedbackApiAiServicesMessagesMessageIdFeedbackPost({
        messageId,
        requestBody: feedback,
      });
      // OPTIONAL UPDATE: Use the new fetch function for consistency
      if (conversationId) await fetchMessagesForConversation(conversationId);
    } catch (error) {
      console.error('Failed to submit feedback. Full error:', error);
    }
  };

  const handleActionClick = (action: Action) => {
    if (action.type === 'postback') {
      sendMessage(action.payload);
    } else {
      console.log("Action clicked:", action);
    }
  };

  return (
    <div className="flex flex-col h-full"
      style={{
        overflow: 'hidden',
        minHeight: 'calc(100vh - 120px)',
        maxHeight: 'calc(100vh - 120px)'
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-2 flex justify-between items-center "
        style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
        <h2 className="text-xl font-bold text-[var(--text-primary)]"></h2>
        <button
          onClick={handleNewChat}
          style={{ backgroundColor: 'var(--accent-color)', color: 'var(--secondary-foreground)' }}
          className="px-8 py-3 rounded-lg hover:opacity-90 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          New Chat <FilePlus className="w-5 h-5" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-6 space-y-4 min-h-0"
        style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onFeedbackSubmit={handleFeedbackSubmit}
              onActionClick={handleActionClick}
            />
          ))}

          {recommendations.length > 0 && messages.length === 1 && (
            "pass"
          )}

          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-lg border"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0">
        <ChatInput onSendMessage={sendMessage} disabled={isTyping} initialValue={""} />
      </div>
    </div>
  );
}
