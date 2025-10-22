// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCCx4dXBxCmMKt3J_u6ZnDyDDdnsymNbwI",
  authDomain: "treasurepal-5a1e4.firebaseapp.com",
  projectId: "treasurepal-5a1e4",
  storageBucket: "treasurepal-5a1e4.appspot.com",
  messagingSenderId: "1081098285699",
  appId: "1:1081098285699:web:2c148e170bd073011ba1b6",
  measurementId: "G-BSKBPWXBVH",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
