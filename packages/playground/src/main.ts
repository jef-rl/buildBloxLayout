import { bootstrapFramework } from '@project/framework';
import { DEMO_LAYOUT } from './data/demo-layout';

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
