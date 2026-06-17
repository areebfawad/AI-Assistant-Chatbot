import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pin, Search, Bookmark, ExternalLink } from 'lucide-react';
import { PinnedMessageItem } from '../hooks/usePinnedMessages';
import { formatFullDate } from '../utils/formatMessage';

interface PinnedPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedMessages: PinnedMessageItem[];
  onUnpin: (conversationId: string, messageId: string) => void;
  onJumpToMessage: (conversationId: string, messageId: string) => void;
}

export const PinnedPanel: React.FC<PinnedPanelProps> = ({
  isOpen,
  onClose,
  pinnedMessages,
  onUnpin,
  onJumpToMessage
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter pinned messages based on search query
  const filteredPinned = pinnedMessages.filter((item) =>
    item.message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.conversationTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Right Sliding Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-80 max-w-[85vw] h-full bg-brand-card/95 border-l border-brand-border/60 shadow-glow flex flex-col z-10 backdrop-blur-md"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-brand-border/40">
              <div className="flex items-center space-x-2 text-brand-primary">
                <Bookmark className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-text">
                  Pinned Messages ({pinnedMessages.length})
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-brand-text/50 hover:text-brand-text hover:bg-brand-border/45 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Pinned Messages Search input */}
            {pinnedMessages.length > 0 && (
              <div className="p-3 border-b border-brand-border/30">
                <div className="flex items-center bg-[#0A0A0F]/60 border border-brand-border/80 rounded-xl px-2.5 py-1.5 focus-within:border-brand-primary/50 transition-colors">
                  <Search className="h-4 w-4 text-brand-muted mr-1.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pinned messages..."
                    className="w-full bg-transparent border-none outline-none text-xs text-brand-text placeholder:text-brand-muted/70"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-brand-muted hover:text-brand-text text-[10px]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Cards List Panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
              {pinnedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                  <Pin className="h-8 w-8 text-brand-muted/40 mb-2 rotate-45" />
                  <span className="text-xs font-medium text-brand-muted">
                    No pinned messages. Hover over any chat response and click the pin icon to track key items.
                  </span>
                </div>
              ) : filteredPinned.length === 0 ? (
                <div className="text-center py-8 text-xs text-brand-muted">
                  No matching pinned messages found.
                </div>
              ) : (
                filteredPinned.map((item) => (
                  <div
                    key={item.message.id}
                    className="relative group border border-brand-border/80 bg-brand-card/30 hover:border-brand-primary/30 hover:bg-brand-border/10 rounded-xl p-3.5 transition-all duration-200 select-none shadow-sm flex flex-col space-y-2"
                  >
                    {/* Source Tag details */}
                    <div className="flex items-center justify-between text-[10px] text-brand-muted">
                      <span className="font-semibold uppercase text-brand-secondary tracking-wider truncate max-w-[70%]">
                        {item.conversationTitle}
                      </span>
                      <span>{formatFullDate(item.message.timestamp)}</span>
                    </div>

                    {/* Preview message context */}
                    <p className="text-xs text-brand-text/90 line-clamp-3 leading-relaxed break-words font-medium">
                      {item.message.content}
                    </p>

                    {/* Quick navigation actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-brand-border/20 text-[10px] select-none">
                      <button
                        onClick={() => onJumpToMessage(item.conversationId, item.message.id)}
                        className="flex items-center space-x-1 text-brand-primary hover:underline font-semibold"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Jump to chat</span>
                      </button>

                      <button
                        onClick={() => onUnpin(item.conversationId, item.message.id)}
                        className="text-brand-muted hover:text-brand-error font-medium"
                      >
                        Unpin
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default PinnedPanel;
