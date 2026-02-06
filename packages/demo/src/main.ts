import { Framework } from '@project/framework';
import { DEMO_LAYOUT_STATE } from './demo-layout';
import { getDemoViewConfigs } from './demo-view-registry';
import { registerVisualBlockDefinitions } from '../../playground/src/visual-block/register-visual-block';

const root = Framework.configure({
  initialState: DEMO_LAYOUT_STATE,
  logging: 'console',
})
  .registerViews(getDemoViewConfigs())
  .init();

registerVisualBlockDefinitions(root as any);

if (import.meta.env.DEV) {
  (window as any).__demoRoot = root;
  (window as any).__Framework = Framework;
}
