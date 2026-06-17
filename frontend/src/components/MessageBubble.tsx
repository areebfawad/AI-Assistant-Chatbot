import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Copy, Check, Sparkles, User, Terminal, Volume2, VolumeX, ThumbsUp, ThumbsDown, Edit2, Trash2, RotateCw, Pin, PinOff, Play } from 'lucide-react';
import { Message } from '../types';
import { formatTimestamp } from '../utils/formatMessage';

interface MessageBubbleProps {
  message: Message;
  // Feature 1 additions
  speakingMessageId: string | null;
  speakingCharIndex: number;
  onSpeak: (messageId: string, text: string) => void;
  // Feature 2 additions
  onImageClick?: (url: string) => void;
  // Feature 3 additions
  conversationId: string;
  onPinToggle: (conversationId: string, messageId: string) => void;
  onRate: (conversationId: string, messageId: string, rating: -1 | 0 | 1) => void;
  onDelete: (conversationId: string, messageId: string) => void;
  onEdit: (conversationId: string, messageId: string, newContent: string) => void;
  onRegenerate: (conversationId: string, messageId: string) => void;
}

/**
 * Custom CodeBlock component with language badge and Copy button
 */
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<{type: 'log' | 'error', text: string}[]>([]);

  const isExecutable = ['javascript', 'js'].includes(language.toLowerCase());

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code block:', err);
    }
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput([]);
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.sandbox.add('allow-scripts'); // Strict sandbox, no allow-same-origin
    document.body.appendChild(iframe);

    let timeoutId: ReturnType<typeof setTimeout>;

    const messageHandler = (e: MessageEvent) => {
      if (e.source !== iframe.contentWindow) return;
      if (e.data?.type === 'console') {
        setOutput(prev => [...prev, { type: e.data.level, text: e.data.content }]);
      } else if (e.data?.type === 'error') {
        setOutput(prev => [...prev, { type: 'error', text: e.data.content }]);
      } else if (e.data?.type === 'done') {
        cleanup();
      }
    };
    window.addEventListener('message', messageHandler);

    const cleanup = () => {
      setIsRunning(false);
      clearTimeout(timeoutId);
      window.removeEventListener('message', messageHandler);
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };

    // Kill infinite loops after 3 seconds
    timeoutId = setTimeout(() => {
      setOutput(prev => [...prev, { type: 'error', text: 'Execution timed out (3000ms).' }]);
      cleanup();
    }, 3000);

    const safeCode = code.replace(/<\/script>/gi, '<\\/script>');

    const srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            // Intercept console messages
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            
            console.log = (...args) => {
              window.parent.postMessage({ type: 'console', level: 'log', content: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
              originalLog(...args);
            };
            
            console.error = (...args) => {
              window.parent.postMessage({ type: 'console', level: 'error', content: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
              originalError(...args);
            };
            
            console.warn = (...args) => {
              window.parent.postMessage({ type: 'console', level: 'log', content: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
              originalWarn(...args);
            };

            window.onerror = (message, source, lineno, colno, error) => {
              window.parent.postMessage({ type: 'error', content: message }, '*');
              return true;
            };

            // Async wrapper to support top-level await if needed
            const run = async () => {
              try {
                ${safeCode}
              } catch (err) {
                window.parent.postMessage({ type: 'error', content: err.message }, '*');
              } finally {
                window.parent.postMessage({ type: 'done' }, '*');
              }
            };
            
            window.addEventListener('load', run);
          </script>
        </head>
        <body></body>
      </html>
    `;

    iframe.srcdoc = srcdoc;
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-brand-border bg-black/40 shadow-md flex flex-col">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border bg-brand-card/90 select-none shrink-0">
        <div className="flex items-center space-x-2 text-brand-secondary">
          <Terminal className="h-4 w-4" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-muted">
            {language}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {isExecutable && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center space-x-1.5 text-xs text-brand-success hover:text-brand-success/80 transition-colors bg-brand-success/10 hover:bg-brand-success/20 px-2 py-1 rounded-md disabled:opacity-50"
            >
              {isRunning ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-brand-success border-t-transparent" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
          )}
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
      </div>
      
      {/* Preformatted Code Content */}
      <div className="overflow-x-auto p-4 bg-black/20 text-[#00D4FF] font-mono text-sm max-h-[400px] scrollbar-thin">
        <pre><code>{code}</code></pre>
      </div>

      {/* Interactive Terminal Output */}
      {output.length > 0 && (
        <div className="border-t border-brand-border bg-[#0A0A0F] shrink-0">
          <div className="flex items-center px-4 py-1.5 bg-brand-border/20 border-b border-brand-border select-none">
            <span className="text-[10px] font-mono font-medium tracking-widest text-brand-muted uppercase">Terminal Output</span>
          </div>
          <div className="p-3 font-mono text-xs max-h-[200px] overflow-y-auto scrollbar-thin space-y-1">
            {output.map((line, i) => (
              <div key={i} className={line.type === 'error' ? 'text-brand-error' : 'text-brand-text/90'}>
                <span className="opacity-50 mr-2">❯</span>
                <span className="whitespace-pre-wrap">{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  speakingMessageId,
  speakingCharIndex,
  onSpeak,
  onImageClick,
  conversationId,
  onPinToggle,
  onRate,
  onDelete,
  onEdit,
  onRegenerate
}) => {
  const [copiedBubble, setCopiedBubble] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const isUser = message.role === 'user';
  const isSpeaking = speakingMessageId === message.id;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedBubble(true);
      setTimeout(() => setCopiedBubble(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleSpeakClick = () => {
    onSpeak(message.id, message.content);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText.trim() !== message.content) {
      onEdit(conversationId, message.id, editText);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.content);
    setIsEditing(false);
  };

  // Helper function to recursively traverse and apply word-highlighting inside Markdown
  const highlightSpokenWords = (children: React.ReactNode, activeIndex: number): React.ReactNode => {
    let charCounter = 0;
    
    const processNode = (node: React.ReactNode): React.ReactNode => {
      if (typeof node === 'string') {
        const nodeLength = node.length;
        const startCounter = charCounter;
        charCounter += nodeLength;
        
        // If the active index falls within this text node, highlight the word
        if (activeIndex >= startCounter && activeIndex < charCounter) {
          const localIndex = activeIndex - startCounter;
          
          // Find the bounds of the word around localIndex
          let start = localIndex;
          while (start > 0 && /\w/.test(node[start - 1])) {
            start--;
          }
          let end = localIndex;
          while (end < node.length && /\w/.test(node[end])) {
            end++;
          }
          
          return (
            <>
              {node.slice(0, start)}
              <span className="bg-brand-primary/30 text-brand-secondary font-semibold border-b border-brand-secondary border-dashed px-0.5 rounded transition-all duration-150">
                {node.slice(start, end)}
              </span>
              {node.slice(end)}
            </>
          );
        }
        return node;
      }
      
      if (React.isValidElement(node) && node.props && node.props.children) {
        const newChildren = React.Children.map(node.props.children, child => processNode(child));
        return React.cloneElement(node, { ...node.props }, newChildren);
      }
      
      return node;
    };

    return React.Children.map(children, child => processNode(child));
  };

  return (
    <motion.div
      id={`msg-${message.id}`}
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
      <div className="relative flex flex-col min-w-[150px]">
        {/* Rating or Pin badges when selected */}
        <div className="absolute -top-2 right-12 flex items-center space-x-1 z-10 select-none">
          {message.isPinned && (
            <span className="bg-brand-primary/20 text-brand-secondary border border-brand-primary/30 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center space-x-0.5 shadow-sm">
              <Pin className="h-2.5 w-2.5 fill-current" />
              <span>Pinned</span>
            </span>
          )}
          {message.rating === 1 && (
            <span className="bg-brand-success/15 text-brand-success border border-brand-success/30 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center space-x-0.5 shadow-sm">
              <ThumbsUp className="h-2.5 w-2.5 fill-current" />
              <span>Helpful</span>
            </span>
          )}
          {message.rating === -1 && (
            <span className="bg-brand-error/15 text-brand-error border border-brand-error/30 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center space-x-0.5 shadow-sm">
              <ThumbsDown className="h-2.5 w-2.5 fill-current" />
              <span>Low Quality</span>
            </span>
          )}
        </div>

        <div
          className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 ${
            isUser
              ? 'bg-gradient-accent text-white rounded-tr-sm'
              : 'bg-brand-card/90 border border-brand-border/60 text-brand-text rounded-tl-sm'
          }`}
        >
          {/* Custom Action Button Toolbar (overlay on hover, hidden when editing) */}
          {!isEditing && (
            <div
              className={`absolute -top-2.5 ${
                isUser ? '-left-2' : '-right-2'
              } flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 shadow-md transition-all duration-200 z-10`}
            >
              {!isUser && (
                <>
                  {/* Read Aloud */}
                  <button
                    onClick={handleSpeakClick}
                    className="p-1.5 rounded-lg border border-brand-border bg-brand-card text-brand-muted hover:text-brand-text transition-colors"
                    title={isSpeaking ? 'Stop Reading' : 'Read Aloud'}
                  >
                    {isSpeaking ? (
                      <VolumeX className="h-3.5 w-3.5 text-brand-error animate-pulse" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                  
                  {/* Pin/Unpin */}
                  <button
                    onClick={() => onPinToggle(conversationId, message.id)}
                    className={`p-1.5 rounded-lg border border-brand-border bg-brand-card transition-colors ${
                      message.isPinned ? 'text-brand-secondary border-brand-secondary/30 bg-brand-secondary/5' : 'text-brand-muted hover:text-brand-text'
                    }`}
                    title={message.isPinned ? 'Unpin message' : 'Pin message'}
                  >
                    {message.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  </button>

                  {/* Thumbs Up */}
                  <button
                    onClick={() => onRate(conversationId, message.id, 1)}
                    className={`p-1.5 rounded-lg border border-brand-border bg-brand-card transition-colors ${
                      message.rating === 1 ? 'text-brand-success border-brand-success/30 bg-brand-success/5 shadow-sm' : 'text-brand-muted hover:text-brand-text'
                    }`}
                    title="Thumbs up"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>

                  {/* Thumbs Down */}
                  <button
                    onClick={() => onRate(conversationId, message.id, -1)}
                    className={`p-1.5 rounded-lg border border-brand-border bg-brand-card transition-colors ${
                      message.rating === -1 ? 'text-brand-error border-brand-error/30 bg-brand-error/5 shadow-sm' : 'text-brand-muted hover:text-brand-text'
                    }`}
                    title="Thumbs down"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>

                  {/* Regenerate Response */}
                  <button
                    onClick={() => onRegenerate(conversationId, message.id)}
                    className="p-1.5 rounded-lg border border-brand-border bg-brand-card text-brand-muted hover:text-brand-text transition-colors"
                    title="Regenerate response"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                </>
              )}

              {isUser && (
                /* Edit button for User Messages */
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg border border-brand-border bg-brand-card text-brand-muted hover:text-brand-text transition-colors"
                  title="Edit message"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Copy Bubble Text */}
              <button
                onClick={handleCopyMessage}
                className="p-1.5 rounded-lg border border-brand-border bg-brand-card text-brand-muted hover:text-brand-text transition-colors"
                title="Copy text"
              >
                {copiedBubble ? (
                  <Check className="h-3.5 w-3.5 text-brand-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Delete Message */}
              <button
                onClick={() => onDelete(conversationId, message.id)}
                className="p-1.5 rounded-lg border border-brand-border bg-brand-card text-brand-muted hover:text-brand-error transition-colors"
                title="Delete message"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Render Text Content (or Input field when isEditing is active) */}
          {isEditing ? (
            <div className="flex flex-col space-y-2 py-1 min-w-[200px] md:min-w-[320px]">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-[#0A0A0F]/60 border border-brand-border focus:border-brand-primary/50 text-white rounded-xl p-2.5 text-sm outline-none resize-y min-h-[80px] leading-relaxed"
                placeholder="Edit your message..."
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-2.5 py-1.5 text-xs text-brand-text/80 hover:bg-brand-border/40 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 text-xs font-semibold bg-gradient-accent text-white rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  Save & Resend
                </button>
              </div>
            </div>
          ) : isUser ? (
            <div className="flex flex-col space-y-2">
              {message.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-white/20 shadow-sm cursor-zoom-in hover:opacity-90 active:scale-98 transition-all max-w-[240px]">
                  <img
                    src={message.imageUrl}
                    alt="Uploaded attachment"
                    className="max-h-[180px] w-full object-cover"
                    onClick={() => onImageClick && onImageClick(message.imageUrl!)}
                  />
                </div>
              )}
              {message.content && (
                <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed break-words">
                  {message.content}
                </p>
              )}
            </div>
          ) : (
            <div className="markdown-content text-sm md:text-base break-words">
              <ReactMarkdown
                components={{
                  // Highlight spoken text for standard paragraph nodes
                  p({ children, ...props }) {
                    return (
                      <p {...props}>
                        {isSpeaking ? highlightSpokenWords(children, speakingCharIndex) : children}
                      </p>
                    );
                  },
                  // Highlight spoken text for list item nodes
                  li({ children, ...props }) {
                    return (
                      <li {...props}>
                        {isSpeaking ? highlightSpokenWords(children, speakingCharIndex) : children}
                      </li>
                    );
                  },
                  // Capture code blocks and render using our premium CodeBlock component
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    const isInline = match ? false : true;

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
