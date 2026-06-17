import React from 'react';
import { Menu, Settings, Sun, Moon, Sparkles, MessageSquare, Bookmark, Search } from 'lucide-react';
import { Conversation, ThemeMode } from '../types';

interface HeaderProps {
  activeConversation: Conversation | null;
  theme: ThemeMode;
  toggleTheme: () => void;
  openSettings: () => void;
  toggleMobileSidebar: () => void;
  // Feature 3 additions
  totalPinnedCount: number;
  onTogglePinnedPanel: () => void;
  // Feature 4 additions
  onToggleSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeConversation,
  theme,
  toggleTheme,
  openSettings,
  toggleMobileSidebar,
  totalPinnedCount,
  onTogglePinnedPanel,
  onToggleSearch
}) => {
  const messageCount = activeConversation?.messages.length || 0;

  return (
    <header className="h-16 w-full flex items-center justify-between px-4 md:px-6 border-b border-brand-border/60 bg-brand-card/70 backdrop-blur-md sticky top-0 z-30 transition-all duration-300">
      
      {/* Left side: Mobile Toggle & App Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 -ml-2 rounded-lg text-brand-text/70 hover:text-brand-text hover:bg-brand-border/40 md:hidden transition-colors focus:outline-none"
          title="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 select-none">
          <div className="h-8 w-8 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow">
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
          </div>
          <span className="text-xl font-bold bg-gradient-accent bg-clip-text text-transparent tracking-wide">
            NexusAI
          </span>
        </div>
      </div>

      {/* Center: Conversation Title & Stats (Desktops) */}
      <div className="hidden md:flex flex-col items-center max-w-[40%] text-center">
        {activeConversation ? (
          <>
            <span className="text-sm font-medium text-brand-text truncate w-full">
              {activeConversation.title}
            </span>
            <span className="text-[11px] text-brand-muted flex items-center space-x-1 mt-0.5">
              <MessageSquare className="h-3 w-3 inline" />
              <span>{messageCount} {messageCount === 1 ? 'message' : 'messages'}</span>
            </span>
          </>
        ) : (
          <span className="text-sm font-medium text-brand-muted">
            No Active Chat
          </span>
        )}
      </div>

      {/* Right side: Control Buttons */}
      <div className="flex items-center space-x-1 md:space-x-2">
        {/* Global Search trigger (Feature 4) */}
        <button
          onClick={onToggleSearch}
          className="p-2 rounded-lg text-brand-text/70 hover:text-brand-text hover:bg-brand-border/40 transition-colors focus:outline-none"
          title="Search Chats (Ctrl+K)"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Pinned Messages Trigger */}
        <button
          onClick={onTogglePinnedPanel}
          className="relative p-2 rounded-lg text-brand-text/70 hover:text-brand-text hover:bg-brand-border/40 transition-colors focus:outline-none"
          title="Pinned Messages"
        >
          <Bookmark className="h-5 w-5" />
          {totalPinnedCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-brand-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-brand-card select-none">
              {totalPinnedCount}
            </span>
          )}
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-brand-text/70 hover:text-brand-text hover:bg-brand-border/40 transition-colors focus:outline-none"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5 text-gray-800" />
          )}
        </button>

        <button
          onClick={openSettings}
          className="p-2 rounded-lg text-brand-text/70 hover:text-brand-text hover:bg-brand-border/40 transition-colors focus:outline-none"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
export default Header;
