import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Download, MessageSquare, X, Trash, BarChart3 } from 'lucide-react';
import { Conversation, PersonaType } from '../types';
import { formatFullDate } from '../utils/formatMessage';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  createNewChat: (initialPrompt?: string, persona?: PersonaType) => { id: string };
  deleteConversation: (id: string) => void;
  exportConversation: (id: string) => void;
  clearAllConversations: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenAnalytics: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  setActiveConversationId,
  createNewChat,
  deleteConversation,
  exportConversation,
  clearAllConversations,
  isOpenMobile,
  setIsOpenMobile,
  onOpenAnalytics
}) => {
  const handleSelectChat = (id: string) => {
    setActiveConversationId(id);
    setIsOpenMobile(false);
  };

  const handleNewChat = () => {
    createNewChat();
    setIsOpenMobile(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-full bg-brand-card/95 border-r border-brand-border/60 backdrop-blur-md">
      
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-brand-border/40">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-muted">
          Conversations
        </h2>
        <button
          onClick={() => setIsOpenMobile(false)}
          className="p-1 rounded-md text-brand-text/50 hover:text-brand-text hover:bg-brand-border/40 md:hidden transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-accent text-white font-medium hover:opacity-90 shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98] duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <MessageSquare className="h-8 w-8 text-brand-muted/40 mb-2" />
            <span className="text-xs text-brand-muted">
              No chats yet. Click "New Chat" to begin.
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {conversations.map((chat) => {
              const isActive = chat.id === activeConversationId;
              const hasMessages = chat.messages.length > 0;
              return (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative flex items-center rounded-xl p-3 cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-brand-primary/10 border-brand-primary/45 shadow-glass shadow-inner glow-active text-white'
                      : 'border-transparent text-brand-text/80 hover:bg-brand-border/20 hover:text-brand-text'
                  }`}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <div className="flex-1 min-w-0 pr-12">
                    <p className="text-sm font-medium truncate">
                      {chat.title}
                    </p>
                    <p className="text-[10px] text-brand-muted mt-1">
                      {formatFullDate(chat.timestamp)}
                    </p>
                  </div>

                  {/* Actions (visible on hover) */}
                  <div className="absolute right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    {hasMessages && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportConversation(chat.id);
                        }}
                        className="p-1 rounded hover:bg-brand-border text-brand-text/70 hover:text-brand-text transition-all"
                        title="Export Chat (.md)"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(chat.id);
                      }}
                      className="p-1 rounded hover:bg-brand-border text-brand-muted hover:text-brand-error transition-all"
                      title="Delete Chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-brand-border/40 space-y-2 shrink-0">
        <button
          onClick={onOpenAnalytics}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border border-brand-primary/30 text-brand-primary hover:text-white hover:bg-brand-primary/20 text-xs font-medium transition-all duration-200"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Analytics Dashboard</span>
        </button>
        {conversations.length > 0 && (
          <button
            onClick={clearAllConversations}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border border-brand-error/30 text-brand-error/80 hover:text-brand-error hover:bg-brand-error/5 text-xs font-medium transition-all duration-200"
          >
            <Trash className="h-4 w-4" />
            <span>Clear All Chats</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop View Sidebar */}
      <aside className="hidden md:flex h-full w-80 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile View Sidebar (Slide Drawer overlay) */}
      <AnimatePresence>
        {isOpenMobile && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenMobile(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Slide menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative flex flex-col w-80 max-w-[85vw] h-full"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Sidebar;
