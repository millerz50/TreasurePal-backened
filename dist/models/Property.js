"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PropertySchema = new mongoose_1.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
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
exports.PropertyModel = mongoose_1.default.models.Property ||
    mongoose_1.default.model("Property", PropertySchema);
