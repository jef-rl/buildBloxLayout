export const DEFAULT_VISUAL_BLOCK_DATA = {
  blockId: 'starter-block',
  styler: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  container: {
    styler: {
      backgroundColor: '#0b1120',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(15, 23, 42, 0.35)',
    },
  },
  layout_lg: {
    columns: 24,
    rowHeight: 18,
    padding: 32,
    stepX: 24,
    stepY: 18,
    positions: [
      { _positionID: 'hero', _contentID: 'hero-content', x: 0, y: 0, w: 24, h: 7, z: 0 },
      { _positionID: 'cta', _contentID: 'cta-content', x: 1, y: 7, w: 10, h: 4, z: 1 },
      { _positionID: 'feature', _contentID: 'feature-content', x: 12, y: 7, w: 11, h: 6, z: 2 },
    ],
    styler: {
      backgroundColor: '#0f172a',
      borderRadius: '20px',
    },
  },
  'hero-content': {
    type: 'text',
    ui: {
      content: '<h1 style="margin:0;font-size:32px;">Build layouts in blocks</h1><p style="margin:8px 0 0;">Arrange, refine, and preview component grids in real time.</p>',
    },
    styler: {
      backgroundColor: '#111827',
      color: '#e2e8f0',
      padding: '24px',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  },
  'cta-content': {
    type: 'text',
    ui: {
      content: '<strong style="font-size:18px;">Get Started</strong><br/>Preview your next layout',
    },
    styler: {
      backgroundColor: '#6366f1',
      color: 'white',
      padding: '16px',
      borderRadius: '12px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      boxShadow: '0 10px 18px rgba(99, 102, 241, 0.3)',
    },
  },
  'feature-content': {
    type: 'text',
    ui: {
      content: '<h3 style="margin:0 0 8px;">Live Preview</h3><p style="margin:0;">Switch between design, render, and projection modes instantly.</p>',
    },
    styler: {
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
      padding: '20px',
      borderRadius: '14px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  },
} as const;

export const serializeVisualBlockData = (data: Record<string, unknown>) => JSON.stringify(data ?? {}, null, 2);
