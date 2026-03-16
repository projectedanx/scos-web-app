import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// --- FIREBASE CONFIGURATION ---
// 1. Go to console.firebase.google.com
// 2. Create a project -> Add Web App
// 3. Enable Authentication (Google Provider)
// 4. Enable Firestore Database (Start in Test Mode)
// 5. Paste the config object below.

const firebaseConfig = {
  apiKey: "AIzaSyDiB9Hjsr5HWj4Hgmi5cmAmX4w3S6sH56I",
  authDomain: "scos-17fbf.firebaseapp.com",
  projectId: "scos-17fbf",
  storageBucket: "scos-17fbf.firebasestorage.app",
  messagingSenderId: "219202106059",
  appId: "1:219202106059:web:9e7b52b98d821b7cbea14e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Helper to check if config is missing (Offline Mode)
export const isFirebaseConfigured = () => {
  // Checks if the API Key has been changed from the default placeholder
  return firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("AIzaSy...");
};
