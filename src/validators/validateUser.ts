import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const userSchema = Joi.object({
  name: Joi.string().required(),
  surname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  status: Joi.string().required(),
  dob: Joi.date().iso().required(),
  blogLikes: Joi.string().allow(""),
  propertyLikes: Joi.string().allow(""),
});

export const validateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
