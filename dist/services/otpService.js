"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.verifyOtp = verifyOtp;
const otpStore = new Map();
function generateOtp(email) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });
    return otp;
}
function verifyOtp(email, otp) {
    const record = otpStore.get(email);
    if (!record)
        return false;
    if (Date.now() > record.expires) {
        otpStore.delete(email);
        return false;
    }
    const isValid = record.otp === otp;
    if (isValid)
        otpStore.delete(email);
    return isValid;
}
