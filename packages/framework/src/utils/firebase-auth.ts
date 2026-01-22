/**
 * Firebase Authentication Utilities
 * Wrapper functions for Firebase Auth operations with framework integration
 */

import type { Auth } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import type { AuthUser } from '../types/state';

let firebaseAuthInstance: Auth | null = null;
let authStateCallback: ((user: AuthUser | null) => void) | null = null;

/**
 * Configure Firebase Auth instance for framework
 */
export const configureFrameworkAuth = (auth: Auth) => {
  firebaseAuthInstance = auth;

  // Set up auth state listener
  onAuthStateChanged(auth, (user) => {
    const authUser = user ? { uid: user.uid, email: user.email ?? undefined } : null;
    if (authStateCallback) {
      authStateCallback(authUser);
    }
  });
};

/**
 * Register callback for auth state changes
 */
export const onFrameworkAuthStateChange = (
  callback: (user: AuthUser | null) => void
) => {
  authStateCallback = callback;
};

/**
 * Email/Password Login
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  if (!firebaseAuthInstance) throw new Error('Firebase Auth not configured');

  const credential = await signInWithEmailAndPassword(
    firebaseAuthInstance,
    email,
    password
  );
  return {
    uid: credential.user.uid,
    email: credential.user.email ?? undefined,
  };
};

/**
 * Email/Password Signup
 */
export const signupWithEmail = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  if (!firebaseAuthInstance) throw new Error('Firebase Auth not configured');

  const credential = await createUserWithEmailAndPassword(
    firebaseAuthInstance,
    email,
    password
  );
  return {
    uid: credential.user.uid,
    email: credential.user.email ?? undefined,
  };
};

/**
 * Google OAuth Sign-In
 */
export const loginWithGoogle = async (): Promise<AuthUser> => {
  if (!firebaseAuthInstance) throw new Error('Firebase Auth not configured');

  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(firebaseAuthInstance, provider);
  return {
    uid: credential.user.uid,
    email: credential.user.email ?? undefined,
  };
};

/**
 * Password Reset
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  if (!firebaseAuthInstance) throw new Error('Firebase Auth not configured');

  await sendPasswordResetEmail(firebaseAuthInstance, email);
};

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
  if (!firebaseAuthInstance) throw new Error('Firebase Auth not configured');

  await signOut(firebaseAuthInstance);
};
