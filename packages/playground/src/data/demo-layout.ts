import type { MainAreaPanelCount, Panel, UIState, View } from '@project/framework';

const MAIN_VIEWS: View[] = [
  {
    id: 'view-main-1',
    name: 'Main Panel 1',
    component: 'view-main-1',
    data: { label: 'Main Panel 1', color: '#ffcdd2' }
  },
  {
    id: 'view-main-2',
    name: 'Main Panel 2',
    component: 'view-main-2',
    data: { label: 'Main Panel 2', color: '#e1bee7' }
  },
  {
    id: 'view-main-3',
    name: 'Main Panel 3',
    component: 'view-main-3',
    data: { label: 'Main Panel 3', color: '#cfd8dc' }
  },
  {
    id: 'view-main-4',
    name: 'Main Panel 4',
    component: 'view-main-4',
    data: { label: 'Main Panel 4', color: '#c8e6c9' }
  },
  {
    id: 'view-main-5',
    name: 'Main Panel 5',
    component: 'view-main-5',
    data: { label: 'Main Panel 5', color: '#bbdefb' }
  }
];

const EXTRA_VIEWS: View[] = [
  {
    id: 'view-extra-1',
    name: 'Extra View 1',
    component: 'view-extra-1',
    data: { label: 'Extra View 1', color: '#fff9c4' }
  },
  {
    id: 'view-extra-2',
    name: 'Extra View 2',
    component: 'view-extra-2',
    data: { label: 'Extra View 2', color: '#d1c4e9' }
  },
  {
    id: 'view-extra-3',
    name: 'Extra View 3',
    component: 'view-extra-3',
    data: { label: 'Extra View 3', color: '#b2dfdb' }
  },
  {
    id: 'view-extra-4',
    name: 'Extra View 4',
    component: 'view-extra-4',
    data: { label: 'Extra View 4', color: '#ffccbc' }
  },
  {
    id: 'view-extra-5',
    name: 'Extra View 5',
    component: 'view-extra-5',
    data: { label: 'Extra View 5', color: '#f8bbd0' }
  },
  {
    id: 'view-extra-6',
    name: 'Extra View 6',
    component: 'view-extra-6',
    data: { label: 'Extra View 6', color: '#c5cae9' }
  },
  {
    id: 'view-extra-7',
    name: 'Extra View 7',
    component: 'view-extra-7',
    data: { label: 'Extra View 7', color: '#dcedc8' }
  },
  {
    id: 'view-extra-8',
    name: 'Extra View 8',
    component: 'view-extra-8',
    data: { label: 'Extra View 8', color: '#ffe0b2' }
  },
  {
    id: 'view-extra-9',
    name: 'Extra View 9',
    component: 'view-extra-9',
    data: { label: 'Extra View 9', color: '#b3e5fc' }
  },
  {
    id: 'view-extra-10',
    name: 'Extra View 10',
    component: 'view-extra-10',
    data: { label: 'Extra View 10', color: '#f0f4c3' }
  }
];

const MAIN_PANELS: Panel[] = MAIN_VIEWS.map((view, index) => ({
  id: `panel-main-${index + 1}`,
  name: `Main Panel ${index + 1}`,
  region: 'main',
  viewId: view.id,
  view
}));

const EXPANSION_PANELS: Panel[] = [
  {
    id: 'panel-expansion-left',
    name: 'Left Expansion Panel',
    region: 'left',
    viewId: EXTRA_VIEWS[0].id,
    view: EXTRA_VIEWS[0]
  },
  {
    id: 'panel-expansion-right',
    name: 'Right Expansion Panel',
    region: 'right',
    viewId: EXTRA_VIEWS[1].id,
    view: EXTRA_VIEWS[1]
  },
  {
    id: 'panel-expansion-bottom',
    name: 'Bottom Expansion Panel',
    region: 'bottom',
    viewId: EXTRA_VIEWS[2].id,
    view: EXTRA_VIEWS[2]
  }
];

export const DEMO_LAYOUT: UIState = {
  containers: [
    {
      id: 'container-main',
      name: 'Main Area',
      direction: 'row',
      panels: MAIN_PANELS
    },
    {
      id: 'container-expansion-left',
      name: 'Left Expansion Area',
      direction: 'column',
      panels: [EXPANSION_PANELS[0]]
    },
    {
      id: 'container-expansion-right',
      name: 'Right Expansion Area',
      direction: 'column',
      panels: [EXPANSION_PANELS[1]]
    },
    {
      id: 'container-expansion-bottom',
      name: 'Bottom Expansion Area',
      direction: 'row',
      panels: [EXPANSION_PANELS[2]]
    }
  ],
  panels: [...MAIN_PANELS, ...EXPANSION_PANELS],
  views: [...MAIN_VIEWS, ...EXTRA_VIEWS],
  layout: {
    expansion: {
      left: false,
      right: false,
      bottom: false
    },
    overlayView: null,
    viewportWidthMode: 'auto',
    mainAreaCount: MAIN_PANELS.length as MainAreaPanelCount,
    mainViewOrder: MAIN_VIEWS.map(v => v.id)
  },
  toolbars: {
    positions: {},
    activePicker: null
  },
  activeView: MAIN_VIEWS[0].id,
  dock: {},
  theme: {},
  auth: {
    isLoggedIn: true,
    user: null
  }
};
