export interface Message {
  role: 'user' | 'model';
  content: string;
}

export type PersonaType = 'default' | 'code' | 'creative' | 'analyst';

export interface ChatRequest {
  message: string;
  conversationHistory: Message[];
  persona: PersonaType;
  model: string;
  temperature: number;
  maxTokens?: number;
  apiKey?: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  tokensUsed?: number;
  conversationId?: string;
}

export interface HealthResponse {
  status: string;
  uptime: number;
  version: string;
  timestamp: string;
}
