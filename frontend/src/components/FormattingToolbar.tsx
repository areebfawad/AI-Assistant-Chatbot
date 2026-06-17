import React from 'react';
import { Bold, Italic, Code, List, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormattingToolbarProps {
  onFormat: (prefix: string, suffix: string) => void;
  isVisible: boolean;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ onFormat, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          className="absolute -top-12 left-4 flex items-center space-x-1 p-1 bg-brand-card/95 backdrop-blur-md border border-brand-border/60 rounded-xl shadow-glow z-20"
        >
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onFormat('**', '**'); }}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-border/40 transition-colors"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onFormat('*', '*'); }}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-border/40 transition-colors"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-brand-border/60 mx-1" />
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onFormat('`', '`'); }}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-border/40 transition-colors"
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onFormat('- ', ''); }}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-border/40 transition-colors"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onFormat('[', '](url)'); }}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-border/40 transition-colors"
            title="Link"
          >
            <Link className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
