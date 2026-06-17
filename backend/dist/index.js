"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const chat_1 = __importDefault(require("./routes/chat"));
const vision_1 = __importDefault(require("./routes/vision"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
// Load Environment Variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security Middlewares
app.use((0, helmet_1.default)());
// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            return callback(null, true);
        }
        return callback(new Error('CORS Policy restriction: Origin not allowed.'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
}));
// Body Parser
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// API Routes
app.use('/api', chat_1.default);
app.use('/api', vision_1.default);
// Root Route Redirect/Notice
app.get('/', (_req, res) => {
    res.status(200).json({
        message: 'Welcome to the NexusAI Chatbot Server API',
        endpoints: {
            health: '/api/health',
            chat: '/api/chat (POST)',
            vision: '/api/chat/vision (POST)'
        }
    });
});
// 404 Route handler
app.use((req, _res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});
// Centralized Error Handling Middleware
app.use(errorHandler_1.default);
// Start listening
app.listen(PORT, () => {
    console.log(`[Server]: NexusAI Backend is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
