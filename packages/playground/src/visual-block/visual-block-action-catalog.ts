export const VisualBlockActionCatalog = {
  VisualBlockDataSet: 'visual-block/dataSet',
  VisualBlockDataPatch: 'visual-block/dataPatch',
  VisualBlockUiSet: 'visual-block/uiSet',
  VisualBlockUiPatch: 'visual-block/uiPatch',
  VisualBlockZoomChanged: 'visual-block/zoomChanged',
  VisualBlockModeChanged: 'visual-block/modeChanged',
} as const;

export type VisualBlockActionName =
  (typeof VisualBlockActionCatalog)[keyof typeof VisualBlockActionCatalog];
