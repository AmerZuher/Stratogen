import { useState, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  darcula,
  prism as lightTheme,
  okaidia, // A popular dark theme
  coy,     // A stylish light theme
  vscDarkPlus 
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check, Download, ThumbsUp, ThumbsDown } from 'lucide-react';
import { type FeedbackResponse, type FeedbackCreate, OpenAPI } from '@/api';

import { useTheme, type Theme } from '@/providers/ThemeContext';
import { useAuth } from '@/providers/AuthContext';
import '@/styles/index.css'


interface Action { label: string; type: 'report_confirm' | 'postback'; payload: string; }
interface Message { id: string; content: string; sender: 'user' | 'bot'; timestamp: Date; filePath?: string; actions?: Action[]; messageId?: number; feedback?: FeedbackResponse[]; }
interface ChatMessageProps { message: Message; onActionClick: (action: Action) => void; onFeedbackSubmit?: (messageId: number, feedback: FeedbackCreate) => void; }
const poorFeedbackReasons = ["Incorrect Information", "Unhelpful Response", "Harmful/Offensive", "Other"];

// --- Dedicated Component for Code Blocks ---
function ThemeAwareCodeBlock({ language, children, theme }: { language: string, children: ReactNode, theme: Theme }) {
  const [copied, setCopied] = useState(false);

  const getSyntaxTheme = () => {
    switch (theme) {
      case 'dark': return vscDarkPlus;
      case 'ocean': return coy;
      case 'green': return coy;
      case 'lavender': return lightTheme;
      default: return coy;
    }
  };

  const syntaxTheme = getSyntaxTheme();

  const handleCopy = () => {
    const textToCopy = String(children);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden">
      <button
        onClick={handleCopy}
        className="absolute top-4 right-2 p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <SyntaxHighlighter
        style={syntaxTheme}
        language={language}
        PreTag="div"
        className="rounded-lg"
        customStyle={{
          background: 'var(--sidebar-bg)',
          borderRadius: '0.5rem',      
        }}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>

  );
}

export default function ChatMessage({ message, onActionClick, onFeedbackSubmit }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const { token } = useAuth();
  const { theme } = useTheme();
  const [feedbackStep, setFeedbackStep] = useState<'idle' | 'reasons' | 'comment'>('idle');
  const [comment, setComment] = useState('');

  const preprocessMarkdown = (content: string): string => {
    const tableInCodeBlockRegex = /^```(?:\w*\n)?((?:\s*\|.*\|.*\n)+)```$/gm;

    return content.replace(tableInCodeBlockRegex, (tableContent) => {
      return tableContent.trim();
    });
  };
  const handleHelpfulClick = () => {
    if (message.messageId && onFeedbackSubmit) {
      const feedback: FeedbackCreate = {
        rating: 5,
        comment: 'Helpful',
      };
      onFeedbackSubmit(message.messageId, feedback);
    }
  };

  const handlePoorClick = () => {
    setFeedbackStep('reasons');
  };

  const handleReasonSelect = (reason: string) => {
    if (reason === 'Other') {
      setFeedbackStep('comment');
    } else {
      if (message.messageId && onFeedbackSubmit) {
        const feedback: FeedbackCreate = {
          rating: 1,
          comment: reason,
        };
        onFeedbackSubmit(message.messageId, feedback);
        setFeedbackStep('idle');
      }
    }
  };

  const handleCommentSubmit = () => {
    if (message.messageId && onFeedbackSubmit) {
      const feedback: FeedbackCreate = {
        rating: 1,
        comment: comment,
      };
      onFeedbackSubmit(message.messageId, feedback);
      setFeedbackStep('idle');
      setComment('');
    }
  };

  const renderBotMessage = () => {

    const markdownComponents = {
      // (FIX) The code renderer now uses the dedicated component
      code({ node, inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
          <ThemeAwareCodeBlock language={match[1]} theme={theme}>
            {children}
          </ThemeAwareCodeBlock>
        ) : (
          <code className="px-1.5 py-0.5 rounded text-sm" {...props}>
            {children}
          </code>
        );
      },
    };

    try {
      const parsedContent = JSON.parse(message.content);
      if (parsedContent && parsedContent.type === 'report_summary') {
        const handleDownload = async () => {
          if (!token) {
            console.error("Authentication token not found.");
            return;
          }
          if (!parsedContent.report_link) {
            console.error("Report link is missing from the message.");
            return;
          }
          try {
            const downloadUrl = `${OpenAPI.BASE}/api${parsedContent.report_link}`;
            const response = await fetch(downloadUrl, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.detail || `Download failed: ${response.statusText}`);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = parsedContent.report_link.split('/').pop() || 'ai-generated-report.pdf';
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
          } catch (err: any) {
            console.error("Download error:", err);
          }
        };

        return (
          <div className="flex flex-col gap-2 prose prose-sm max-w-none" style={{ color: 'var(--text-primary)' }}>
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {parsedContent.summary}
            </ReactMarkdown>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-color)] text-white font-semibold rounded-lg text-sm hover:opacity-90 transition-colors self-start mt-2 no-underline"
            >
              <Download size={16} />
              Download Full Report
            </button>
          </div>
        );
      }
    } catch (error) {
    }

    const processedContent = preprocessMarkdown(message.content);

    return (
      <article className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={markdownComponents}
        >
          {processedContent}
        </ReactMarkdown>
      </article>
    );
  };

  return (
    <div
      className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      data-testid={`message-${message.id}`}
    >
      <div
        className={`max-w-[85%] md:max-w-[90%] px-4 py-3 rounded-lg flex flex-col`}
        style={{
          backgroundColor: isUser ? 'var(--accent-color)' : 'var(--card)',
          borderColor: isUser ? 'transparent' : 'var(--border)',
          color: isUser ? 'var(--secondary-foreground)' : 'var(--text-primary)',
          borderWidth: isUser ? '1px' : '1px',
        }}
      >
        {/* Main Content Area */}
        <div className="w-full">
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : (
            renderBotMessage()
          )}
        </div>

        {/* --- (Download, Actions, Feedback, and Timestamp sections remain unchanged) --- */}
        <div className="mt-3 pt-3 border-t border-[var(--card-foreground)] w-full">
          {message.filePath && !message.content.includes("report_summary") && (
            <div>
              <a
                href={`/api/download/${message.filePath}`}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-[var(--primary-foreground)] font-semibold rounded-lg text-sm hover:opacity-90 transition-colors"
              >
                <Download size={16} />
                Download Report
              </a>
            </div>
          )}

          {message.actions && message.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => onActionClick(action)}
                  className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--muted)] transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {!isUser && message.messageId && (
          <div className="flex flex-col items-start gap-2 mt-2 w-full">
            {message.feedback && message.feedback.length > 0 ? (
              <div className="text-xs text-[var(--text-primary)] flex items-center gap-1">
                Feedback received:
                {message.feedback[0].rating === 5 ? (
                  <span className='flex items-center ml-1 text-green-600'><ThumbsUp className="w-4 h-4 mr-1" /> Helpful</span>
                ) : (
                  <span className='flex items-center ml-1 text-red-600'><ThumbsDown className="w-4 h-4 mr-1" /> Poor</span>
                )}
              </div>
            ) : (
              <>
                {feedbackStep === 'idle' && (
                  <div className="flex gap-1">
                    <button onClick={handleHelpfulClick} className="p-1 rounded text-[var(--text-primary)] hover:text-green-600 hover:bg-[var(--muted)] transition-colors" title="Helpful response"><ThumbsUp size={14} /></button>
                    <button onClick={handlePoorClick} className="p-1 rounded text-[var(--text-primary)] hover:text-red-600 hover:bg-[var(--muted)] transition-colors" title="Poor response"><ThumbsDown size={14} /></button>
                  </div>
                )}
                {feedbackStep === 'reasons' && (
                  <div className="flex flex-col items-start gap-2 w-full">
                    <p className="text-xs text-[var(--text-primary)] mb-1">Why was this response poor?</p>
                    <div className="flex flex-wrap gap-2">
                      {poorFeedbackReasons.map(reason => <button key={reason} onClick={() => handleReasonSelect(reason)} className="px-2 py-1 text-xs bg-[var(--muted)] text-[var(--text-primary)] border border-[var(--border)] rounded-md hover:bg-[var(--accent-color)] hover:text-white transition-colors">{reason}</button>)}
                    </div>
                  </div>
                )}
                {feedbackStep === 'comment' && (
                  <div className="flex flex-col gap-2 w-full">
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Provide additional feedback..." className="w-full p-2 text-sm rounded-md border bg-[var(--background)] text-[var(--text-primary)] border-[var(--border)] focus:ring-2 focus:ring-[var(--accent-color)] transition" rows={2} />
                    <button onClick={handleCommentSubmit} disabled={!comment.trim()} className="px-3 py-1.5 text-xs bg-[var(--accent-color)] text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed self-start">Submit Feedback</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="text-xs mt-2 self-end" style={{ color: isUser ? 'var(----text-primary)' : 'var(--text-primary)' }}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

