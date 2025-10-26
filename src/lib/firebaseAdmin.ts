import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath = path.resolve(process.cwd(), "firebase-key.json");
console.log("🔍 Firebase key path:", serviceAccountPath);

const serviceAccountRaw = fs.readFileSync(serviceAccountPath, "utf8");
console.log("📄 Firebase key loaded:", serviceAccountRaw.length, "characters");

const serviceAccount = JSON.parse(serviceAccountRaw);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "treasurepal-5a1e4.appspot.com",
  });
}

export const bucket = admin.storage().bucket();
