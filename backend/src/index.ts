import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import chatRouter from './routes/chat';
import errorHandler from './middleware/errorHandler';

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error('CORS Policy restriction: Origin not allowed.'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', chatRouter);

// Root Route Redirect/Notice
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Welcome to the NexusAI Chatbot Server API',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat (POST)'
    }
  });
});

// 404 Route handler
app.use((req, _res, next) => {
  const err: any = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start listening
app.listen(PORT, () => {
  console.log(`[Server]: NexusAI Backend is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
