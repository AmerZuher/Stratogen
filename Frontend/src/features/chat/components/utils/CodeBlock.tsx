import React, { useState, Suspense } from 'react';
import { Copy, Check } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';



interface CodeBlockProps {
  language?: string;
  children: string;
}

const customCodeStyle = {
  'pre[class*="language-"]': {
    backgroundColor: 'var(--muted)',
    color: 'var(--foreground)',
    padding: '1em',
    margin: '0.5em 0',
    overflow: 'auto',
    borderRadius: '0.5rem',
  },
  'code[class*="language-"]': {
    color: 'var(--foreground)',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
  },
  'keyword': { color: 'var(--accent-color)' },
  'string': { color: 'hsl(142, 76%, 30%)' },
  'comment': { color: 'var(--text-primary)', fontStyle: 'italic' },
  'function': { color: 'var(--primary)' },
  'number': { color: 'var(--primary)' },
  'boolean': { color: 'var(--accent)' },
};

export default function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy code:', err);
    });
  };

  return (
    <div className="relative group my-4">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-[var(--primary)] hover:bg-[var(--primary)]-700 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1"
        data-testid="button-copy-code"
      >
        {copied ? (
          <>
            <Check size={14} />
            <span className="text-xs">Copied!</span>
          </>
        ) : (
          <>
            <Copy size={14} />
            <span className="text-xs">Copy</span>
          </>
        )}
      </button>
      <Suspense fallback={<pre className="p-4 rounded-md bg-[var(--muted)]"><code>Loading code...</code></pre>}>
        <SyntaxHighlighter
          language={language || 'text'}
          style={customCodeStyle}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
          }}
          codeTagProps={{
            style: {
              fontSize: '0.875rem',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            },
          }}
        >
          {children}
        </SyntaxHighlighter>
      </Suspense>
    </div>
  );
}

