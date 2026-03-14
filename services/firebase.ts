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
  apiKey: "AIzaSyCw56hlvRySFKr-9H2MevoiIelne_7pfE4",
  authDomain: "epigemcli.firebaseapp.com",
  projectId: "epigemcli",
  storageBucket: "epigemcli.firebasestorage.app",
  messagingSenderId: "945224212983",
  appId: "1:945224212983:web:ae8f46cba742af78a74ef2"
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
