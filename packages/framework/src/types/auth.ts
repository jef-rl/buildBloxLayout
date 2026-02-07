export type AuthMode = 'login' | 'signup' | 'reset';

export type AuthConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
};

export type AuthUser = {
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  providerId?: string;
  [key: string]: unknown;
};

export type AuthState = {
  enabled: boolean;
  configChecked: boolean;
  currentUser: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: AuthUser | null;
};

export type AuthUiState = {
  loading: boolean;
  error: string | null;
  success: string | null;
  allowSignup: boolean;
  allowGoogleSignIn: boolean;
  allowPasswordReset: boolean;
  oauthProviders: string[];
};
