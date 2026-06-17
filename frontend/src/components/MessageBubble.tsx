import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Copy, Check, Sparkles, User, Terminal } from 'lucide-react';
import { Message } from '../types';
import { formatTimestamp } from '../utils/formatMessage';

interface MessageBubbleProps {
  message: Message;
}

/**
 * Custom CodeBlock component with language badge and Copy button
 */
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code block:', err);
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-brand-border bg-black/40 shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border bg-brand-card/90 select-none">
        <div className="flex items-center space-x-2 text-brand-secondary">
          <Terminal className="h-4 w-4" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-muted">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 text-xs text-brand-muted hover:text-brand-text transition-colors bg-brand-border/20 hover:bg-brand-border/50 px-2 py-1 rounded-md"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-brand-success" />
              <span className="text-brand-success font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Preformatted Code Content */}
      <pre className="p-4 overflow-x-auto font-mono text-sm text-[#00D4FF] bg-black/20">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copiedBubble, setCopiedBubble] = useState(false);
  const isUser = message.role === 'user';

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedBubble(true);
      setTimeout(() => setCopiedBubble(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`group flex items-start space-x-3 max-w-[85%] md:max-w-[80%] ${
        isUser ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
      } py-2`}
    >
      {/* Avatar Icons */}
      <div
        className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center border transition-all duration-300 ${
          isUser
            ? 'bg-gradient-accent border-brand-primary/20 text-white shadow-glow'
            : 'bg-brand-card border-brand-border text-brand-primary'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      {/* Bubble Content Area */}
      <div className="relative flex flex-col">
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 ${
            isUser
              ? 'bg-gradient-accent text-white rounded-tr-sm'
              : 'bg-brand-card/90 border border-brand-border/60 text-brand-text rounded-tl-sm'
          }`}
        >
          {/* Custom Copy Icon Button (overlay on hover) */}
          <button
            onClick={handleCopyMessage}
            className={`absolute -top-1.5 ${
              isUser ? '-left-2' : '-right-2'
            } p-1.5 rounded-lg border border-brand-border/80 bg-brand-card text-brand-muted hover:text-brand-text opacity-0 group-hover:opacity-100 shadow-md transition-all duration-200 z-10`}
            title="Copy entire message"
          >
            {copiedBubble ? (
              <Check className="h-3 w-3 text-brand-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>

          {/* Text Parsing */}
          {isUser ? (
            <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed break-words">
              {message.content}
            </p>
          ) : (
            <div className="markdown-content text-sm md:text-base break-words">
              <ReactMarkdown
                components={{
                  // Capture code blocks and render using our premium CodeBlock component
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    const isInline = !match;

                    if (!isInline) {
                      return <CodeBlock language={match ? match[1] : 'code'} code={codeString} />;
                    }

                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span
          className={`text-[10px] text-brand-muted font-medium mt-1 px-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};
export default MessageBubble;
