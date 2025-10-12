export interface Property {
  id: string;
  title: string;
  description?: string;
  price: string;
  type: string;
  status: string;
  location: string;
  address: string;
  rooms?: number;
  amenities?: string[];
  coordinates: [number, number];
  viewsThisWeek?: number;
  agentId: string; // ✅ Link to Agent
}
