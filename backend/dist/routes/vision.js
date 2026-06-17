"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const geminiVisionService_1 = require("../services/geminiVisionService");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Configure multer to store files in memory
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    }
});
router.post('/chat/vision', upload.single('image'), rateLimiter_1.chatRateLimiter, async (req, res, next) => {
    try {
        const file = req.file;
        const { message, conversationHistory: historyStr = '[]', persona = 'default', model = 'gemini-2.5-flash', temperature: tempStr = '0.7', apiKey } = req.body;
        // Validate message query
        if (!message || typeof message !== 'string') {
            res.status(400).json({
                success: false,
                error: "Validation failed: 'message' is a required text field."
            });
            return;
        }
        // Validate file presence
        if (!file) {
            res.status(400).json({
                success: false,
                error: "Validation failed: 'image' file attachment is required."
            });
            return;
        }
        // Validate file types
        const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
        if (!allowedMimes.includes(file.mimetype)) {
            res.status(400).json({
                success: false,
                error: 'Unsupported file format. Only PNG, JPG, JPEG, WEBP, and GIF are allowed.'
            });
            return;
        }
        // Parse history and temperature parameters
        let conversationHistory = [];
        try {
            conversationHistory = JSON.parse(historyStr);
        }
        catch (err) {
            res.status(400).json({
                success: false,
                error: "Invalid JSON format for 'conversationHistory'."
            });
            return;
        }
        const temperature = parseFloat(tempStr) || 0.7;
        // Invoke Gemini Multimodal Service
        const result = await geminiVisionService_1.GeminiVisionService.generateVisionResponse({
            message,
            imageBuffer: file.buffer,
            mimeType: file.mimetype,
            history: conversationHistory,
            persona: persona,
            model,
            temperature,
            customApiKey: apiKey
        });
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
