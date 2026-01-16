import { bootstrapFramework, dispatchUiEvent } from '@project/framework';
import { DEMO_LAYOUT } from './data/demo-layout';

const loadSimpleView = () => import('./components/simple-view');
const loadLoginOverlay = () => import('./components/login-overlay');
const LOGIN_VIEW_ID = 'login-overlay';
const REQUIRED_FIREBASE_ENV = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
] as const;

const hasFirebaseConfig = REQUIRED_FIREBASE_ENV.every((key) => {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  return Boolean(value && value.trim().length > 0);
});

bootstrapFramework({
  views: [
    ...DEMO_LAYOUT.views.map((view) => ({
      id: view.id,
      name: view.name,
      title: view.name,
      tag: 'simple-view',
      component: loadSimpleView
    })),
    {
      id: LOGIN_VIEW_ID,
      name: 'Login',
      title: 'Login',
      tag: 'login-overlay',
      component: loadLoginOverlay
    }
  ],
  state: DEMO_LAYOUT
});

if (!hasFirebaseConfig) {
  dispatchUiEvent(window, 'auth/setUser', {
    user: { uid: 'demo-user', email: 'demo@local' }
  });
} else if (!DEMO_LAYOUT.auth?.isLoggedIn) {
  dispatchUiEvent(window, 'layout/setOverlayView', { viewId: LOGIN_VIEW_ID });
}
