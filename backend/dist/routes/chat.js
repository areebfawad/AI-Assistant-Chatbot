"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const geminiService_1 = require("../services/geminiService");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
const serverStartTime = Date.now();
// Health Check Endpoint
router.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        uptime: Math.floor((Date.now() - serverStartTime) / 1000),
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
// Chat Endpoint with Rate Limiting
router.post('/chat', rateLimiter_1.chatRateLimiter, async (req, res, next) => {
    try {
        const { message, conversationHistory = [], persona = 'default', model = 'gemini-2.5-flash', temperature = 0.7, maxTokens, apiKey } = req.body;
        // Validation
        if (!message || typeof message !== 'string') {
            res.status(400).json({
                success: false,
                error: "Validation failed: 'message' is a required string."
            });
            return;
        }
        if (!Array.isArray(conversationHistory)) {
            res.status(400).json({
                success: false,
                error: "Validation failed: 'conversationHistory' must be an array of messages."
            });
            return;
        }
        // Generate response from Gemini API via GeminiService
        const result = await geminiService_1.GeminiService.generateChatResponse({
            message,
            history: conversationHistory,
            persona,
            model,
            temperature,
            maxTokens,
            customApiKey: apiKey
        });
        // Send successful response containing uuid conversation ID if not already tracked
        res.status(200).json({
            success: true,
            response: result.response,
            tokensUsed: result.tokensUsed,
            conversationId: (0, uuid_1.v4)()
        });
        return;
    }
    catch (error) {
        next(error);
        return;
    }
});
exports.default = router;
