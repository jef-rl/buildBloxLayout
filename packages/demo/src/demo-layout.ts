import type { Panel, UIState, View } from '@project/framework';
import type { VisualBlockDataState } from '../../playground/src/visual-block/state/visual-block-data-state';
import { getDemoViewDefinitionSummaries } from './demo-view-registry';

const VISUAL_BLOCK_VIEW_DEFINITION_ID = 'visual-block-render';
const VISUAL_BLOCK_VIEW_ID = 'visual-block-canvas';

const DEMO_VIEWS: View[] = [
  {
    id: VISUAL_BLOCK_VIEW_ID,
    name: 'Visual Block Canvas',
    component: VISUAL_BLOCK_VIEW_DEFINITION_ID,
    data: {},
  },
];

const DEMO_PANELS: Panel[] = [
  {
    id: 'panel-main',
    name: 'Visual Block',
    region: 'main',
    viewId: VISUAL_BLOCK_VIEW_ID,
    view: DEMO_VIEWS[0],
  },
];

const VISUAL_BLOCK_DATA: VisualBlockDataState = {
  layouts: {
    'demo-layout': {
      columns: 12,
      maxWidth: 900,
      positions: [
        {
          _positionID: 'position-hero',
          _contentID: 'content-hero',
          x: 0,
          y: 0,
          w: 6,
          h: 8,
        },
        {
          _positionID: 'position-detail',
          _contentID: 'content-detail',
          x: 6,
          y: 0,
          w: 6,
          h: 8,
        },
      ],
      styler: {
        backgroundColor: '#0f172a',
        borderRadius: '16px',
      },
    },
  },
  rects: {
    'position-hero': {
      _positionID: 'position-hero',
      _contentID: 'content-hero',
      x: 0,
      y: 0,
      w: 6,
      h: 8,
    },
    'position-detail': {
      _positionID: 'position-detail',
      _contentID: 'content-detail',
      x: 6,
      y: 0,
      w: 6,
      h: 8,
    },
  },
  contents: {
    'content-hero': {
      _contentID: 'content-hero',
      type: 'text',
      ui: { content: 'Visual Block Demo' },
      styler: {
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        padding: '18px',
        borderRadius: '12px',
        fontSize: '20px',
        fontWeight: 600,
        display: 'grid',
        placeItems: 'center',
      },
    },
    'content-detail': {
      _contentID: 'content-detail',
      type: 'text',
      ui: { content: 'Rendered via the demo view registry' },
      styler: {
        backgroundColor: '#111827',
        color: '#93c5fd',
        padding: '18px',
        borderRadius: '12px',
        fontSize: '16px',
        display: 'grid',
        placeItems: 'center',
      },
    },
  },
  activeLayoutId: 'demo-layout',
};

export const DEMO_LAYOUT_STATE: Partial<UIState> = {
  containers: [
    {
      id: 'container-main',
      name: 'Main Area',
      direction: 'row',
      panels: DEMO_PANELS,
    },
  ],
  panels: DEMO_PANELS,
  views: DEMO_VIEWS,
  viewInstances: {},
  viewDefinitions: getDemoViewDefinitionSummaries(),
  viewInstanceCounter: 0,
  layout: {
    expansion: {
      expanderLeft: 'Closed',
      expanderRight: 'Closed',
      expanderBottom: 'Closed',
    },
    overlayView: null,
    inDesign: false,
    viewportWidthMode: '1x',
    mainAreaCount: 1,
    mainViewOrder: [VISUAL_BLOCK_VIEW_ID],
    leftViewOrder: [],
    rightViewOrder: [],
    bottomViewOrder: [],
  },
  auth: {
    isLoggedIn: false,
    isAdmin: false,
    user: null,
  },
  authUi: {
    loading: false,
    error: null,
    success: null,
  },
  panelState: {
    open: {},
    data: {},
    errors: {},
  },
  logs: {
    entries: [],
    maxEntries: 100,
  },
  visualBlockData: VISUAL_BLOCK_DATA,
};
