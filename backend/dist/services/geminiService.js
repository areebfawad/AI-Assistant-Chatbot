"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
// System prompts for each AI Persona
const PERSONA_PROMPTS = {
    default: 'You are NexusAI, a helpful, intelligent, and concise AI assistant.',
    code: 'You are NexusAI Code Helper. You specialize in programming. Always provide clean, well-commented code examples. Explain code step by step. Use markdown formatting for code blocks.',
    creative: 'You are NexusAI Creative Writer. You help with storytelling, creative writing, poetry, and content creation. Be imaginative and expressive.',
    analyst: 'You are NexusAI Data Analyst. You specialize in data analysis, statistics, and insights. Use clear explanations with examples, data tables, and structured summaries.'
};
/**
 * Service to handle Google Gemini API requests
 */
class GeminiService {
    static getApiKey(customApiKey) {
        const key = customApiKey || process.env.GEMINI_API_KEY;
        if (!key) {
            const error = new Error('API Key is missing. Please provide a Gemini API Key in your request headers/body or configure it on the server.');
            error.statusCode = 401;
            throw error;
        }
        return key;
    }
    /**
     * Generates a response from Gemini model with multi-turn history and system instructions
     */
    static async generateChatResponse(params) {
        const { message, history, persona, model, temperature, maxTokens, customApiKey } = params;
        const apiKey = this.getApiKey(customApiKey);
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const systemInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.default;
        try {
            // Initialize model with optional configurations
            const geminiModel = genAI.getGenerativeModel({
                model: model || 'gemini-1.5-flash',
                systemInstruction: systemInstruction,
            });
            // Format history into structure expected by Gemini SDK
            // Each turn has role: 'user' | 'model' and parts: [{ text: string }]
            const geminiHistory = history.map((msg) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            }));
            // Initialize chat session
            const chatSession = geminiModel.startChat({
                history: geminiHistory,
                generationConfig: {
                    temperature: temperature ?? 0.7,
                    ...(maxTokens && { maxOutputTokens: maxTokens }),
                },
            });
            // Send the latest user message
            const result = await chatSession.sendMessage(message);
            const responseText = result.response.text();
            // Extract token usage if available from metadata
            const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;
            return {
                response: responseText,
                tokensUsed,
            };
        }
        catch (error) {
            console.error('[GeminiService Error]:', error);
            // Handle known API issues
            const apiError = new Error(error.message || 'Error occurred while communicating with Gemini API.');
            apiError.statusCode = error.status || 500;
            // Specialize unauthorized error message
            if (error.status === 403 || error.status === 401 || error.message?.includes('API key')) {
                apiError.statusCode = 401;
                apiError.message = 'Invalid or unauthorized Google Gemini API Key. Please verify your settings.';
            }
            throw apiError;
        }
    }
}
exports.GeminiService = GeminiService;
