"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUserId = void 0;
exports.createAgent = createAgent;
exports.comparePassword = comparePassword;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
// 🧬 User ID Generator
const generateUserId = () => {
    const prefix = "AG";
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const numericPart = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomPart}-${numericPart}`;
};
exports.generateUserId = generateUserId;
// ✅ Create Agent
async function createAgent(data) {
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    return prisma.agent.create({
        data: {
            ...data,
            password: hashedPassword,
            agentId: (0, exports.generateUserId)(),
        },
    });
}
// ✅ Compare Password
async function comparePassword(candidate, hashed) {
    return bcrypt_1.default.compare(candidate, hashed);
}
