import { bootstrapFramework, dispatchUiEvent } from '@project/framework';
import { DEMO_LAYOUT } from './data/demo-layout';

const loadSimpleView = () => import('./components/simple-view');
const loadLoginOverlay = () => import('./components/login-overlay');
const LOGIN_VIEW_ID = 'login-overlay';

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

if (!DEMO_LAYOUT.auth?.isLoggedIn) {
  dispatchUiEvent(window, 'layout/setOverlayView', { viewId: LOGIN_VIEW_ID });
}
