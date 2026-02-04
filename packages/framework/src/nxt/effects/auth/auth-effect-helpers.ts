import type { Action } from '../../runtime/actions/action';

export type ActionDispatch = (action: Action<any>) => void;

export const toErrorMessage = (error: unknown): string => {
  const code = (error as { code?: string })?.code ?? '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'Email is already registered';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed';
    case 'auth/cancelled-popup-request':
      return 'Only one popup request is allowed at a time';
    default:
      return (error as { message?: string })?.message ?? 'An error occurred';
  }
};

export const dispatchAuthUi = (
  dispatch: ActionDispatch,
  payload: { loading?: boolean; error?: string | null; success?: string | null },
): void => {
  dispatch({ action: 'auth/setUi', payload });
};

export const clearAuthSuccessLater = (dispatch: ActionDispatch, delayMs: number): void => {
  setTimeout(() => {
    dispatchAuthUi(dispatch, { success: null });
  }, delayMs);
};

export const dispatchActions = (dispatch: ActionDispatch, actions: Action<any>[]): void => {
  actions.forEach((action) => dispatch(action));
};
