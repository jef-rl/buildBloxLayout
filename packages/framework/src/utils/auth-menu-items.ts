import type { MenuItem, AuthUser, FrameworkAuthConfig, AuthState } from '../types/state';
import { ActionCatalog } from '../../nxt/runtime/actions/action-catalog';

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
): MenuItem[] => {
  if (!authConfig.enabled) {
    return [];
  }

  const authViewId = authConfig.authViewId ?? 'firebase-auth';
  const items: MenuItem[] = [];

  if (!authState.isLoggedIn) {
    // Show login action when logged out
    items.push({
      id: 'auth-login',
      type: 'action',
      label: 'Login',
      icon: 'login',
      actionType: ActionCatalog.LayoutSetOverlayView,
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
        actionType: ActionCatalog.LayoutToggleInDesign,
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
          actionType: ActionCatalog.LayoutSetOverlayView,
          payload: { viewId: authViewId },
          order: 0,
        },
        {
          id: 'auth-logout',
          type: 'action',
          label: 'Logout',
          icon: 'logout',
          actionType: ActionCatalog.AuthLogoutRequested,
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
