import mongoose, { Document, Model, Schema } from "mongoose";
import { Property } from "../types/property";

// Extend Mongoose Document with your Property type
export interface PropertyDocument
  extends Omit<Property, "id" | "agentId">,
    Document {
  _id: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
}

const PropertySchema = new Schema<PropertyDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: String, required: true },

    type: {
      type: String,
      enum: [
        "Residential",
        "Booking",
        "For Rent",
        "For Sale",
        "Business",
        "Student",
        "Lodges",
        "BookingHouse",
      ],
      required: true,
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },

    status: {
      type: String,
      enum: ["Available", "Booked", "Rented", "Sold", "For Sale", "For Rent"],
      required: true,
    },

    location: { type: String, required: true },
    address: { type: String, required: true },
    rooms: { type: Number, default: 0 },
    amenities: { type: [String], default: [] },

    coordinates: {
      type: [Number],
      validate: {
        validator: (arr: number[]) => arr.length === 2,
        message: "Coordinates must be an array of [lat, lng]",
      },
      required: true,
    },

    viewsThisWeek: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Virtual 'id' from '_id'
PropertySchema.virtual("id").get(function (this: PropertyDocument) {
  return this._id.toHexString();
});

PropertySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const r = ret as unknown as { [key: string]: unknown };
    delete r._id;
  },
});

export const PropertyModel: Model<PropertyDocument> =
  mongoose.models.Property ||
  mongoose.model<PropertyDocument>("Property", PropertySchema);
