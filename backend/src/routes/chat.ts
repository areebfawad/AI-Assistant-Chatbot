import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GeminiService } from '../services/geminiService';
import { chatRateLimiter } from '../middleware/rateLimiter';
import { ChatRequest } from '../types';

const router = Router();
const serverStartTime = Date.now();

// Health Check Endpoint
router.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'healthy',
    uptime: Math.floor((Date.now() - serverStartTime) / 1000),
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Chat Endpoint with Rate Limiting
router.post('/chat', chatRateLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      message,
      conversationHistory = [],
      persona = 'default',
      model = 'gemini-1.5-flash',
      temperature = 0.7,
      maxTokens,
      apiKey
    } = req.body as ChatRequest;

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
    const result = await GeminiService.generateChatResponse({
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
      conversationId: uuidv4()
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
});

export default router;

