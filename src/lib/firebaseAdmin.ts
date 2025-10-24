// lib/firebaseAdmin.ts
import admin from "firebase-admin";
import path from "path";

const serviceAccount = require(path.resolve("firebase-key.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "treasurepal-5a1e4.appspot.com",
  });
}

export const bucket = admin.storage().bucket();
