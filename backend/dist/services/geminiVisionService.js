"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiVisionService = void 0;
const generative_ai_1 = require("@google/generative-ai");
// System prompts per AI Persona
const PERSONA_PROMPTS = {
    default: 'You are NexusAI, a helpful, intelligent, and concise AI assistant.',
    code: 'You are NexusAI Code Helper. You specialize in programming. Always provide clean, well-commented code examples. Explain code step by step. Use markdown formatting for code blocks.',
    creative: 'You are NexusAI Creative Writer. You help with storytelling, creative writing, poetry, and content creation. Be imaginative and expressive.',
    analyst: 'You are NexusAI Data Analyst. You specialize in data analysis, statistics, and insights. Use clear explanations with examples, data tables, and structured summaries.'
};
class GeminiVisionService {
    static getApiKey(customApiKey) {
        const key = customApiKey || process.env.GEMINI_API_KEY;
        if (!key) {
            const error = new Error('API Key is missing. Please configure a key in the server configuration or specify it in your request settings.');
            error.statusCode = 401;
            throw error;
        }
        return key;
    }
    /**
     * Generates a text response based on an image buffer, a text query, and conversation history
     */
    static async generateVisionResponse(params) {
        const { message, imageBuffer, mimeType, history, persona, model, temperature, customApiKey } = params;
        const apiKey = this.getApiKey(customApiKey);
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const systemInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.default;
        try {
            // Use gemini-1.5-flash by default as it is the standard vision-capable model
            const geminiModel = genAI.getGenerativeModel({
                model: model || 'gemini-1.5-flash',
                systemInstruction,
            });
            // Format conversation history
            const geminiHistory = history.map((msg) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            }));
            // Initialize chat session with history
            const chatSession = geminiModel.startChat({
                history: geminiHistory,
                generationConfig: {
                    temperature: temperature ?? 0.7,
                },
            });
            // Format image inlineData payload
            const imagePart = {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType,
                },
            };
            // Send both text prompt and image data to Gemini chat session
            const result = await chatSession.sendMessage([
                { text: message },
                imagePart,
            ]);
            const responseText = result.response.text();
            const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;
            return {
                response: responseText,
                tokensUsed,
            };
        }
        catch (error) {
            console.error('[GeminiVisionService Error]:', error);
            const apiError = new Error(error.message || 'Error communicating with Gemini Vision API.');
            apiError.statusCode = error.status || 500;
            if (error.status === 403 || error.status === 401 || error.message?.includes('API key')) {
                apiError.statusCode = 401;
                apiError.message = 'Invalid or unauthorized Google Gemini API Key. Please verify your settings.';
            }
            throw apiError;
        }
    }
}
exports.GeminiVisionService = GeminiVisionService;
exports.default = GeminiVisionService;
