import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
console.log("✅ Firebase project ID:", process.env.FIREBASE_PROJECT_ID);
console.log("✅ Firebase client email:", process.env.FIREBASE_CLIENT_EMAIL);
console.log(
  "✅ Firebase private key starts with:",
  process.env.FIREBASE_PRIVATE_KEY?.slice(0, 30)
);
console.log("✅ Firebase bucket:", process.env.FIREBASE_STORAGE_BUCKET);

export const bucket = admin.storage().bucket();
