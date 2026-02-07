import { getApps } from 'firebase/app';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  getAuth,
  type Auth,
  type User,
} from 'firebase/auth';
import type { AuthUser } from '../types/auth';

type AuthGlobals = {
  buildBloxFirebaseAuth?: Auth;
  frameworkFirebaseAuth?: Auth;
  firebaseAuth?: Auth;
};

const getInjectedAuth = (): Auth | null => {
  const globals = globalThis as typeof globalThis & AuthGlobals;
  return globals.buildBloxFirebaseAuth ?? globals.frameworkFirebaseAuth ?? globals.firebaseAuth ?? null;
};

const resolveAuth = (): Auth => {
  const injected = getInjectedAuth();
  if (injected) {
    return injected;
  }

  if (getApps().length === 0) {
    throw new Error('Firebase is not initialized. Provide an auth instance before logging in.');
  }

  return getAuth();
};

const toAuthUser = (user: User): AuthUser => {
  return {
    uid: user.uid,
    email: user.email ?? undefined,
    displayName: user.displayName ?? undefined,
    photoURL: user.photoURL ?? undefined,
    providerId: user.providerData?.[0]?.providerId ?? user.providerId,
  };
};

export const loginWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  const result = await signInWithEmailAndPassword(resolveAuth(), email, password);
  return toAuthUser(result.user);
};

export const signupWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  const result = await createUserWithEmailAndPassword(resolveAuth(), email, password);
  return toAuthUser(result.user);
};

export const loginWithGoogle = async (): Promise<AuthUser> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(resolveAuth(), provider);
  return toAuthUser(result.user);
};

export const logout = async (): Promise<void> => {
  await signOut(resolveAuth());
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(resolveAuth(), email);
};
