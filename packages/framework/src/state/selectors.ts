import type { UIState } from '../types/index';

export const getPanels = (state: UIState) => state.panels;
export const getViews = (state: UIState) => state.views;
export const getActiveView = (state: UIState) => state.activeView;
export const getDock = (state: UIState) => state.dock;
export const getTheme = (state: UIState) => state.theme;
export const getLayout = (state: UIState) => state.layout;
export const getLayoutExpansion = (state: UIState) => state.layout.expansion;
export const getLayoutOverlayView = (state: UIState) => state.layout.overlayView;
export const getViewportWidthMode = (state: UIState) => state.layout.viewportWidthMode;
export const getLogs = (state: UIState) => state.logs;
