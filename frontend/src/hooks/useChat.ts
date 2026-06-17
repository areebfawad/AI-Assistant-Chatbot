import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocalStorage } from './useLocalStorage';
import { Conversation, Message, PersonaType, Settings } from '../types';
import { getAutoTitle, generateConversationExport } from '../utils/formatMessage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const generateId = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  model: 'gemini-1.5-flash',
  maxTokens: 2048,
  temperature: 0.7,
};

export const useChat = () => {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('nexus_conversations', []);
  const [activeConversationId, setActiveConversationId] = useLocalStorage<string | null>('nexus_active_id', null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('default');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [settings, setSettings] = useLocalStorage<Settings>('nexus_settings', DEFAULT_SETTINGS);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  // Create new conversation
  const createNewChat = useCallback((initialPrompt?: string, persona: PersonaType = 'default') => {
    const newId = generateId();
    const newChat: Conversation = {
      id: newId,
      title: 'New Chat',
      messages: [],
      timestamp: Date.now(),
      persona: persona
    };

    setConversations(prev => [newChat, ...prev]);
    setActiveConversationId(newId);
    setSelectedPersona(persona);

    if (initialPrompt) {
      // We will handle sending the initial prompt by returning the new ID 
      // so the caller can trigger sendMessage on that chat ID
      return { id: newId, prompt: initialPrompt };
    }
    return { id: newId };
  }, [setConversations, setActiveConversationId, setSelectedPersona]);

  // Send message
  const sendMessage = useCallback(async (content: string, overrideChatId?: string) => {
    const targetChatId = overrideChatId || activeConversationId;
    let currentChat = conversations.find(c => c.id === targetChatId);

    // If there is no active chat, create one
    if (!currentChat) {
      const { id } = createNewChat(undefined, selectedPersona);
      currentChat = {
        id,
        title: 'New Chat',
        messages: [],
        timestamp: Date.now(),
        persona: selectedPersona
      };
    }

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    };

    // Update conversation local state with User message immediately
    const updatedMessages = [...currentChat.messages, userMsg];
    const updatedChat = {
      ...currentChat,
      messages: updatedMessages,
      timestamp: Date.now()
    };

    setConversations(prev => prev.map(c => c.id === updatedChat.id ? updatedChat : c));
    setIsLoading(true);

    try {
      // Map frontend messages into the clean backend format
      const conversationHistory = currentChat.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Make API Request to backend
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: userMsg.content,
        conversationHistory,
        persona: currentChat.persona,
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens > 0 ? settings.maxTokens : undefined,
        apiKey: settings.apiKey.trim() || undefined
      });

      if (response.data && response.data.success) {
        const assistantMsg: Message = {
          id: generateId(),
          role: 'model',
          content: response.data.response,
          timestamp: Date.now()
        };

        // Determine title (auto update if it is the first user message)
        const isFirstMessage = currentChat.messages.length === 0;
        const finalTitle = isFirstMessage ? getAutoTitle(content) : currentChat.title;

        const finalChat: Conversation = {
          ...updatedChat,
          title: finalTitle,
          messages: [...updatedMessages, assistantMsg],
          timestamp: Date.now()
        };

        setConversations(prev => {
          // Put the active conversation at the top of the sidebar list
          const filtered = prev.filter(c => c.id !== finalChat.id);
          return [finalChat, ...filtered];
        });
      } else {
        throw new Error(response.data.error || 'Failed to generate response');
      }
    } catch (error: any) {
      console.error('[sendMessage Error]:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error connecting to the NexusAI Server.';
      toast.error(errorMsg, { duration: 5000 });
      
      // Remove the user's message from history if the request failed to keep history clean (optional, but let's keep user prompt but flag error)
      // For premium UI, we keep the user message but don't add the model message.
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, conversations, createNewChat, selectedPersona, settings, setConversations]);

  // Delete conversation
  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    
    if (activeConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
        setSelectedPersona(remaining[0].persona);
      } else {
        setActiveConversationId(null);
      }
    }
    toast.success('Conversation deleted.');
  }, [activeConversationId, conversations, setActiveConversationId, setConversations, setSelectedPersona]);

  // Clear all conversations
  const clearAllConversations = useCallback(() => {
    setConversations([]);
    setActiveConversationId(null);
    toast.success('All conversations cleared.');
  }, [setActiveConversationId, setConversations]);

  // Export conversation as markdown/text
  const exportConversation = useCallback((id: string) => {
    const chat = conversations.find(c => c.id === id);
    if (!chat || chat.messages.length === 0) {
      toast.error('No messages to export.');
      return;
    }

    const fileContent = generateConversationExport(chat.messages, chat.title);
    const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${chat.title.toLowerCase().replace(/\s+/g, '-')}-history.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Chat history exported successfully.');
  }, [conversations]);

  // Update persona for current conversation
  const setConversationPersona = useCallback((id: string, persona: PersonaType) => {
    setConversations(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, persona };
      }
      return c;
    }));
    setSelectedPersona(persona);
  }, [setConversations, setSelectedPersona]);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    selectedPersona,
    isLoading,
    settings,
    setActiveConversationId: (id: string | null) => {
      setActiveConversationId(id);
      if (id) {
        const chat = conversations.find(c => c.id === id);
        if (chat) setSelectedPersona(chat.persona);
      }
    },
    setSelectedPersona: (persona: PersonaType) => {
      setSelectedPersona(persona);
      if (activeConversationId) {
        setConversationPersona(activeConversationId, persona);
      }
    },
    setSettings,
    createNewChat,
    sendMessage,
    deleteConversation,
    clearAllConversations,
    exportConversation,
    setConversations
  };
};
