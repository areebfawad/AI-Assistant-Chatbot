import { useMemo } from 'react';
import { Conversation, Message } from '../types';

export interface PinnedMessageItem {
  conversationId: string;
  conversationTitle: string;
  message: Message;
}

/**
 * Custom React hook to aggregate all pinned messages across all local conversations
 */
export const usePinnedMessages = (conversations: Conversation[]) => {
  const pinnedMessages = useMemo(() => {
    const list: PinnedMessageItem[] = [];
    conversations.forEach((chat) => {
      chat.messages.forEach((msg) => {
        if (msg.isPinned) {
          list.push({
            conversationId: chat.id,
            conversationTitle: chat.title,
            message: msg
          });
        }
      });
    });
    // Sort newest first
    return list.sort((a, b) => b.message.timestamp - a.message.timestamp);
  }, [conversations]);

  return pinnedMessages;
};
export default usePinnedMessages;
