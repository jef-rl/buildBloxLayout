import { VisualBlockInspectorView } from '../../../playground/src/visual-block/inspector-view/visual-block-inspector.view';
import { VisualBlockProjectionView } from '../../../playground/src/visual-block/projection-view/visual-block-projection.view';
import { VisualBlockPreviewView } from '../../../playground/src/visual-block/visual-block-preview-view';
import { VisualBlockRenderView } from '../../../playground/src/visual-block/visual-block-render-view';
import { VisualBlockToolbarView } from '../../../playground/src/visual-block/visual-block-toolbar/visual-block-toolbar.view';

export const visualBlockViewComponents = {
  'visual-block-render': VisualBlockRenderView,
  'visual-block-preview': VisualBlockPreviewView,
  'visual-block-projection-view': VisualBlockProjectionView,
  'visual-block-inspector-view': VisualBlockInspectorView,
  'visual-block-toolbar': VisualBlockToolbarView,
} as const;
