import {
  PrismaClient,
  Property,
  PropertyStatus,
  PropertyType,
} from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Create Property
export async function createProperty(data: {
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
  agentId: number;
}): Promise<Property> {
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
        connect: { id: data.agentId },
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
  agentId: number;
} {
  return {
    ...property,
    amenities: property.amenities.split(","),
    coordinates: property.coordinates.split(",").map(Number),
  };
}
