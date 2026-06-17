import React, { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Conversation } from '../types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { WelcomeScreen } from './WelcomeScreen';
import { SmartReplies } from './SmartReplies';

interface ChatWindowProps {
  activeConversation: Conversation | null;
  isLoading: boolean;
  onSelectPrompt: (prompt: string) => void;
  // Feature 1 additions
  speakingMessageId: string | null;
  speakingCharIndex: number;
  onSpeak: (messageId: string, text: string) => void;
  // Feature 2 additions
  onImageClick?: (url: string) => void;
  // Feature 3 additions
  onPinToggle: (conversationId: string, messageId: string) => void;
  onRate: (conversationId: string, messageId: string, rating: -1 | 0 | 1) => void;
  onDelete: (conversationId: string, messageId: string) => void;
  onEdit: (conversationId: string, messageId: string, newContent: string) => void;
  onRegenerate: (conversationId: string, messageId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  activeConversation,
  isLoading,
  onSelectPrompt,
  speakingMessageId,
  speakingCharIndex,
  onSpeak,
  onImageClick,
  onPinToggle,
  onRate,
  onDelete,
  onEdit,
  onRegenerate
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
              <MessageBubble
                key={message.id}
                message={message}
                speakingMessageId={speakingMessageId}
                speakingCharIndex={speakingCharIndex}
                onSpeak={onSpeak}
                onImageClick={onImageClick}
                conversationId={activeConversation.id}
                onPinToggle={onPinToggle}
                onRate={onRate}
                onDelete={onDelete}
                onEdit={onEdit}
                onRegenerate={onRegenerate}
              />
            ))}
          </AnimatePresence>

          {/* Feature 10: Smart Replies */}
          {hasMessages && 
           !isLoading &&
           activeConversation.messages[activeConversation.messages.length - 1].role === 'model' && 
           activeConversation.messages[activeConversation.messages.length - 1].suggestedReplies && (
             <SmartReplies 
               replies={activeConversation.messages[activeConversation.messages.length - 1].suggestedReplies!} 
               onSelect={onSelectPrompt} 
             />
          )}

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
