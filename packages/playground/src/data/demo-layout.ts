import { UIState } from '@project/framework';

export const DEMO_LAYOUT: UIState = {
  panels: {
    'p1': { id: 'p1', viewType: 'simple-view', title: 'Sidebar', data: { label: 'LEFT SIDEBAR', color: '#ffcdd2' } },
    'p2': { id: 'p2', viewType: 'simple-view', title: 'Main Editor', data: { label: 'MAIN CONTENT', color: '#e1bee7' } },
    'p3': { id: 'p3', viewType: 'simple-view', title: 'Console', data: { label: 'OUTPUT LOGS', color: '#cfd8dc' } },
    'p4': { id: 'p4', viewType: 'simple-view', title: 'Tools', data: { label: 'TOOLBOX', color: '#c8e6c9' } }
  },
  layout: {
    root: {
      type: 'split',
      direction: 'horizontal',
      children: [
        { type: 'leaf', panelId: 'p1', size: 20 },
        {
          type: 'split',
          direction: 'vertical',
          size: 80,
          children: [
            { type: 'leaf', panelId: 'p2', size: 75 },
            {
              type: 'split',
              direction: 'horizontal',
              size: 25,
              children: [
                { type: 'leaf', panelId: 'p3', size: 60 },
                { type: 'leaf', panelId: 'p4', size: 40 }
              ]
            }
          ]
        }
      ]
    }
  },
  toolbars: {}
};
