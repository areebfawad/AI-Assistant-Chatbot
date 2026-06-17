import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Shield, Key, FileDown, RefreshCw, Eye, EyeOff, Volume2 } from 'lucide-react';
import { Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
  onReset: () => void;
  hasMessages: boolean;
  onExport: () => void;
  // Feature 1 additions
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  setSelectedVoiceName: (voiceName: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onReset,
  hasMessages,
  onExport,
  voices,
  selectedVoiceName,
  setSelectedVoiceName
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [localSettings, setLocalSettings] = useState<Settings>({ ...settings });

  // Sync settings when they change globally or modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings({ ...settings });
    }
  }, [settings, isOpen]);

  const handleSave = () => {
    onSave(localSettings);
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Dark Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-brand-border bg-brand-card/95 shadow-glow p-6 z-10 backdrop-blur-md max-h-[90vh] overflow-y-auto scrollbar-thin"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-brand-border/60 mb-5">
              <div className="flex items-center space-x-2 text-brand-primary">
                <Sliders className="h-5 w-5" />
                <h3 className="text-lg font-bold text-brand-text">Settings</h3>
              </div>
              <button
                onClick={onClose}
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
                  <option value="gemini-2.0-flash-exp" className="bg-brand-card">gemini-2.0-flash-exp (Experimental)</option>
                  <option value="gemini-1.5-flash" className="bg-brand-card">gemini-1.5-flash (Fast & lightweight)</option>
                  <option value="gemini-1.5-pro" className="bg-brand-card">gemini-1.5-pro (Highly complex reasoning)</option>
                </select>
              </div>

              {/* Text-to-Speech Voice Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted flex items-center space-x-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-brand-secondary" />
                  <span>Read Aloud Voice</span>
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="w-full bg-[#0A0A0F]/60 border border-brand-border rounded-xl py-2 px-3 text-sm text-brand-text outline-none focus:border-brand-primary/50 cursor-pointer"
                >
                  {voices.length === 0 ? (
                    <option value="">No English system voices detected (using default)</option>
                  ) : (
                    voices.map((v) => (
                      <option key={v.name} value={v.name} className="bg-brand-card">
                        {v.name} ({v.lang})
                      </option>
                    ))
                  )}
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

              {/* Visual Theming (Feature 8) */}
              <div className="pt-4 border-t border-brand-border/40 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted block">
                    Accent Color
                  </label>
                  <div className="flex items-center space-x-3">
                    {[
                      { id: 'violet', hex: '#6C63FF' },
                      { id: 'emerald', hex: '#10B981' },
                      { id: 'blue', hex: '#3B82F6' },
                      { id: 'rose', hex: '#F43F5E' },
                      { id: 'amber', hex: '#F59E0B' }
                    ].map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setLocalSettings(prev => ({ ...prev, accentColor: color.id }))}
                        className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                          (localSettings.accentColor || 'violet') === color.id 
                            ? 'border-white scale-110 shadow-glow' 
                            : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.id.charAt(0).toUpperCase() + color.id.slice(1)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted block">
                    Typography
                  </label>
                  <select
                    value={localSettings.fontFamily || 'inter'}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full bg-[#0A0A0F]/60 border border-brand-border rounded-xl py-2 px-3 text-sm text-brand-text outline-none focus:border-brand-primary/50 cursor-pointer"
                  >
                    <option value="inter" className="bg-brand-card font-sans">Inter (Modern & Clean)</option>
                    <option value="outfit" className="bg-brand-card font-sans" style={{ fontFamily: 'Outfit' }}>Outfit (Geometric & Round)</option>
                    <option value="roboto" className="bg-brand-card font-sans" style={{ fontFamily: 'Roboto' }}>Roboto (Classic & Readable)</option>
                    <option value="fira-code" className="bg-brand-card font-mono" style={{ fontFamily: 'Fira Code' }}>Fira Code (Developer / Monospace)</option>
                  </select>
                </div>
              </div>

              {/* Quick actions inside settings */}
              <div className="flex items-center space-x-2 pt-2 border-t border-brand-border/40 text-xs">
                {hasMessages && (
                  <button
                    onClick={onExport}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border border-brand-border hover:bg-brand-border/40 text-brand-text transition-colors"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    <span>Export Active Chat</span>
                  </button>
                )}
                <button
                  onClick={handleReset}
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
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-border/40 text-brand-text transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-accent text-white shadow-glow hover:opacity-95 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Save Configuration
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default SettingsModal;
