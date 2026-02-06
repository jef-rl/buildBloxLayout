import type { SimpleViewConfig } from '@project/framework';
import { visualBlockViewDescriptors } from './visual-block-view-descriptors';
import { visualBlockViewComponents } from './visual-block-view-components';

export type VisualBlockViewId = (typeof visualBlockViewDescriptors)[number]['id'];

const descriptorMap = new Map(visualBlockViewDescriptors.map((descriptor) => [descriptor.id, descriptor]));

export const getVisualBlockViewDescriptor = (id: VisualBlockViewId) => {
  return descriptorMap.get(id) ?? null;
};

export const getVisualBlockViewConfig = (id: VisualBlockViewId): SimpleViewConfig | null => {
  const descriptor = getVisualBlockViewDescriptor(id);
  if (!descriptor) {
    return null;
  }

  const component = visualBlockViewComponents[id];
  if (!component) {
    return null;
  }

  return {
    id: descriptor.id,
    name: descriptor.name,
    title: descriptor.title,
    icon: descriptor.icon,
    tag: descriptor.tag,
    defaultContext: descriptor.defaultContext,
    component,
  };
};

export const getVisualBlockViewConfigs = (): SimpleViewConfig[] =>
  visualBlockViewDescriptors
    .map((descriptor) => getVisualBlockViewConfig(descriptor.id as VisualBlockViewId))
    .filter((config): config is SimpleViewConfig => Boolean(config));

export const getVisualBlockViewDefinitionSummaries = () =>
  visualBlockViewDescriptors.map(({ id, name, title, icon }) => ({
    id,
    name,
    title,
    icon,
  }));
