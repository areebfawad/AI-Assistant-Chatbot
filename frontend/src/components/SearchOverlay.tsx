import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, FileText, CornerDownLeft, Sparkles, MessageSquare, History, Trash } from 'lucide-react';
import { GroupedSearchResult } from '../hooks/useSearch';
import { formatFullDate } from '../utils/formatMessage';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedQuery: string;
  results: GroupedSearchResult[];
  recentSearches: string[];
  onAddRecentSearch: (query: string) => void;
  onClearRecentSearches: () => void;
  onJumpToMessage: (conversationId: string, messageId: string) => void;
}

/**
 * Text highlighter wrapper component
 */
const HighlightText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query.trim()) return <span>{text}</span>;

  // Escape regex special chars to prevent syntax breakages
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, idx) =>
        regex.test(part) ? (
          <mark key={idx} className="bg-brand-secondary/20 text-brand-secondary font-semibold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  debouncedQuery,
  results,
  recentSearches,
  onAddRecentSearch,
  onClearRecentSearches,
  onJumpToMessage
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle Escape keyboard key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectResult = (conversationId: string, messageId: string) => {
    // Record current query in search history log
    onAddRecentSearch(searchQuery);
    // Jump to the message in conversation threads
    onJumpToMessage(conversationId, messageId);
  };

  const handleRecentClick = (term: string) => {
    setSearchQuery(term);
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-12 overflow-hidden">
          
          {/* Fading Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-zoom-out"
          />

          {/* Centered Panel */}
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-2xl bg-brand-card/90 border border-brand-border/80 shadow-glow rounded-2xl flex flex-col max-h-[80vh] z-10 overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-brand-border/60 flex items-center space-x-3 bg-brand-card/30">
              <Search className="h-5 w-5 text-brand-primary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages, code blocks, and conversation history..."
                className="w-full bg-transparent border-none outline-none text-sm md:text-base text-brand-text placeholder:text-brand-muted/70"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-brand-border/40 text-brand-text/50 hover:text-brand-text transition-colors shrink-0"
                title="Close Search Overlay (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results / History view container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
              
              {/* Recent Searches */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-brand-muted font-semibold tracking-wide select-none">
                    <span className="flex items-center space-x-1.5">
                      <History className="h-3.5 w-3.5" />
                      <span>Recent Searches</span>
                    </span>
                    <button
                      onClick={onClearRecentSearches}
                      className="flex items-center space-x-1 text-brand-muted hover:text-brand-error transition-colors"
                      title="Clear search history"
                    >
                      <Trash className="h-3 w-3" />
                      <span>Clear History</span>
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentClick(term)}
                        className="flex items-center text-xs px-3 py-1.5 rounded-lg border border-brand-border hover:border-brand-primary/40 bg-brand-card/40 text-brand-text/80 hover:text-brand-text hover:bg-brand-border/20 transition-all cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Queries Prompt */}
              {!searchQuery && recentSearches.length === 0 && (
                <div className="text-center py-12 select-none">
                  <Sparkles className="h-8 w-8 text-brand-primary/40 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-brand-muted max-w-xs mx-auto">
                    Type a query above to start searching. You can search through messages, topics, and code files.
                  </p>
                </div>
              )}

              {/* Empty state: No results found */}
              {searchQuery && debouncedQuery && results.length === 0 && (
                <div className="text-center py-12 select-none animate-fade-in">
                  <FileText className="h-8 w-8 text-brand-muted/40 mx-auto mb-2" />
                  <p className="text-sm font-medium text-brand-text">No results found</p>
                  <p className="text-xs text-brand-muted mt-1 max-w-xs mx-auto">
                    We couldn't find any messages matching "{debouncedQuery}" across your conversations.
                  </p>
                </div>
              )}

              {/* Results Group List */}
              {results.length > 0 && (
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-brand-muted select-none">
                    Matches Found ({results.reduce((acc, curr) => acc + curr.messages.length, 0)})
                  </div>

                  <div className="space-y-4">
                    {results.map((group) => (
                      <div
                        key={group.conversationId}
                        className="border border-brand-border/60 bg-[#0A0A0F]/20 rounded-xl overflow-hidden shadow-sm"
                      >
                        {/* Conversation Header Title */}
                        <div className="px-3.5 py-2 border-b border-brand-border/30 bg-brand-border/10 flex items-center space-x-2 select-none">
                          <MessageSquare className="h-3.5 w-3.5 text-brand-secondary" />
                          <span className="text-xs font-semibold text-brand-secondary truncate">
                            {group.conversationTitle}
                          </span>
                        </div>

                        {/* Messages in this Conversation */}
                        <div className="divide-y divide-brand-border/20">
                          {group.messages.map((message) => (
                            <button
                              key={message.id}
                              onClick={() => handleSelectResult(group.conversationId, message.id)}
                              className="w-full text-left p-3.5 hover:bg-brand-border/10 transition-colors flex items-start justify-between cursor-pointer outline-none focus:bg-brand-border/20"
                            >
                              <div className="flex-1 pr-4 min-w-0">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted block mb-1">
                                  {message.role === 'user' ? 'User message' : 'NexusAI Response'}
                                </span>
                                <p className="text-xs text-brand-text/90 line-clamp-3 leading-relaxed break-words font-medium">
                                  <HighlightText text={message.content} query={debouncedQuery} />
                                </p>
                              </div>
                              
                              <div className="flex flex-col items-end shrink-0 space-y-1 select-none">
                                <span className="text-[9px] text-brand-muted">
                                  {formatFullDate(message.timestamp)}
                                </span>
                                <div className="p-1 rounded bg-brand-border/40 text-brand-text/60 opacity-0 group-hover:opacity-100 flex items-center">
                                  <CornerDownLeft className="h-3 w-3" />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default SearchOverlay;
