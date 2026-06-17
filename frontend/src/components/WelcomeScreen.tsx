import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Code2, Brain, FileCode, Edit3 } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

interface SuggestionCard {
  text: string;
  icon: React.ReactNode;
  category: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  const suggestions: SuggestionCard[] = [
    {
      text: 'Write a React component for a login form',
      category: 'Code Helper',
      icon: <Code2 className="h-5 w-5 text-indigo-400" />
    },
    {
      text: 'Explain machine learning in simple terms',
      category: 'Explain Concept',
      icon: <Brain className="h-5 w-5 text-purple-400" />
    },
    {
      text: 'Help me debug my JavaScript code',
      category: 'Debugging',
      icon: <FileCode className="h-5 w-5 text-emerald-400" />
    },
    {
      text: 'Write a creative story about AI',
      category: 'Creative Writer',
      icon: <Edit3 className="h-5 w-5 text-cyan-400" />
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto h-full overflow-y-auto scrollbar-thin">
      
      {/* Animated Logo & Glow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mb-6 flex flex-col items-center"
      >
        <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full h-24 w-24 -z-10" />
        <div className="h-16 w-16 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-glow mb-4">
          <Sparkles className="h-8 w-8 text-white animate-pulse" />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight"
        >
          Welcome to{' '}
          <span className="bg-gradient-accent bg-clip-text text-transparent">
            NexusAI
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-3 text-base md:text-lg text-brand-muted max-w-lg"
        >
          A production-grade intelligence suite optimized for coding, creative writing, and data analysis.
        </motion.p>
      </motion.div>

      {/* Suggestion Prompt Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8"
      >
        {suggestions.map((card, idx) => (
          <motion.button
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -4, borderColor: 'rgba(108, 99, 255, 0.4)', backgroundColor: 'rgba(18, 18, 26, 0.9)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectPrompt(card.text)}
            className="flex items-start text-left p-5 rounded-2xl border border-brand-border bg-brand-card/50 shadow-glass transition-all duration-200 focus:outline-none"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-border/40 flex items-center justify-center mr-4">
              {card.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted block mb-1">
                {card.category}
              </span>
              <p className="text-sm font-medium text-brand-text leading-snug">
                {card.text}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 flex items-center justify-center space-x-6 text-xs text-brand-muted/80 border-t border-brand-border/40 pt-4 w-full"
      >
        <span>⚡ Double click to clear history</span>
        <span>•</span>
        <span>🔒 Client-side encrypted state</span>
        <span>•</span>
        <span>🚀 Google Gemini API</span>
      </motion.div>
    </div>
  );
};
export default WelcomeScreen;
