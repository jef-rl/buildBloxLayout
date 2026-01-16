import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export { signInWithEmailAndPassword } from "firebase/auth";

// Replace with real Firebase keys from your project settings.
// For real values, add a .env file (or environment variables) with VITE_FIREBASE_* keys.
// Get them from Firebase Console → Project settings → General → Your apps → Firebase SDK snippet (Config).
// These values replace the placeholders below or are injected via import.meta.env at build time.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
