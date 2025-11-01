"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = void 0;
const joi_1 = __importDefault(require("joi"));
// Define the Joi schema for user validation
const userSchema = joi_1.default.object({
    name: joi_1.default.string().max(100).required(),
    surname: joi_1.default.string().max(100).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().max(100).min(6).required(),
    role: joi_1.default.string().valid("admin", "agent", "user").required(),
    status: joi_1.default.string().max(100).required(),
    dob: joi_1.default.string().isoDate().allow(null, ""),
    occupation: joi_1.default.string().max(100).allow(null, ""),
    nationalId: joi_1.default.string().max(100).allow(null, ""),
    agentCode: joi_1.default.string().max(100).allow(null, ""),
    avatarUrl: joi_1.default.string().uri().allow(null, ""),
    imageUrl: joi_1.default.string().uri().allow(null, ""),
    emailVerified: joi_1.default.boolean().required(),
    blogLikes: joi_1.default.array().items(joi_1.default.string().max(100)).allow(null),
    propertyLikes: joi_1.default.array().items(joi_1.default.string().max(150)).allow(null),
});
// Middleware to validate incoming user data
const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(400).json({
            error: "Validation failed",
            details: error.details.map((detail) => detail.message),
        });
        return;
    }
    next();
};
exports.validateUser = validateUser;
