"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
// lib/firebase.ts
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
const firebaseConfig = {
    apiKey: "AIzaSyCCx4dXBxCmMKt3J_u6ZnDyDDdnsymNbwI",
    authDomain: "treasurepal-5a1e4.firebaseapp.com",
    projectId: "treasurepal-5a1e4",
    storageBucket: "treasurepal-5a1e4.firebasestorage.app",
    messagingSenderId: "1081098285699",
    appId: "1:1081098285699:web:2c148e170bd073011ba1b6",
    measurementId: "G-BSKBPWXBVH",
};
const app = (0, app_1.initializeApp)(firebaseConfig);
exports.storage = (0, storage_1.getStorage)(app);
