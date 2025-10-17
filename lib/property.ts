import {
  PrismaClient,
  Property,
  PropertyStatus,
  PropertyType,
} from "@prisma/client";

const prisma = new PrismaClient();

// ✅ TypeScript Interface for Compile-Time Safety
export interface CreatePropertyInput {
  title: string;
  description?: string;
  price: string;
  type: PropertyType;
  status: PropertyStatus;
  location: string;
  address: string;
  rooms?: number;
  amenities?: string[];
  coordinates: [number, number];
  agentId: string;
}

// ✅ Create Property
export async function createProperty(
  data: CreatePropertyInput
): Promise<Property> {
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
        connect: { agentId: data.agentId }, // ✅ Correct relation
      },
    },
  });

  return property;
}

// ✅ Format Property for Output
export function formatProperty(property: Property): {
  id: number;
  title: string;
  description: string;
  price: string;
  type: PropertyType;
  status: PropertyStatus;
  location: string;
  address: string;
  rooms: number;
  amenities: string[];
  coordinates: number[];
  viewsThisWeek: number;
  createdAt: Date;
  updatedAt: Date;
  agentId: string;
} {
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
    viewsThisWeek: 0, // Placeholder—can be replaced with actual logic
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    agentId: property.agentId,
  };
}
