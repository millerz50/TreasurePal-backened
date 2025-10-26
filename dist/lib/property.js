"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProperty = createProperty;
exports.formatProperty = formatProperty;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createProperty(data) {
    const property = await prisma.property.create({
        data: {
            title: data.title,
            description: data.description || "",
            price: data.price,
            type: data.type,
            status: data.status,
            location: data.location,
            address: data.address,
            rooms: data.rooms ?? 0,
            amenities: (data.amenities || []).join(","),
            coordinates: data.coordinates.join(","),
            agent: {
                connect: { agentId: data.agentId }, // ✅ Only works if agentId is unique and referenced
            },
        },
    });
    return property;
}
function formatProperty(property) {
    return {
        id: property.id,
        title: property.title,
        description: property.description,
        price: property.price,
        type: property.type,
        status: property.status,
        location: property.location,
        address: property.address,
        rooms: property.rooms,
        amenities: property.amenities.split(","),
        coordinates: property.coordinates.split(",").map(Number),
        viewsThisWeek: property.viewsThisWeek,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        agentId: property.agentId,
    };
}
