import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Conversation, Message } from '../types';

export interface GroupedSearchResult {
  conversationId: string;
  conversationTitle: string;
  messages: Message[];
}

/**
 * Custom React hook to manage global conversation searching with debounce and history persistence
 */
export const useSearch = (conversations: Conversation[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<GroupedSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('nexus_recent_searches', []);

  // Debounce the search query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Execute full-text filtering when debounced query updates
  useEffect(() => {
    const query = debouncedQuery.trim().toLowerCase();
    if (!query) {
      setResults([]);
      return;
    }

    const matchedGroups: GroupedSearchResult[] = [];

    conversations.forEach((chat) => {
      const matchingMessages = chat.messages.filter((msg) =>
        msg.content.toLowerCase().includes(query)
      );

      if (matchingMessages.length > 0) {
        matchedGroups.push({
          conversationId: chat.id,
          conversationTitle: chat.title,
          messages: matchingMessages
        });
      }
    });

    setResults(matchedGroups);
  }, [debouncedQuery, conversations]);

  // Save successful query keyword to search history log
  const addRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      // De-duplicate query term
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      // Keep only last 5 items
      return [trimmed, ...filtered].slice(0, 5);
    });
  }, [setRecentSearches]);

  // Clear query history
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, [setRecentSearches]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    results,
    recentSearches,
    addRecentSearch,
    clearRecentSearches
  };
};
export default useSearch;
