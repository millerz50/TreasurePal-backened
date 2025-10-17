import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../utils/hashPassword.js";
const prisma = new PrismaClient();
export const signup = async (req, res) => {
    try {
        const user = await prisma.user.create({
            data: {
                ...req.body,
                email: req.body.email.toLowerCase(),
                password: await hashPassword(req.body.password),
            },
        });
        res.status(201).json({ user });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        if (updates.password) {
            updates.password = await hashPassword(updates.password);
        }
        const user = await prisma.user.update({
            where: { id },
            data: updates,
        });
        res.json({ user });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
