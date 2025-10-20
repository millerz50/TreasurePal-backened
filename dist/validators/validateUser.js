"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = void 0;
const joi_1 = __importDefault(require("joi"));
const userSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    surname: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    status: joi_1.default.string().required(),
    dob: joi_1.default.date().iso().required(),
    blogLikes: joi_1.default.string().allow(""),
    propertyLikes: joi_1.default.string().allow(""),
});
const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error)
        return res.status(400).json({ error: error.details[0].message });
    next();
};
exports.validateUser = validateUser;
