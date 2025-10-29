"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// src/lib/logger.ts
const winston_1 = __importDefault(require("winston"));
exports.logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })),
    transports: [
        new winston_1.default.transports.Console({ level: "debug" }),
        ...(process.env.NODE_ENV !== "production"
            ? [
                new winston_1.default.transports.File({
                    filename: "logs/error.log",
                    level: "error",
                }),
                new winston_1.default.transports.File({
                    filename: "logs/combined.log",
                }),
            ]
            : []),
    ],
});
