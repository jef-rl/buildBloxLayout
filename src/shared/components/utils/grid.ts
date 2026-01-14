export function clampGrid(rect: { x: number; y: number; w: number; h: number }, columns: number) {
  let { x, y, w, h } = rect;

  // Clamp width (1 to columns)
  w = Math.max(1, Math.min(w, columns));
  
  // Clamp X position (0 to columns - w)
  x = Math.max(0, Math.min(x, columns - w));
  
  // Clamp height (min 1)
  h = Math.max(1, h);
  
  // Clamp Y position (min 0)
  y = Math.max(0, y);

  return { x, y, w, h };
}
