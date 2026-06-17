import React, { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Conversation } from '../types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { WelcomeScreen } from './WelcomeScreen';

interface ChatWindowProps {
  activeConversation: Conversation | null;
  isLoading: boolean;
  onSelectPrompt: (prompt: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  activeConversation,
  isLoading,
  onSelectPrompt
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of the chat window on new message or loading state change
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages.length, isLoading]);

  const hasMessages = activeConversation && activeConversation.messages.length > 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 space-y-4 scrollbar-thin bg-gradient-glow bg-no-repeat bg-center">
      {hasMessages ? (
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {activeConversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isLoading && <TypingIndicator />}
          </AnimatePresence>
          
          {/* Scroll anchor */}
          <div ref={bottomRef} className="h-2" />
        </div>
      ) : (
        <WelcomeScreen onSelectPrompt={onSelectPrompt} />
      )}
    </div>
  );
};
export default ChatWindow;
