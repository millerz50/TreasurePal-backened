import {
  PrismaClient,
  Property,
  PropertyStatus,
  PropertyType,
} from "@prisma/client";

const prisma = new PrismaClient();

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
        connect: { agentId: data.agentId }, // ✅ Only works if agentId is unique and referenced
      },
    },
  });

  return property;
}

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
    viewsThisWeek: property.viewsThisWeek,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    agentId: property.agentId,
  };
}
