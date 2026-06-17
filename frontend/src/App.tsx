import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useChat } from './hooks/useChat';
import { useSpeech } from './hooks/useSpeech';
import { useImageUpload } from './hooks/useImageUpload';
import { usePinnedMessages } from './hooks/usePinnedMessages';
import { useSearch } from './hooks/useSearch';
import { useDocumentUpload } from './hooks/useDocumentUpload';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { InputBar } from './components/InputBar';
import { SettingsModal } from './components/SettingsModal';
import { ImageLightbox } from './components/ImageLightbox';
import { PinnedPanel } from './components/PinnedPanel';
import { SearchOverlay } from './components/SearchOverlay';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
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
    clearAllConversations,
    // Feature 3 actions
    togglePinMessage,
    rateMessage,
    deleteMessage,
    editMessage,
    regenerateMessage
  } = useChat();

  // Feature 1: Speech Hook (STT & TTS)
  const {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    speakingMessageId,
    speakingCharIndex,
    voices,
    selectedVoiceName,
    setSelectedVoiceName,
    speak
  } = useSpeech();

  // Feature 2: Image Upload Hook & Lightbox State
  const {
    selectedFile,
    previewUrl,
    base64Data,
    handleFileSelect,
    clearImage
  } = useImageUpload();

  const [activeLightboxUrl, setActiveLightboxUrl] = useState<string | null>(null);

  // Feature 3: Pinned Messages Hook & Panel State
  const pinnedMessages = usePinnedMessages(conversations);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);

  // Feature 4: Search Hook & Overlay State
  const {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    results,
    recentSearches,
    addRecentSearch,
    clearRecentSearches
  } = useSearch(conversations);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Feature 5: Analytics Dashboard State
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Feature 6: Document Upload Hook
  const {
    attachedDocument,
    isExtracting,
    documentError,
    handleDocumentSelect,
    clearDocument
  } = useDocumentUpload();

  useEffect(() => {
    if (documentError) {
      toast.error(documentError);
    }
  }, [documentError]);

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('nexus_theme');
    return (saved as ThemeMode) || 'dark';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  // Apply Advanced Theming (Feature 8)
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply Font Family
    const fontMap: Record<string, string> = {
      'inter': "'Inter', sans-serif",
      'outfit': "'Outfit', sans-serif",
      'roboto': "'Roboto', sans-serif",
      'fira-code': "'Fira Code', monospace"
    };
    root.style.setProperty('font-family', fontMap[settings.fontFamily || 'inter'] || fontMap['inter']);
    
    // Apply Accent Color
    const colorMap: Record<string, { primary: string, secondary: string }> = {
      'violet': { primary: '108, 99, 255', secondary: '0, 212, 255' },
      'emerald': { primary: '16, 185, 129', secondary: '52, 211, 153' },
      'blue': { primary: '59, 130, 246', secondary: '96, 165, 250' },
      'rose': { primary: '244, 63, 94', secondary: '251, 113, 133' },
      'amber': { primary: '245, 158, 11', secondary: '251, 191, 36' }
    };
    
    const themeColors = colorMap[settings.accentColor || 'violet'] || colorMap['violet'];
    root.style.setProperty('--color-primary', themeColors.primary);
    root.style.setProperty('--color-secondary', themeColors.secondary);
    
  }, [settings.accentColor, settings.fontFamily]);

  // Keyboard shortcut listener for Ctrl+K (Open Search Overlay)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSendMessage = async (text: string) => {
    let finalPrompt = text;
    
    if (attachedDocument) {
      finalPrompt = `[Attached Document: ${attachedDocument.name}]\n\n${attachedDocument.extractedText}\n\n---\n\nUser Query: ${text || 'Please analyze this document.'}`;
    }

    await sendMessage(finalPrompt, undefined, selectedFile, base64Data);
    clearImage();
    clearDocument();
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
  };

  const handleResetSettings = () => {
    const defaultSettings: Settings = {
      apiKey: '',
      model: 'gemini-1.5-flash',
      maxTokens: 2048,
      temperature: 0.7,
      accentColor: 'violet',
      fontFamily: 'inter'
    };
    setSettings(defaultSettings);
  };

  const handleSelectPrompt = async (prompt: string) => {
    let personaStr = selectedPersona;
    if (prompt.toLowerCase().includes('debug') || prompt.toLowerCase().includes('react')) {
      personaStr = 'code';
    } else if (prompt.toLowerCase().includes('story') || prompt.toLowerCase().includes('creative')) {
      personaStr = 'creative';
    }

    const { id } = createNewChat(prompt, personaStr);
    await sendMessage(prompt, id);
  };

  const handleJumpToMessage = (conversationId: string, messageId: string) => {
    setActiveConversationId(conversationId);
    setIsPinnedOpen(false);
    setIsSearchOpen(false);

    // Give DOM a small tick to load and render the target conversation messages
    setTimeout(() => {
      const element = document.getElementById(`msg-${messageId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add a temporary glow indicator
        element.classList.add('glow-active');
        setTimeout(() => {
          element.classList.remove('glow-active');
        }, 3000);
      }
    }, 150);
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
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
      />

      {/* Main Chat Hub Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header
          activeConversation={activeConversation}
          theme={theme}
          toggleTheme={toggleTheme}
          openSettings={() => setIsSettingsOpen(true)}
          toggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          totalPinnedCount={pinnedMessages.length}
          onTogglePinnedPanel={() => setIsPinnedOpen(!isPinnedOpen)}
          onToggleSearch={() => setIsSearchOpen(true)}
        />

        <ChatWindow
          activeConversation={activeConversation}
          isLoading={isLoading}
          onSelectPrompt={handleSelectPrompt}
          speakingMessageId={speakingMessageId}
          speakingCharIndex={speakingCharIndex}
          onSpeak={speak}
          onImageClick={setActiveLightboxUrl}
          onPinToggle={togglePinMessage}
          onRate={rateMessage}
          onDelete={deleteMessage}
          onEdit={editMessage}
          onRegenerate={regenerateMessage}
        />

        <InputBar
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          selectedPersona={selectedPersona}
          setSelectedPersona={setSelectedPersona}
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          transcript={transcript}
          previewUrl={previewUrl}
          onFileSelect={handleFileSelect}
          onClearImage={clearImage}
          attachedDocumentName={attachedDocument?.name}
          isExtractingDocument={isExtracting}
          onDocumentSelect={handleDocumentSelect}
          onClearDocument={clearDocument}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onReset={handleResetSettings}
        hasMessages={!!activeConversation && activeConversation.messages.length > 0}
        onExport={() => activeConversation && exportConversation(activeConversation.id)}
        voices={voices}
        selectedVoiceName={selectedVoiceName}
        setSelectedVoiceName={setSelectedVoiceName}
      />

      {/* Fullscreen Image Lightbox */}
      <ImageLightbox
        imageUrl={activeLightboxUrl}
        onClose={() => setActiveLightboxUrl(null)}
      />

      {/* Pinned Messages Slide Panel */}
      <PinnedPanel
        isOpen={isPinnedOpen}
        onClose={() => setIsPinnedOpen(false)}
        pinnedMessages={pinnedMessages}
        onUnpin={togglePinMessage}
        onJumpToMessage={handleJumpToMessage}
      />

      {/* Global Search Overlay (Feature 4) */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        debouncedQuery={debouncedQuery}
        results={results}
        recentSearches={recentSearches}
        onAddRecentSearch={addRecentSearch}
        onClearRecentSearches={clearRecentSearches}
        onJumpToMessage={handleJumpToMessage}
      />

      {/* Analytics Dashboard overlay */}
      <AnalyticsDashboard
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        conversations={conversations}
      />

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
