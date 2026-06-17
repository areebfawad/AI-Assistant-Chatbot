import rateLimit from 'express-rate-limit';

export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per minute
  message: {
    success: false,
    error: 'Too many chat requests from this IP. Please try again in a minute.'
  },
  standardHeaders: true, // Return rate limit info in standard headers
  legacyHeaders: false, // Disable the legacy headers
});
