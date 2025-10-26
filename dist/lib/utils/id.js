"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAgentId = void 0;
const generateAgentId = () => {
    const prefix = "AG";
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const numericPart = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomPart}-${numericPart}`;
};
exports.generateAgentId = generateAgentId;
