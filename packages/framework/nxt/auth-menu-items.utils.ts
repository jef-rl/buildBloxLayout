import { FrameworkAuthConfig, AuthState, FrameworkMenuItem } from "./state.types";

/**
 * Generate authentication-related menu items based on auth state
 *
 * When logged out:
 * - Login action
 *
 * When logged in:
 * - View Profile action
 * - Logout action (in submenu)
 */
export const generateAuthMenuItems = (
  authConfig: FrameworkAuthConfig,
  authState: AuthState
): FrameworkMenuItem[] => {
  if (!authConfig.enabled) {
    return [];
  }

  const authViewId = authConfig.authViewId ?? 'firebase-auth';
  const items: FrameworkMenuItem[] = [];

  if (!authState.isLoggedIn) {
    // Show login action when logged out
    items.push({
      id: 'auth-login',
      type: 'action',
      label: 'Login',
      icon: 'login',
      actionType: 'layout/setOverlayView',
      payload: { viewId: authViewId },
      order: 0,
    });
  } else {
    if (authState.isAdmin) {
      items.push({
        id: 'admin-designer',
        type: 'action',
        label: 'Designer',
        icon: 'designer',
        actionType: 'layout/toggleInDesign',
        payload: {
          overlayViewId: 'visual-editor',
        },
        order: 0,
      });
    }

    // Show profile and logout when logged in
    const userEmail = authState.user?.email ?? 'User';

    items.push({
      id: 'auth-profile',
      type: 'parent',
      label: userEmail,
      icon: 'account_circle',
      order: authState.isAdmin ? 1 : 0,
      children: [
        {
          id: 'auth-view-profile',
          type: 'action',
          label: 'View Profile',
          icon: 'person',
          actionType: 'layout/setOverlayView',
          payload: { viewId: authViewId },
          order: 0,
        },
        {
          id: 'auth-logout',
          type: 'action',
          label: 'Logout',
          icon: 'logout',
          actionType: 'auth/logoutRequested',
          payload: {},
          order: 1,
        },
      ],
    });
  }

  return items;
};

/**
 * Check if authentication is required to show immediately on startup
 */
export const shouldShowAuthOnStartup = (
  authConfig: FrameworkAuthConfig | null,
  authState: AuthState
): boolean => {
  if (!authConfig?.enabled) {
    return false;
  }

  return authConfig.autoShowOnStartup === true && !authState.isLoggedIn;
};
