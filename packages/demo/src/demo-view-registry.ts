import type { SimpleViewConfig } from '@project/framework';
import {
  getVisualBlockViewConfig,
  getVisualBlockViewConfigs,
  getVisualBlockViewDefinitionSummaries,
  type VisualBlockViewId,
} from './visual-block/visual-block-view-registry';

export type DemoViewId = VisualBlockViewId;

export const getDemoViewConfig = (id: DemoViewId): SimpleViewConfig | null => {
  return getVisualBlockViewConfig(id);
};

export const getDemoViewConfigs = (): SimpleViewConfig[] => {
  return [...getVisualBlockViewConfigs()];
};

export const getDemoViewDefinitionSummaries = () => {
  return [...getVisualBlockViewDefinitionSummaries()];
};
