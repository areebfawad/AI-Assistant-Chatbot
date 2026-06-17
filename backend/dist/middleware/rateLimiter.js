"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.chatRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 requests per minute
    message: {
        success: false,
        error: 'Too many chat requests from this IP. Please try again in a minute.'
    },
    standardHeaders: true, // Return rate limit info in standard headers
    legacyHeaders: false, // Disable the legacy headers
});
