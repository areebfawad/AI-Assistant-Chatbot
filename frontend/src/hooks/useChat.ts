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
  model: 'gemini-2.5-flash',
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

  // Migrate old or invalid models in local storage cache
  useEffect(() => {
    if (settings.model && (settings.model.includes('2.5') || settings.model.includes('3.5'))) {
      setSettings(prev => ({ ...prev, model: 'gemini-1.5-flash' }));
    }
  }, [settings.model, setSettings]);

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
      return { id: newId, prompt: initialPrompt };
    }
    return { id: newId };
  }, [setConversations, setActiveConversationId, setSelectedPersona]);

  // Send message
  const sendMessage = useCallback(async (
    content: string,
    overrideChatId?: string,
    imageFile?: File | null,
    imageBase64?: string | null
  ) => {
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
      timestamp: Date.now(),
      imageUrl: imageBase64 || undefined
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

      // Feature 10: Smart Replies Prompt Injection
      const SMART_REPLY_INSTRUCTION = `\n\n[SYSTEM INSTRUCTION: Please provide 3 short, predictive follow-up questions the user might ask next based on your response. Output them at the VERY END of your response EXACTLY in this format: <suggested_replies>["Question 1", "Question 2", "Question 3"]</suggested_replies>]`;

      let response;

      if (imageFile) {
        // Handle Vision API (multipart/form-data)
        const formData = new FormData();
        formData.append('message', (userMsg.content || 'Analyze this image') + SMART_REPLY_INSTRUCTION);
        formData.append('conversationHistory', JSON.stringify(conversationHistory));
        formData.append('persona', currentChat.persona);
        formData.append('model', settings.model);
        formData.append('temperature', settings.temperature.toString());
        formData.append('image', imageFile);

        if (settings.apiKey.trim()) {
          formData.append('apiKey', settings.apiKey.trim());
        }

        response = await axios.post(`${API_BASE_URL}/api/chat/vision`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Handle Standard Text API (application/json)
        response = await axios.post(`${API_BASE_URL}/api/chat`, {
          message: userMsg.content + SMART_REPLY_INSTRUCTION,
          conversationHistory,
          persona: currentChat.persona,
          model: settings.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens > 0 ? settings.maxTokens : undefined,
          apiKey: settings.apiKey.trim() || undefined
        });
      }

      if (response.data && response.data.success) {
        let rawContent = response.data.response;
        let suggestedReplies: string[] | undefined = undefined;
        
        try {
          const match = rawContent.match(/<suggested_replies>(.*?)<\/suggested_replies>/s);
          if (match) {
            suggestedReplies = JSON.parse(match[1]);
            rawContent = rawContent.replace(match[0], '').trim();
          }
        } catch (e) {
          console.error("Failed to parse suggested replies", e);
        }

        const assistantMsg: Message = {
          id: generateId(),
          role: 'model',
          content: rawContent,
          timestamp: Date.now(),
          suggestedReplies
        };

        // Determine title (auto update if it is the first user message)
        const isFirstMessage = currentChat.messages.length === 0;
        const finalTitle = isFirstMessage 
          ? getAutoTitle(content || 'Image Upload') 
          : currentChat.title;

        const finalChat: Conversation = {
          ...updatedChat,
          title: finalTitle,
          messages: [...updatedMessages, assistantMsg],
          timestamp: Date.now()
        };

        setConversations(prev => {
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

  // FEATURE 3 handlers

  // Toggle Pin/Unpin on a message
  const togglePinMessage = useCallback((conversationId: string, messageId: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        const isCurrentlyPinned = c.messages.find(m => m.id === messageId)?.isPinned;
        toast.success(isCurrentlyPinned ? 'Message unpinned.' : 'Message pinned.');
        return {
          ...c,
          messages: c.messages.map(m => m.id === messageId ? { ...m, isPinned: !m.isPinned } : m)
        };
      }
      return c;
    }));
  }, [setConversations]);

  // Thumbs Up/Down rating for AI answers
  const rateMessage = useCallback((conversationId: string, messageId: string, rating: -1 | 0 | 1) => {
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === messageId) {
              const currentRating = m.rating === rating ? 0 : rating;
              if (currentRating === 1) toast.success('Feedback recorded: Helpful response!', { id: 'feedback-ok' });
              if (currentRating === -1) toast.success('Feedback recorded: Unhelpful response.', { id: 'feedback-bad' });
              return { ...m, rating: currentRating };
            }
            return m;
          })
        };
      }
      return c;
    }));
  }, [setConversations]);

  // Delete message from conversation history
  const deleteMessage = useCallback((conversationId: string, messageId: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        toast.success('Message deleted.');
        return {
          ...c,
          messages: c.messages.filter(m => m.id !== messageId)
        };
      }
      return c;
    }));
  }, [setConversations]);

  // Edit user message and resend from that point (history branches)
  const editMessage = useCallback(async (conversationId: string, messageId: string, newContent: string) => {
    const chat = conversations.find(c => c.id === conversationId);
    if (!chat) return;

    const msgIndex = chat.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    // Keep preceding history, modify the user message, and discard later diverged messages
    const truncatedHistory = chat.messages.slice(0, msgIndex);
    const editedMsg: Message = {
      ...chat.messages[msgIndex],
      content: newContent.trim(),
      timestamp: Date.now()
    };

    const updatedChat = {
      ...chat,
      messages: [...truncatedHistory, editedMsg],
      timestamp: Date.now()
    };

    setConversations(prev => prev.map(c => c.id === conversationId ? updatedChat : c));
    setActiveConversationId(conversationId);
    setIsLoading(true);

    try {
      const conversationHistory = truncatedHistory.map(m => ({ role: m.role, content: m.content }));
      
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: editedMsg.content,
        conversationHistory,
        persona: chat.persona,
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

        const finalChat = {
          ...updatedChat,
          messages: [...updatedChat.messages, assistantMsg],
          timestamp: Date.now()
        };

        setConversations(prev => prev.map(c => c.id === conversationId ? finalChat : c));
      } else {
        throw new Error(response.data.error || 'Failed to generate response');
      }
    } catch (error: any) {
      console.error('[editMessage Error]:', error);
      toast.error(error.response?.data?.error || error.message || 'Error updating message.');
    } finally {
      setIsLoading(false);
    }
  }, [conversations, settings, setActiveConversationId, setConversations]);

  // Resend user prompt to regenerate AI response
  const regenerateMessage = useCallback(async (conversationId: string, messageId: string) => {
    const chat = conversations.find(c => c.id === conversationId);
    if (!chat) return;

    const aiMsgIndex = chat.messages.findIndex(m => m.id === messageId);
    if (aiMsgIndex === -1) return;

    const userMsgIndex = aiMsgIndex - 1;
    if (userMsgIndex < 0 || chat.messages[userMsgIndex].role !== 'user') {
      toast.error('Preceding user message not found to regenerate.');
      return;
    }

    const userPrompt = chat.messages[userMsgIndex].content;
    const truncatedHistory = chat.messages.slice(0, userMsgIndex);

    const updatedChat = {
      ...chat,
      messages: [...truncatedHistory, chat.messages[userMsgIndex]],
      timestamp: Date.now()
    };

    setConversations(prev => prev.map(c => c.id === conversationId ? updatedChat : c));
    setActiveConversationId(conversationId);
    setIsLoading(true);

    try {
      const conversationHistory = truncatedHistory.map(m => ({ role: m.role, content: m.content }));
      
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: userPrompt,
        conversationHistory,
        persona: chat.persona,
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

        const finalChat = {
          ...updatedChat,
          messages: [...updatedChat.messages, assistantMsg],
          timestamp: Date.now()
        };

        setConversations(prev => prev.map(c => c.id === conversationId ? finalChat : c));
      } else {
        throw new Error(response.data.error || 'Failed to regenerate response');
      }
    } catch (error: any) {
      console.error('[regenerateMessage Error]:', error);
      toast.error(error.response?.data?.error || error.message || 'Error regenerating response.');
    } finally {
      setIsLoading(false);
    }
  }, [conversations, settings, setActiveConversationId, setConversations]);

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
    setConversations,
    // FEATURE 3 Exports
    togglePinMessage,
    rateMessage,
    deleteMessage,
    editMessage,
    regenerateMessage
  };
};
export default useChat;
