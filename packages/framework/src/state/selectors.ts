import { UiState } from './ui-state';

export const getPanels = (state: UiState) => state.panels;
export const getViews = (state: UiState) => state.views;
export const getActiveView = (state: UiState) => state.activeView;
export const getDock = (state: UiState) => state.dock;
export const getTheme = (state: UiState) => state.theme;
export const getLayout = (state: UiState) => state.layout;
