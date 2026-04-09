import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getFirebaseEnv } from "./envService";

// --- FIREBASE CONFIGURATION ---
// 1. Go to console.firebase.google.com
// 2. Create a project -> Add Web App
// 3. Enable Authentication (Google Provider)
// 4. Enable Firestore Database (Start in Test Mode)
// 5. Paste the config object below via environment variables.

export const firebaseConfig = {
  apiKey: getFirebaseEnv("API_KEY"),
  authDomain: getFirebaseEnv("AUTH_DOMAIN"),
  projectId: getFirebaseEnv("PROJECT_ID"),
  storageBucket: getFirebaseEnv("STORAGE_BUCKET"),
  messagingSenderId: getFirebaseEnv("MESSAGING_SENDER_ID"),
  appId: getFirebaseEnv("APP_ID")
};

// Initialize Firebase
let app;
export let auth: any = null;
export let db: any = null;
export let functions: any = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app);
} catch (e) {
  console.warn("Firebase initialization skipped (offline mode or invalid config):", e);
}

// Helper to check if config is missing (Offline Mode)
/**
 * Checks if FirebaseConfigured.
 * @returns The resulting value.
 */
export const isFirebaseConfigured = () => {
  // Checks if the API Key has been changed from the default placeholder
  return !!firebaseConfig.apiKey && firebaseConfig.apiKey.length > 0 && !firebaseConfig.apiKey.startsWith("AIzaSy...");
};
