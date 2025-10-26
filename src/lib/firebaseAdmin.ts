import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Resolve path to firebase-key.json in project root
const serviceAccountPath = path.resolve(process.cwd(), "firebase-key.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "treasurepal-5a1e4.appspot.com",
  });
}

// ✅ Export as ESModule for TypeScript compatibility
export const bucket = admin.storage().bucket();
