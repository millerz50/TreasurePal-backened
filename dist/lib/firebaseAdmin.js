"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = void 0;
const app_1 = require("firebase-admin/app");
const storage_1 = require("firebase-admin/storage");
if (!(0, app_1.getApps)().length) {
    (0, app_1.initializeApp)({
        credential: (0, app_1.cert)({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        storageBucket: "treasurepal-5a1e4.appspot.com",
    });
}
exports.bucket = (0, storage_1.getStorage)().bucket();
