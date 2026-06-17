import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { GeminiVisionService } from '../services/geminiVisionService';
import { chatRateLimiter } from '../middleware/rateLimiter';
import { PersonaType } from '../types';

const router = Router();

// Configure multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  }
});

router.post(
  '/chat/vision',
  upload.single('image'),
  chatRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file;
      const {
        message,
        conversationHistory: historyStr = '[]',
        persona = 'default',
        model = 'gemini-2.5-flash',
        temperature: tempStr = '0.7',
        apiKey
      } = req.body;

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
      } catch (err) {
        res.status(400).json({
          success: false,
          error: "Invalid JSON format for 'conversationHistory'."
        });
        return;
      }

      const temperature = parseFloat(tempStr) || 0.7;

      // Invoke Gemini Multimodal Service
      const result = await GeminiVisionService.generateVisionResponse({
        message,
        imageBuffer: file.buffer,
        mimeType: file.mimetype,
        history: conversationHistory,
        persona: persona as PersonaType,
        model,
        temperature,
        customApiKey: apiKey
      });

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
  }
);

export default router;
