import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, Code2, Brain, Edit3, Loader2, Eraser, 
  Mic, MicOff, Image as ImageIcon, FileText, X 
} from 'lucide-react';
import { PersonaType } from '../types';
import { FormattingToolbar } from './FormattingToolbar';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  selectedPersona: PersonaType;
  setSelectedPersona: (persona: PersonaType) => void;
  // Feature 1 additions
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  transcript: string;
  // Feature 2 additions
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onClearImage: () => void;
  // Feature 6 additions
  attachedDocumentName?: string;
  isExtractingDocument?: boolean;
  onDocumentSelect?: (file: File) => void;
  onClearDocument?: () => void;
}

interface PersonaOption {
  id: PersonaType;
  name: string;
  avatar: React.ReactNode;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  isLoading,
  selectedPersona,
  setSelectedPersona,
  isRecording,
  startRecording,
  stopRecording,
  transcript,
  previewUrl,
  onFileSelect,
  onClearImage,
  attachedDocumentName,
  isExtractingDocument,
  onDocumentSelect,
  onClearDocument
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const maxCharLimit = 4000;

  const personaOptions: PersonaOption[] = [
    { id: 'default', name: 'Default', avatar: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'code', name: 'Coder', avatar: <Code2 className="h-3.5 w-3.5" /> },
    { id: 'creative', name: 'Creative', avatar: <Edit3 className="h-3.5 w-3.5" /> },
    { id: 'analyst', name: 'Analyst', avatar: <Brain className="h-3.5 w-3.5" /> }
  ];

  const [isFocused, setIsFocused] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashSearch, setSlashSearch] = useState('');

  useEffect(() => {
    if (text.startsWith('/')) {
      setShowSlashMenu(true);
      setSlashSearch(text.substring(1).toLowerCase());
    } else {
      setShowSlashMenu(false);
    }
  }, [text]);

  const filteredSlashOptions = personaOptions.filter(o => o.name.toLowerCase().includes(slashSearch));

  const handleFormat = (prefix: string, suffix: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    
    setText(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  const executeSlashCommand = (personaId: string) => {
    if (personaId === 'clear') {
      handleClear();
    } else {
      setSelectedPersona(personaId as PersonaType);
      setText('');
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
    setShowSlashMenu(false);
  };

  // Sync transcribed text to input bar textarea state
  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);

  // Auto-expand the textarea height to fit input
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if ((text.trim() || previewUrl || attachedDocumentName) && !isLoading && !isExtractingDocument && text.length <= maxCharLimit) {
      onSendMessage(text);
      setText('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, allow shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setText('');
    onClearImage();
    if (onClearDocument) onClearDocument();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onDocumentSelect) {
      onDocumentSelect(e.target.files[0]);
    }
    // Clear input value so same file can be selected again
    e.target.value = '';
  };

  const currentPersonaOption = personaOptions.find(o => o.id === selectedPersona) || personaOptions[0];

  return (
    <div className="p-4 bg-brand-card/60 border-t border-brand-border/60 backdrop-blur-md sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto flex flex-col space-y-2">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Attachment Preview (Feature 2) */}
          {previewUrl && (
            <div className="relative inline-flex items-center">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-brand-border bg-[#0A0A0F]/80 p-1 flex items-center justify-center shadow-md animate-fade-in">
                <img src={previewUrl} alt="Upload preview" className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={onClearImage}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-brand-error text-white transition-colors border border-white/10"
                  title="Remove attached image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Document Chip (Feature 6) */}
          {attachedDocumentName && (
            <div className="inline-flex items-center space-x-2 bg-brand-primary/10 border border-brand-primary/30 rounded-xl px-3 py-2 animate-fade-in shadow-sm">
              <FileText className="h-4 w-4 text-brand-primary" />
              <span className="text-xs font-medium text-brand-text/90 max-w-[150px] md:max-w-xs truncate">
                {attachedDocumentName}
              </span>
              <button
                onClick={onClearDocument}
                className="p-1 rounded-full text-brand-muted hover:text-brand-error hover:bg-brand-border transition-colors"
                title="Remove document"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Controls Row: Persona Selector + Eraser + Keyboard hint */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Persona Dropdown Selector */}
            <div className="relative inline-flex items-center rounded-lg border border-brand-border bg-[#0A0A0F]/60 px-2.5 py-1 text-xs text-brand-text">
              <span className="text-brand-muted mr-1.5">Context:</span>
              <div className="flex items-center space-x-1 font-medium select-none">
                {currentPersonaOption.avatar}
                <select
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value as PersonaType)}
                  className="bg-transparent font-medium text-brand-text outline-none cursor-pointer pr-1"
                  title="Switch Persona"
                >
                  {personaOptions.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-brand-card text-brand-text">
                      {opt.name} Assistant
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Clear Input Tool */}
            {(text.length > 0 || previewUrl || attachedDocumentName) && (
              <button
                onClick={handleClear}
                className="p-1 rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-border/40 transition-colors"
                title="Clear input"
              >
                <Eraser className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Desktop shortcut hint */}
          <span className="hidden md:flex items-center space-x-1 text-[11px] text-brand-muted">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded border border-brand-border bg-brand-card font-mono text-[9px] font-bold text-brand-text shadow-sm">
              Enter
            </kbd>
            <span>to send,</span>
            <kbd className="px-1.5 py-0.5 rounded border border-brand-border bg-brand-card font-mono text-[9px] font-bold text-brand-text shadow-sm">
              Shift+Enter
            </kbd>
            <span>for new line</span>
          </span>
        </div>

        {/* Input Text Box Area */}
        <div className="relative flex items-end space-x-2 bg-brand-card border border-brand-border focus-within:border-brand-primary/50 focus-within:ring-1 focus-within:ring-brand-primary/25 rounded-2xl p-2 transition-all duration-300">
          
          <FormattingToolbar 
            isVisible={isFocused || text.length > 0} 
            onFormat={handleFormat} 
          />

          {/* Slash Command Menu */}
          <AnimatePresence>
            {showSlashMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-[105%] left-0 w-64 bg-brand-card border border-brand-border rounded-xl shadow-glow overflow-hidden z-30"
              >
                <div className="p-2 text-[10px] font-semibold text-brand-muted uppercase tracking-wider border-b border-brand-border/50">
                  Quick Actions (Slash Commands)
                </div>
                <div className="max-h-48 overflow-y-auto scrollbar-thin">
                  {filteredSlashOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => executeSlashCommand(opt.id)}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-brand-text hover:bg-brand-primary/20 hover:text-brand-primary transition-colors text-left"
                    >
                      {opt.avatar}
                      <span>Switch to <strong>{opt.name}</strong></span>
                    </button>
                  ))}
                  {'clear'.includes(slashSearch) && (
                    <button
                      onClick={() => executeSlashCommand('clear')}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-brand-error hover:bg-brand-error/20 transition-colors text-left"
                    >
                      <Eraser className="h-4 w-4" />
                      <span>Clear Input</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={
              isRecording 
                ? 'Listening... speak clearly into your microphone' 
                : previewUrl 
                  ? 'Ask NexusAI about this image...' 
                  : attachedDocumentName
                    ? 'Ask NexusAI a question about this document...'
                    : `Ask NexusAI anything... (${currentPersonaOption.name} mode active)`
            }
            className="flex-1 resize-none bg-transparent outline-none border-none py-1.5 px-3 text-sm md:text-base text-brand-text max-h-[200px] overflow-y-auto leading-relaxed placeholder:text-brand-muted/80 scrollbar-thin"
            disabled={isLoading || isExtractingDocument}
          />
          
          {/* Action Row: Attach File + Mic + Character Counter + Send Action */}
          <div className="flex items-center space-x-1 md:space-x-2 shrink-0">
            {/* Image Attachment Button */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2.5 rounded-xl transition-all duration-200 select-none bg-brand-border/40 text-brand-text/70 hover:text-brand-text hover:bg-brand-border"
              title="Attach Image (PNG/JPG/WEBP/GIF)"
            >
              <ImageIcon className="h-[18px] w-[18px]" />
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Document Attachment Button */}
            <button
              type="button"
              onClick={() => documentInputRef.current?.click()}
              className={`p-2.5 rounded-xl transition-all duration-200 select-none ${
                isExtractingDocument ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-border/40 text-brand-text/70 hover:text-brand-text hover:bg-brand-border'
              }`}
              title="Attach Document (PDF/TXT/MD/CSV)"
              disabled={isExtractingDocument}
            >
              {isExtractingDocument ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <FileText className="h-[18px] w-[18px]" />}
            </button>
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.txt,.md,.csv,.json"
              onChange={handleDocumentChange}
              className="hidden"
            />

            {/* Voice input button */}
            <button
              type="button"
              onClick={handleMicToggle}
              className={`relative p-2.5 rounded-xl transition-all duration-200 select-none ${
                isRecording 
                  ? 'bg-brand-error text-white shadow-glow' 
                  : 'bg-brand-border/40 text-brand-text/70 hover:text-brand-text hover:bg-brand-border'
              }`}
              title={isRecording ? 'Stop Recording' : 'Voice Input (STT)'}
            >
              {isRecording && (
                <motion.span
                  animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-xl bg-brand-error/45"
                />
              )}
              {isRecording ? (
                <MicOff className="h-[18px] w-[18px] relative z-10 animate-pulse" />
              ) : (
                <Mic className="h-[18px] w-[18px]" />
              )}
            </button>

            <span className={`hidden md:inline-block text-[10px] select-none ${text.length > maxCharLimit ? 'text-brand-error' : 'text-brand-muted'} px-1`}>
              {text.length} / {maxCharLimit}
            </span>
            
            <button
              onClick={handleSend}
              disabled={isLoading || isExtractingDocument || (!text.trim() && !previewUrl && !attachedDocumentName) || text.length > maxCharLimit}
              className={`p-2.5 rounded-xl transition-all duration-200 select-none ${
                isLoading || isExtractingDocument || (!text.trim() && !previewUrl && !attachedDocumentName) || text.length > maxCharLimit
                  ? 'bg-brand-border text-brand-muted cursor-not-allowed'
                  : 'bg-gradient-accent text-white shadow-glow hover:opacity-95 hover:scale-105 active:scale-95'
              }`}
              title="Send Message"
            >
              {isLoading ? (
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
              ) : (
                <Send className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default InputBar;
