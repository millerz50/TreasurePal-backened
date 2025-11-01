import { NextFunction, Request, Response } from "express";
import Joi from "joi";

// Define the Joi schema for user validation
const userSchema = Joi.object({
  name: Joi.string().max(100).required(),
  surname: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().max(100).min(6).required(),
  role: Joi.string().valid("admin", "agent", "user").required(),
  status: Joi.string().max(100).required(),
  dob: Joi.string().isoDate().allow(null, ""),
  occupation: Joi.string().max(100).allow(null, ""),
  nationalId: Joi.string().max(100).allow(null, ""),
  agentCode: Joi.string().max(100).allow(null, ""),
  avatarUrl: Joi.string().uri().allow(null, ""),
  imageUrl: Joi.string().uri().allow(null, ""),
  emailVerified: Joi.boolean().required(),
  blogLikes: Joi.array().items(Joi.string().max(100)).allow(null),
  propertyLikes: Joi.array().items(Joi.string().max(150)).allow(null),
});

// Middleware to validate incoming user data
export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
