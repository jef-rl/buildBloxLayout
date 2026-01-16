import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export { signInWithEmailAndPassword } from "firebase/auth";

// Replace with real Firebase keys from your project settings.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "FIREBASE_API_KEY_HERE",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ??
    "FIREBASE_AUTH_DOMAIN_HERE",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ??
    "FIREBASE_PROJECT_ID_HERE",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
    "FIREBASE_STORAGE_BUCKET_HERE",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ??
    "FIREBASE_MESSAGING_SENDER_ID_HERE",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "FIREBASE_APP_ID_HERE",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
