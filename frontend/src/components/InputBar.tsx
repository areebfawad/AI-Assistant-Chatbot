import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Code2, Brain, Edit3, Loader2, Eraser } from 'lucide-react';
import { PersonaType } from '../types';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  selectedPersona: PersonaType;
  setSelectedPersona: (persona: PersonaType) => void;
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
  setSelectedPersona
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxCharLimit = 4000;

  const personaOptions: PersonaOption[] = [
    { id: 'default', name: 'Default', avatar: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'code', name: 'Coder', avatar: <Code2 className="h-3.5 w-3.5" /> },
    { id: 'creative', name: 'Creative', avatar: <Edit3 className="h-3.5 w-3.5" /> },
    { id: 'analyst', name: 'Analyst', avatar: <Brain className="h-3.5 w-3.5" /> }
  ];

  // Auto-expand the textarea height to fit input
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (text.trim() && !isLoading && text.length <= maxCharLimit) {
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
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const currentPersonaOption = personaOptions.find(o => o.id === selectedPersona) || personaOptions[0];

  return (
    <div className="p-4 bg-brand-card/60 border-t border-brand-border/60 backdrop-blur-md sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto flex flex-col space-y-2">
        
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
            {text.length > 0 && (
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
        <div className="flex items-end space-x-2 bg-brand-card border border-brand-border focus-within:border-brand-primary/50 focus-within:ring-1 focus-within:ring-brand-primary/25 rounded-2xl p-2 transition-all duration-300">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask NexusAI anything... (${currentPersonaOption.name} mode active)`}
            className="flex-1 resize-none bg-transparent outline-none border-none py-1.5 px-3 text-sm md:text-base text-brand-text max-h-[200px] overflow-y-auto leading-relaxed placeholder:text-brand-muted/80 scrollbar-thin"
            disabled={isLoading}
          />
          
          {/* Action Row: Character Counter + Send Action */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className={`text-[10px] select-none ${text.length > maxCharLimit ? 'text-brand-error' : 'text-brand-muted'}`}>
              {text.length} / {maxCharLimit}
            </span>
            <button
              onClick={handleSend}
              disabled={isLoading || !text.trim() || text.length > maxCharLimit}
              className={`p-2.5 rounded-xl transition-all duration-200 select-none ${
                isLoading || !text.trim() || text.length > maxCharLimit
                  ? 'bg-brand-border text-brand-muted cursor-not-allowed'
                  : 'bg-gradient-accent text-white shadow-glow hover:opacity-95 hover:scale-105 active:scale-95'
              }`}
              title="Send Message"
            >
              {isLoading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Send className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default InputBar;
