import { type Action } from './SharedTypes';

interface MessageActionsProps {
  actions: Action[];
  onActionClick: (action: Action) => void;
}

export default function MessageActions({ actions, onActionClick }: MessageActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => onActionClick(action)}
          className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--muted)] transition-colors"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
