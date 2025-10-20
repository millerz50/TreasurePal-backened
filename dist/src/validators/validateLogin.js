import Joi from "joi";
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});
export const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error)
        return res.status(400).json({ error: error.details[0].message });
    next();
};
