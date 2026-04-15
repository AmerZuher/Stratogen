import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { type FeedbackResponse, type FeedbackCreate } from '@/api';

interface FeedbackProps {
  messageId: number;
  initialFeedback?: FeedbackResponse[];
  onFeedbackSubmit: (messageId: number, feedback: FeedbackCreate) => void;
}

const poorFeedbackReasons = ["Incorrect Information", "Unhelpful Response", "Harmful/Offensive", "Other"];

export default function Feedback({ messageId, initialFeedback, onFeedbackSubmit }: FeedbackProps) {
  const [feedbackStep, setFeedbackStep] = useState<'idle' | 'reasons' | 'comment'>('idle');
  const [comment, setComment] = useState('');

  const handleHelpfulClick = () => {
    const feedback: FeedbackCreate = { rating: 5, comment: 'Helpful' };
    onFeedbackSubmit(messageId, feedback);
  };

  const handlePoorClick = () => setFeedbackStep('reasons');

  const handleReasonSelect = (reason: string) => {
    if (reason === 'Other') {
      setFeedbackStep('comment');
    } else {
      const feedback: FeedbackCreate = { rating: 1, comment: reason };
      onFeedbackSubmit(messageId, feedback);
      setFeedbackStep('idle');
    }
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      const feedback: FeedbackCreate = { rating: 1, comment };
      onFeedbackSubmit(messageId, feedback);
      setFeedbackStep('idle');
      setComment('');
    }
  };

  if (initialFeedback && initialFeedback.length > 0) {
    return (
      <div className="text-xs text-[var(--text-primary)] flex items-center gap-1 mt-2">
        Feedback received:
        {initialFeedback[0].rating === 5 ? (
          <span className='flex items-center ml-1 text-green-600'><ThumbsUp className="w-4 h-4 mr-1" /> Helpful</span>
        ) : (
          <span className='flex items-center ml-1 text-red-600'><ThumbsDown className="w-4 h-4 mr-1" /> Poor</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2 mt-2 w-full">
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
    </div>
  );
}
