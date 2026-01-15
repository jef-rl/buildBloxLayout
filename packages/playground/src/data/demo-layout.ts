import { UIState } from '@project/framework';

export const DEMO_LAYOUT: UIState = {
  views: [
    { id: 'view-panel-a', viewType: 'simple-view', label: 'Label: Panel A', data: { label: 'Label: Panel A', color: '#ffcdd2' } },
    { id: 'view-panel-b', viewType: 'simple-view', label: 'Label: Panel B', data: { label: 'Label: Panel B', color: '#e1bee7' } },
    { id: 'view-panel-c', viewType: 'simple-view', label: 'Label: Panel C', data: { label: 'Label: Panel C', color: '#cfd8dc' } },
    { id: 'view-panel-d', viewType: 'simple-view', label: 'Label: Panel D', data: { label: 'Label: Panel D', color: '#c8e6c9' } },
    { id: 'view-unassigned-1', viewType: 'simple-view', label: 'Label: Unassigned 1', data: { label: 'Label: Unassigned 1', color: '#fff9c4' } },
    { id: 'view-unassigned-2', viewType: 'simple-view', label: 'Label: Unassigned 2', data: { label: 'Label: Unassigned 2', color: '#d1c4e9' } },
    { id: 'view-unassigned-3', viewType: 'simple-view', label: 'Label: Unassigned 3', data: { label: 'Label: Unassigned 3', color: '#b2dfdb' } },
    { id: 'view-unassigned-4', viewType: 'simple-view', label: 'Label: Unassigned 4', data: { label: 'Label: Unassigned 4', color: '#ffccbc' } },
    { id: 'view-unassigned-5', viewType: 'simple-view', label: 'Label: Unassigned 5', data: { label: 'Label: Unassigned 5', color: '#bbdefb' } },
    { id: 'view-unassigned-6', viewType: 'simple-view', label: 'Label: Unassigned 6', data: { label: 'Label: Unassigned 6', color: '#f8bbd0' } },
    { id: 'view-unassigned-7', viewType: 'simple-view', label: 'Label: Unassigned 7', data: { label: 'Label: Unassigned 7', color: '#c5cae9' } },
    { id: 'view-unassigned-8', viewType: 'simple-view', label: 'Label: Unassigned 8', data: { label: 'Label: Unassigned 8', color: '#dcedc8' } },
    { id: 'view-unassigned-9', viewType: 'simple-view', label: 'Label: Unassigned 9', data: { label: 'Label: Unassigned 9', color: '#ffe0b2' } },
    { id: 'view-unassigned-10', viewType: 'simple-view', label: 'Label: Unassigned 10', data: { label: 'Label: Unassigned 10', color: '#b3e5fc' } }
  ],
  panels: {
    'p1': { id: 'p1', viewId: 'view-panel-a', viewType: 'simple-view', title: 'Sidebar', data: { label: 'Label: Panel A', color: '#ffcdd2' } },
    'p2': { id: 'p2', viewId: 'view-panel-b', viewType: 'simple-view', title: 'Main Editor', data: { label: 'Label: Panel B', color: '#e1bee7' } },
    'p3': { id: 'p3', viewId: 'view-panel-c', viewType: 'simple-view', title: 'Console', data: { label: 'Label: Panel C', color: '#cfd8dc' } },
    'p4': { id: 'p4', viewId: 'view-panel-d', viewType: 'simple-view', title: 'Tools', data: { label: 'Label: Panel D', color: '#c8e6c9' } }
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
