import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SmartRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
}

export const SmartReplies: React.FC<SmartRepliesProps> = ({ replies, onSelect }) => {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 px-2 md:px-8">
      {replies.map((reply, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4 + index * 0.1, duration: 0.3, type: "spring" }}
          onClick={() => onSelect(reply)}
          className="group flex items-center space-x-2 px-3.5 py-2 text-xs md:text-sm font-medium rounded-full border border-brand-primary/20 bg-brand-card hover:bg-brand-primary/10 hover:border-brand-primary/40 text-brand-text transition-all duration-200 shadow-sm"
          title={reply}
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-primary/70 group-hover:text-brand-primary transition-colors" />
          <span className="truncate max-w-[200px] md:max-w-xs">{reply}</span>
        </motion.button>
      ))}
    </div>
  );
};
