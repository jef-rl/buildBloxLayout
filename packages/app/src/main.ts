import { ViewRegistry } from '@project/framework';
import './app-root';

ViewRegistry.register({
  id: 'demo-view',
  name: 'Demo View',
  title: 'Demo View',
  tag: 'demo-view',
  component: () => import('./demo-view'),
});

const app = document.createElement('app-root');
document.body.appendChild(app);
