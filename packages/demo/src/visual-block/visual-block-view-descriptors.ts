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
];
