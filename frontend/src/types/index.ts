export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export type PersonaType = 'default' | 'code' | 'creative' | 'analyst';

export interface Persona {
  id: PersonaType;
  name: string;
  description: string;
  avatar: string;
  systemPrompt: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  persona: PersonaType;
}

export interface Settings {
  apiKey: string;
  model: 'gemini-1.5-flash' | 'gemini-1.5-pro' | string;
  maxTokens: number;
  temperature: number;
}

export type ThemeMode = 'dark' | 'light';
