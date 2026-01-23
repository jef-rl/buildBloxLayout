import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

export { signInWithEmailAndPassword } from "firebase/auth";

// Firebase configuration from environment variables
// Get these from Firebase Console → Project settings → General → Your apps → Firebase SDK snippet (Config)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

/**
 * Validate Firebase configuration
 * Checks if all required environment variables are set
 */
const validateFirebaseConfig = (): boolean => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

  if (missingFields.length > 0) {
    console.error('❌ Firebase configuration incomplete. Missing fields:', missingFields);
    console.error('Please check your .env file and ensure all VITE_FIREBASE_* variables are set.');
    return false;
  }

  console.log('✓ Firebase configuration validated');
  return true;
};

// Validate and initialize Firebase
if (!validateFirebaseConfig()) {
  throw new Error('Firebase configuration is invalid. Check console for details.');
}

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth: Auth = getAuth(firebaseApp);

console.log('✓ Firebase initialized successfully');
console.log('  • Project ID:', firebaseConfig.projectId);
console.log('  • Auth Domain:', firebaseConfig.authDomain);
