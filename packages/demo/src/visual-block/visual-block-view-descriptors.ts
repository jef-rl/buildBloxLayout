export type VisualBlockViewDescriptor = {
  id: string;
  name: string;
  title: string;
  icon: string;
  tag: string;
  defaultContext?: Record<string, unknown>;
};

export const visualBlockViewDescriptors: VisualBlockViewDescriptor[] = [
  {
    id: 'visual-block-render',
    name: 'Visual Block Renderer',
    title: 'Visual Block Renderer',
    icon: 'view_compact',
    tag: 'visual-block-render',
    defaultContext: {},
  },
  {
    id: 'visual-block-preview',
    name: 'Visual Block Preview',
    title: 'Visual Block Preview',
    icon: 'view_in_ar',
    tag: 'visual-block-preview',
    defaultContext: {},
  },
  {
    id: 'visual-block-projection-view',
    name: 'Visual Block Projection',
    title: 'Visual Block Projection',
    icon: '3d_rotation',
    tag: 'visual-block-projection-view',
    defaultContext: {},
  },
  {
    id: 'visual-block-inspector-view',
    name: 'Visual Block Inspector',
    title: 'Visual Block Inspector',
    icon: 'fact_check',
    tag: 'visual-block-inspector-view',
    defaultContext: {},
  },
  {
    id: 'visual-block-toolbar',
    name: 'Visual Block Toolbar',
    title: 'Visual Block Toolbar',
    icon: 'build',
    tag: 'visual-block-toolbar',
    defaultContext: {},
  },
];
