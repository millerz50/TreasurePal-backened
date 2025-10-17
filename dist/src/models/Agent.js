import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
const agentSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    surname: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /^\S+@\S+\.\S+$/,
    },
    nationalId: { type: String, required: true, trim: true },
    userId: { type: String, required: true, unique: true },
    role: { type: String, default: "agent" },
    status: {
        type: String,
        enum: ["Verified", "Not Verified"],
        default: "Not Verified",
    },
    imageUrl: { type: String },
    emailVerified: { type: Boolean, default: false },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false, // 🔒 Prevent password from being returned by default
    },
}, { timestamps: true });
// ✅ Hash password before saving
agentSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
// ✅ Method to compare passwords
agentSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};
// ✅ Reuse model if already compiled
export default mongoose.models.Agent ||
    mongoose.model("Agent", agentSchema);
