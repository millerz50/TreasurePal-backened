import { Client, Databases, ID } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DB_ID = "main-db";
const PROPERTIES_COLLECTION = "properties";

export interface CreatePropertyInput {
  title: string;
  description?: string;
  price: string;
  type: string; // PropertyType as string
  status: string; // PropertyStatus as string
  location: string;
  address: string;
  rooms?: number;
  amenities?: string[];
  coordinates: [number, number];
  agentId: string;
}

export async function createProperty(data: CreatePropertyInput) {
  const property = await databases.createDocument(
    DB_ID,
    PROPERTIES_COLLECTION,
    ID.unique(),
    {
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
    }
  );

  return property;
}

export function formatProperty(property: any) {
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
