// lib/firebaseAdmin.ts
import admin from "firebase-admin";
import path from "path";

const serviceAccount = require(path.resolve("serviceAccountKey.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "treasurepal-5a1e4.appspot.com", // ✅ must match Firebase Console
  });
}

export const bucket = admin.storage().bucket();
