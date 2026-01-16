import { bootstrapFramework } from '@project/framework';
import { DEMO_LAYOUT } from './data/demo-layout';
import './components/login-overlay';

const loadSimpleView = () => import('./components/simple-view');

bootstrapFramework({
  views: DEMO_LAYOUT.views.map((view) => ({
    id: view.id,
    name: view.name,
    title: view.name,
    tag: 'simple-view',
    component: loadSimpleView
  })),
  state: DEMO_LAYOUT
});

if (!document.querySelector('login-overlay')) {
  document.body.appendChild(document.createElement('login-overlay'));
}
