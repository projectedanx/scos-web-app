import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- FIREBASE CONFIGURATION ---
// 1. Go to console.firebase.google.com
// 2. Create a project -> Add Web App
// 3. Enable Authentication (Google Provider)
// 4. Enable Firestore Database (Start in Test Mode)
// 5. Paste the config object below.

const firebaseConfig = {
  apiKey: "AIzaSyDynJhyt2D1_CzMiVEGjZ-3dd5WVyJA8HA",
  authDomain: "context-locker.firebaseapp.com",
  projectId: "context-locker",
  storageBucket: "context-locker.firebasestorage.app",
  messagingSenderId: "351411713378",
  appId: "1:351411713378:web:0500d3b168bf6fc7fae83b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper to check if config is missing (Offline Mode)
export const isFirebaseConfigured = () => {
  // Checks if the API Key has been changed from the default placeholder
  return firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("AIzaSy...");
};
