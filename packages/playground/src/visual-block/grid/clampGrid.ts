export type GridRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export const clampGrid = (rect: GridRect, columns: number): GridRect => {
  let { x, y, w, h } = rect;
  w = Math.max(1, Math.min(w, columns));
  x = Math.max(0, Math.min(x, columns - w));
  y = Math.max(0, y);
  h = Math.max(1, h);
  return { x, y, w, h };
};
