/**
 * Default editor context: used before data loads.
 * Keeping this centralized prevents null-check clutter across components.
 */
export const DEFAULT_CONTEXT = {
  rects: {} as Record<string, any>,
  blockData: {} as Record<string, any>,
  gridConfig: {
    columns: 36,
    rowHeight: 15,
    padding: 50,
    stepX: 20,
    stepY: 15,
    gutter: 0,
    mode: 'design',
  },
  containerSize: { width: 800, height: 600 },
  mode: 'design',
  zoom: 1,
  selectedIds: [] as string[],
  blockId: '',
  rotationY: 25,
  viewState: { activeView: '', viewPayload: null, viewOptions: {} } as any,
};

export type UiEventDetail = { type: string; payload?: any };
