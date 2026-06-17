import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.2 }}
      className="flex items-start space-x-3 max-w-[80%] mr-auto py-1"
    >
      {/* Bot Icon */}
      <div className="h-8 w-8 shrink-0 rounded-lg bg-brand-border/60 flex items-center justify-center border border-brand-border">
        <Sparkles className="h-4 w-4 text-brand-primary" />
      </div>

      {/* Bubble Container */}
      <div className="bg-brand-card/90 border border-brand-border/60 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center space-x-3">
        {/* Three Animated Bouncing Dots */}
        <div className="flex space-x-1">
          <div className="h-2 w-2 rounded-full bg-brand-primary typing-dot" />
          <div className="h-2 w-2 rounded-full bg-brand-primary typing-dot" />
          <div className="h-2 w-2 rounded-full bg-brand-primary typing-dot" />
        </div>
        
        <span className="text-xs text-brand-muted font-medium select-none">
          NexusAI is thinking...
        </span>
      </div>
    </motion.div>
  );
};
export default TypingIndicator;
