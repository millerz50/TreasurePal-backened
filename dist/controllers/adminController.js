import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const approveBlogPost = async (req, res) => {
    try {
        const { postId, adminId } = req.body;
        const post = await prisma.blogPost.update({
            where: { id: postId },
            data: {
                approvedByAdminId: adminId,
                published: true,
            },
        });
        res.json({ post });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const deleteUser = async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.params.id },
        });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const deleteAgent = async (req, res) => {
    try {
        await prisma.agent.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const deleteProperty = async (req, res) => {
    try {
        await prisma.property.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
