import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export { signInWithEmailAndPassword } from "firebase/auth";

// Replace with real Firebase keys from your project settings.
// For real values, add a .env file (or environment variables) with VITE_FIREBASE_* keys.
// Get them from Firebase Console → Project settings → General → Your apps → Firebase SDK snippet (Config).
// These values replace the placeholders below or are injected via import.meta.env at build time.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyAAGokzPy3GoeebzwbykpXUqmQVZgf0DAI",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ??
    "lozzuck.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ??
    "lozzuck",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
    "lozzuck.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ??
    "1059829133797",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? 
    "1:1059829133797:web:35d339c1c1399c12efff0c",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
