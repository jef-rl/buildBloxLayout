/**
 * Firebase Authentication Types
 * Defines types for the authentication view and configuration
 */

export type AuthMode = 'login' | 'signup' | 'reset-password' | 'profile';

export type AuthConfig = {
  enableEmailAuth?: boolean;
  enableGoogleAuth?: boolean;
  enablePasswordReset?: boolean;
  enableSignup?: boolean;
  requireEmailVerification?: boolean;
  customDomain?: string;
};

export type AuthViewState = {
  mode: AuthMode;
  loading: boolean;
  error: string | null;
};
