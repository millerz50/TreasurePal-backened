const otpStore = new Map<string, { otp: string; expires: number }>();

export function generateOtp(email: string): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });
  return otp;
}

export function verifyOtp(email: string, otp: string): boolean {
  const record = otpStore.get(email);
  if (!record) return false;
  if (Date.now() > record.expires) {
    otpStore.delete(email);
    return false;
  }
  const isValid = record.otp === otp;
  if (isValid) otpStore.delete(email);
  return isValid;
}
