"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenAndAuthorization = void 0;
const verifyTokenAndAuthorization = (req, res, next) => {
    const agent = req.agent;
    const requestedId = req.params.id;
    if (!agent || agent.agentId !== requestedId) {
        return res.status(403).json({ error: "Not authorized" });
    }
    next();
};
exports.verifyTokenAndAuthorization = verifyTokenAndAuthorization;
