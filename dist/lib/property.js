"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProperty = createProperty;
exports.formatProperty = formatProperty;
const node_appwrite_1 = require("node-appwrite");
const client = new node_appwrite_1.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new node_appwrite_1.Databases(client);
const DB_ID = "main-db";
const PROPERTIES_COLLECTION = "properties";
async function createProperty(data) {
    const property = await databases.createDocument(DB_ID, PROPERTIES_COLLECTION, node_appwrite_1.ID.unique(), {
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
        agentId: data.agentId,
        viewsThisWeek: 0,
    });
    return property;
}
function formatProperty(property) {
    return {
        id: property.$id,
        title: property.title,
        description: property.description,
        price: property.price,
        type: property.type,
        status: property.status,
        location: property.location,
        address: property.address,
        rooms: property.rooms,
        amenities: property.amenities?.split(",") ?? [],
        coordinates: property.coordinates?.split(",").map(Number) ?? [0, 0],
        viewsThisWeek: property.viewsThisWeek ?? 0,
        createdAt: new Date(property.$createdAt),
        updatedAt: new Date(property.$updatedAt),
        agentId: property.agentId,
    };
}
