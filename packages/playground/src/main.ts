import { uiState, viewRegistry as ViewRegistry } from '@project/framework';
import { DEMO_LAYOUT } from './data/demo-layout';

const loadSimpleView = () => import('./components/simple-view');
const loadLoginView = () => import('./components/login-overlay');

// 1. Register the component available in the playground
ViewRegistry.register({
  id: 'login-view',
  name: 'Login',
  title: 'Login',
  tag: 'login-overlay',
  component: loadLoginView
});

DEMO_LAYOUT.views.forEach((view) => {
  if (view.id === 'login-view') {
    return;
  }
  ViewRegistry.register({
    id: view.id,
    name: view.name,
    title: view.name,
    tag: 'simple-view',
    component: loadSimpleView
  });
});

// 2. Initialize the UI State Store with the demo layout
uiState.update(DEMO_LAYOUT);

// 3. Mount the root workspace component to the DOM
const root = document.createElement('workspace-root');
document.body.append(root);
