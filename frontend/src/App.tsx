import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { X, Sliders, Shield, Key, FileDown, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useChat } from './hooks/useChat';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { InputBar } from './components/InputBar';
import { ThemeMode, Settings } from './types';

export const App: React.FC = () => {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    selectedPersona,
    isLoading,
    settings,
    setActiveConversationId,
    setSelectedPersona,
    setSettings,
    createNewChat,
    sendMessage,
    deleteConversation,
    exportConversation,
    clearAllConversations
  } = useChat();

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('nexus_theme');
    return (saved as ThemeMode) || 'dark';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Local settings state for modal editing
  const [localSettings, setLocalSettings] = useState<Settings>({ ...settings });

  // Sync settings when they change globally
  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  // Sync theme changes with DOM element
  useEffect(() => {
    localStorage.setItem('nexus_theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSaveSettings = () => {
    setSettings(localSettings);
    setIsSettingsOpen(false);
  };

  const handleResetSettings = () => {
    const defaultSettings: Settings = {
      apiKey: '',
      model: 'gemini-1.5-flash',
      maxTokens: 2048,
      temperature: 0.7
    };
    setLocalSettings(defaultSettings);
    setSettings(defaultSettings);
  };

  const handleSelectPrompt = async (prompt: string) => {
    // Determine the persona based on prompt content as general guidelines
    let personaStr = selectedPersona;
    if (prompt.toLowerCase().includes('debug') || prompt.toLowerCase().includes('react')) {
      personaStr = 'code';
    } else if (prompt.toLowerCase().includes('story') || prompt.toLowerCase().includes('creative')) {
      personaStr = 'creative';
    }

    const { id } = createNewChat(prompt, personaStr);
    await sendMessage(prompt, id);
  };

  return (
    <div className="flex h-screen w-screen bg-brand-bg text-brand-text overflow-hidden transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        createNewChat={createNewChat}
        deleteConversation={deleteConversation}
        exportConversation={exportConversation}
        clearAllConversations={clearAllConversations}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
      />

      {/* Main Chat Hub Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header
          activeConversation={activeConversation}
          theme={theme}
          toggleTheme={toggleTheme}
          openSettings={() => setIsSettingsOpen(true)}
          toggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <ChatWindow
          activeConversation={activeConversation}
          isLoading={isLoading}
          onSelectPrompt={handleSelectPrompt}
        />

        <InputBar
          onSendMessage={sendMessage}
          isLoading={isLoading}
          selectedPersona={selectedPersona}
          setSelectedPersona={setSelectedPersona}
        />
      </div>

      {/* Settings Modal (Scale + Fade via Framer Motion) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-brand-border bg-brand-card/95 shadow-glow p-6 z-10 backdrop-blur-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-brand-border/60 mb-5">
                <div className="flex items-center space-x-2 text-brand-primary">
                  <Sliders className="h-5 w-5" />
                  <h3 className="text-lg font-bold text-brand-text">Settings</h3>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-border/40 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="space-y-5">
                
                {/* Custom API Key input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted flex items-center justify-between">
                    <span>Google Gemini API Key</span>
                    <span className="text-[10px] lowercase font-normal italic text-brand-primary">Optional override</span>
                  </label>
                  <div className="relative flex items-center bg-[#0A0A0F]/60 border border-brand-border rounded-xl px-3 focus-within:border-brand-primary/50 transition-colors">
                    <Key className="h-4 w-4 text-brand-muted mr-2 shrink-0" />
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={localSettings.apiKey}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="AIStudio API Key (e.g. AIzaSy...)"
                      className="w-full bg-transparent border-none outline-none py-2 text-sm text-brand-text placeholder:text-brand-muted/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1 text-brand-muted hover:text-brand-text transition-colors shrink-0"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-brand-muted flex items-start space-x-1 mt-1 leading-normal">
                    <Shield className="h-3 w-3 inline text-brand-secondary shrink-0 mt-0.5" />
                    <span>Stored locally in browser. If blank, server-configured API key will be utilized. Get key free at <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:underline">aistudio.google.com</a>.</span>
                  </p>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted block">
                    Gemini Model
                  </label>
                  <select
                    value={localSettings.model}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full bg-[#0A0A0F]/60 border border-brand-border rounded-xl py-2 px-3 text-sm text-brand-text outline-none focus:border-brand-primary/50 cursor-pointer"
                  >
                    <option value="gemini-1.5-flash" className="bg-brand-card">gemini-1.5-flash (Fast & lightweight)</option>
                    <option value="gemini-1.5-pro" className="bg-brand-card">gemini-1.5-pro (Highly complex reasoning)</option>
                  </select>
                </div>

                {/* Temperature slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-muted">
                    <span>Temperature (Creativity)</span>
                    <span className="font-mono text-brand-secondary">{localSettings.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2.0"
                    step="0.1"
                    value={localSettings.temperature}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full h-1 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                  <div className="flex justify-between text-[9px] text-brand-muted select-none">
                    <span>Precise / Logical</span>
                    <span>Creative / Imaginative</span>
                  </div>
                </div>

                {/* Max Tokens slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-muted">
                    <span>Max Output Length (Tokens)</span>
                    <span className="font-mono text-brand-secondary">{localSettings.maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="8192"
                    step="256"
                    value={localSettings.maxTokens}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                  <div className="flex justify-between text-[9px] text-brand-muted select-none">
                    <span>256 Tokens (Short)</span>
                    <span>8192 Tokens (Verbose)</span>
                  </div>
                </div>

                {/* Quick actions inside settings */}
                <div className="flex items-center space-x-2 pt-2 border-t border-brand-border/40 text-xs">
                  {activeConversation && activeConversation.messages.length > 0 && (
                    <button
                      onClick={() => {
                        exportConversation(activeConversation.id);
                        setIsSettingsOpen(false);
                      }}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border border-brand-border hover:bg-brand-border/40 text-brand-text transition-colors"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      <span>Export Active Chat</span>
                    </button>
                  )}
                  <button
                    onClick={handleResetSettings}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border border-brand-border hover:bg-brand-border/40 text-brand-text transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                </div>

              </div>

              {/* Footer Save / Cancel */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-brand-border/60">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-border/40 text-brand-text transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-accent text-white shadow-glow hover:opacity-95 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Save Configuration
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global toast notification stack */}
      <Toaster
        toastOptions={{
          className: 'bg-brand-card text-brand-text border border-brand-border rounded-xl text-sm shadow-md',
          style: {
            backgroundColor: 'var(--color-card)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px'
          },
          success: {
            iconTheme: {
              primary: '#00FF88',
              secondary: '#12121A',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF4466',
              secondary: '#12121A',
            },
          },
        }}
      />
    </div>
  );
};
export default App;
