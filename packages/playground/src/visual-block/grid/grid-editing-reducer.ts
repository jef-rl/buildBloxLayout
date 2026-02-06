import type { VisualBlockRectDto } from '../dto/visual-block-rect.dto';
import { clampGrid } from './clampGrid';

export type GridConfig = {
  columns: number;
};

export type DragDelta = {
  dx: number;
  dy: number;
};

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export type ResizeDelta = {
  dx: number;
  dy: number;
  handle: ResizeHandle;
};

export type SelectionModifiers = {
  isMulti: boolean;
};

export const applyRectPatch = (
  rect: VisualBlockRectDto,
  patch: Partial<VisualBlockRectDto>,
): VisualBlockRectDto => ({
  ...rect,
  ...patch,
});

export const updateSelectionOnClick = (
  currentSelection: string[],
  clickedId: string | null,
  modifiers: SelectionModifiers,
): string[] => {
  if (!clickedId) {
    return modifiers.isMulti ? [...currentSelection] : [];
  }

  if (modifiers.isMulti) {
    if (currentSelection.includes(clickedId)) {
      return currentSelection.filter((id) => id !== clickedId);
    }
    return [...currentSelection, clickedId];
  }

  return [clickedId];
};

const resolveSelection = (rects: VisualBlockRectDto[], selectionIds: string[]): VisualBlockRectDto[] => {
  if (selectionIds.length === 0) {
    return [];
  }
  const selection = new Set(selectionIds);
  return rects.filter((rect) => selection.has(rect._positionID));
};

const clampDragDelta = (rects: VisualBlockRectDto[], delta: DragDelta, columns: number): DragDelta => {
  if (rects.length === 0) {
    return { dx: 0, dy: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;

  rects.forEach((rect) => {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.w);
  });

  let dx = delta.dx;
  let dy = delta.dy;

  if (minX + dx < 0) {
    dx = -minX;
  }
  if (maxX + dx > columns) {
    dx = columns - maxX;
  }
  if (minY + dy < 0) {
    dy = -minY;
  }

  return { dx, dy };
};

export const updateRectsOnDrag = (
  rects: VisualBlockRectDto[],
  selectionIds: string[],
  dragDelta: DragDelta,
  gridConfig: GridConfig,
): VisualBlockRectDto[] => {
  const selected = resolveSelection(rects, selectionIds);
  if (selected.length === 0) {
    return rects.map((rect) => ({ ...rect }));
  }

  const constrainedDelta = clampDragDelta(selected, dragDelta, gridConfig.columns);
  const selection = new Set(selectionIds);

  return rects.map((rect) => {
    if (!selection.has(rect._positionID)) {
      return { ...rect };
    }
    const nextRect = {
      ...rect,
      x: rect.x + constrainedDelta.dx,
      y: rect.y + constrainedDelta.dy,
    };
    return {
      ...rect,
      ...clampGrid(nextRect, gridConfig.columns),
    };
  });
};

const resizeRect = (
  rect: VisualBlockRectDto,
  delta: DragDelta,
  handle: ResizeHandle,
): VisualBlockRectDto => {
  let { x, y, w, h } = rect;

  if (handle.includes('e')) {
    w = w + delta.dx;
  }
  if (handle.includes('w')) {
    const diff = Math.min(w - 1, delta.dx);
    w = w - diff;
    x = x + diff;
  }
  if (handle.includes('s')) {
    h = h + delta.dy;
  }
  if (handle.includes('n')) {
    const diff = Math.min(h - 1, delta.dy);
    h = h - diff;
    y = y + diff;
  }

  return {
    ...rect,
    x,
    y,
    w,
    h,
  };
};

export const updateRectsOnResize = (
  rects: VisualBlockRectDto[],
  selectionIds: string[],
  resizeDelta: ResizeDelta,
  gridConfig: GridConfig,
): VisualBlockRectDto[] => {
  const selection = new Set(selectionIds);
  const { dx, dy, handle } = resizeDelta;

  return rects.map((rect) => {
    if (!selection.has(rect._positionID)) {
      return { ...rect };
    }
    const resized = resizeRect(rect, { dx, dy }, handle);
    return {
      ...rect,
      ...clampGrid(resized, gridConfig.columns),
    };
  });
};
