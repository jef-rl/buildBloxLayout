import type { SelectorImpl } from '../../runtime/registries/selectors/selector-impl-registry';
import type { UIState } from '../../types/state';
import type { Panel } from '../../domains/panels/types';
import { isExpanderPanelOpen } from '../../../src/utils/expansion-helpers.js';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const resolveViewId = (view: Panel['view']): string | null => {
  return view?.component ?? (view as { viewType?: string })?.viewType ?? view?.id ?? null;
};

const resolvePanelViewId = (panel: Panel | null): string | null => {
  return panel?.activeViewId ?? panel?.viewId ?? resolveViewId(panel?.view ?? null);
};

export type WorkspacePanelEntry = {
  panel: Panel;
  viewId: string | null;
};

export type WorkspaceLayoutDerived = {
  expansion: UIState['layout']['expansion'];
  leftOpen: boolean;
  rightOpen: boolean;
  bottomOpen: boolean;
  leftWidth: string;
  rightWidth: string;
  bottomHeight: string;
  mainPanels: Panel[];
  mainPanelEntries: WorkspacePanelEntry[];
  mainPanelWidth: string;
  leftPanel: Panel | null;
  rightPanel: Panel | null;
  bottomPanel: Panel | null;
  leftViewOrder: string[];
  rightViewOrder: string[];
  bottomViewOrder: string[];
  showDropZones: boolean;
};

export const workspaceLayoutSelectorKey = 'selector:workspace/layout';

export const workspaceLayoutSelectorImpl: SelectorImpl<UIState, WorkspaceLayoutDerived> = (state) => {
  const layout = state.layout ?? {
    expansion: {
      expanderLeft: 'Closed',
      expanderRight: 'Closed',
      expanderBottom: 'Closed',
    },
    inDesign: false,
    viewportWidthMode: '1x',
    mainAreaCount: 1,
    mainViewOrder: [],
    leftViewOrder: [],
    rightViewOrder: [],
    bottomViewOrder: [],
    overlayView: null,
  };
  const expansion = layout.expansion ?? {
    expanderLeft: 'Closed',
    expanderRight: 'Closed',
    expanderBottom: 'Closed',
  };
  const panels = state.panels ?? [];

  const viewportMode = layout.viewportWidthMode ?? '1x';
  const viewportCount = Number.parseInt(viewportMode, 10);
  const viewportWidthMap: Record<string, string> = {
    '1x': '100%',
    '2x': '50%',
    '3x': '33.333%',
    '4x': '25%',
    '5x': '20%',
  };

  const leftOpen = isExpanderPanelOpen(expansion.expanderLeft);
  const rightOpen = isExpanderPanelOpen(expansion.expanderRight);
  const bottomOpen = isExpanderPanelOpen(expansion.expanderBottom);

  const leftWidth = leftOpen ? 'clamp(220px, 22vw, 360px)' : '0px';
  const rightWidth = rightOpen ? 'clamp(220px, 22vw, 360px)' : '0px';
  const bottomHeight = bottomOpen ? 'clamp(180px, 26vh, 320px)' : '0px';

  const mainPanels = panels.filter((panel) => panel.region === 'main');
  const totalMainPanels = mainPanels.length;
  const mainPanelWidth =
    viewportWidthMap[viewportMode] ??
    `${100 / clamp(Number.isFinite(viewportCount) ? viewportCount : (totalMainPanels || 1), 1, 5)}%`;

  const leftPanel = panels.find((panel) => panel.region === 'left') ?? null;
  const rightPanel = panels.find((panel) => panel.region === 'right') ?? null;
  const bottomPanel = panels.find((panel) => panel.region === 'bottom') ?? null;

  const leftViewOrder = layout.leftViewOrder || (leftPanel?.viewId ? [leftPanel.viewId] : []);
  const rightViewOrder = layout.rightViewOrder || (rightPanel?.viewId ? [rightPanel.viewId] : []);
  const bottomViewOrder = layout.bottomViewOrder || (bottomPanel?.viewId ? [bottomPanel.viewId] : []);

  const mainPanelEntries = mainPanels.map((panel) => ({
    panel,
    viewId: resolvePanelViewId(panel),
  }));

  const showDropZones = Boolean(layout.inDesign && state.auth?.isAdmin);

  return {
    expansion,
    leftOpen,
    rightOpen,
    bottomOpen,
    leftWidth,
    rightWidth,
    bottomHeight,
    mainPanels,
    mainPanelEntries,
    mainPanelWidth,
    leftPanel,
    rightPanel,
    bottomPanel,
    leftViewOrder,
    rightViewOrder,
    bottomViewOrder,
    showDropZones,
  };
};
