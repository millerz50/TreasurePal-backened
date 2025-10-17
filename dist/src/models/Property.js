import mongoose, { Schema } from "mongoose";
const PropertySchema = new Schema({
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
            validator: (arr) => arr.length === 2,
            message: "Coordinates must be an array of [lat, lng]",
        },
        required: true,
    },
    viewsThisWeek: { type: Number, default: 0 },
}, { timestamps: true });
// Virtual 'id' from '_id'
PropertySchema.virtual("id").get(function () {
    return this._id.toHexString();
});
PropertySchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        const r = ret;
        delete r._id;
    },
});
export const PropertyModel = mongoose.models.Property ||
    mongoose.model("Property", PropertySchema);
