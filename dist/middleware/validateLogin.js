"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = void 0;
const joi_1 = __importDefault(require("joi"));
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }
    next();
};
exports.validateLogin = validateLogin;
