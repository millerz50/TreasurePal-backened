"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = void 0;
// lib/firebaseAdmin.ts
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const path_1 = __importDefault(require("path"));
const serviceAccount = require(path_1.default.resolve("serviceAccountKey.json"));
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
        storageBucket: "treasurepal-5a1e4.appspot.com", // ✅ must match Firebase Console
    });
}
exports.bucket = firebase_admin_1.default.storage().bucket();
